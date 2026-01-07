"""Vector store for semantic search and RAG (Redis Stack)"""
import logging
from typing import List, Dict, Optional, Tuple
import os
import numpy as np
from redis import Redis
from redis.exceptions import ResponseError
from redis.commands.search.field import TextField, NumericField, VectorField, TagField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType
from redis.commands.search.query import Query
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class VectorStore:
    """Vector database for storing and searching embeddings using Redis Stack"""

    def __init__(self, index_name: str = "idx:syllabi", key_prefix: str = "vs:chunk:"):
        """Initialize Redis-based vector store and ensure index exists"""
        self.index_name = index_name
        self.key_prefix = key_prefix

        # Redis connection from environment
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", "6379"))
        redis_db = int(os.getenv("REDIS_DB", "0"))
        self.redis = Redis(host=redis_host, port=redis_port, db=redis_db)

        # Embedding model (CPU)
        self.embedding_model = SentenceTransformer(
            'sentence-transformers/all-MiniLM-L6-v2',
            device='cpu'
        )

        # Ensure RediSearch index exists
        self._ensure_index()
        logger.info("Redis VectorStore initialized and index ready")
    
    def create_collection(self, collection_name: str, metadata: Optional[Dict] = None) -> None:
        """No-op for Redis; index is global. Collections are filtered by `syllabus_id`."""
        # Ensure index is present (idempotent)
        self._ensure_index()
        logger.info(f"Collection (filter) ready: {collection_name}")

    def _ensure_index(self) -> None:
        """Create RediSearch index if missing"""
        try:
            # If info succeeds, index exists
            self.redis.ft(self.index_name).info()
            return
        except ResponseError:
            pass
        except Exception as e:
            logger.warning(f"Index check failed: {e}")

        # Define schema: content text + tags for exact filters + numeric + vector
        dim = 384
        schema = [
            TextField("content"),
            TagField("syllabus_id"),
            TagField("subject"),
            TagField("file_name"),
            NumericField("chunk_index"),
            VectorField(
                "embedding",
                "HNSW",
                {
                    "TYPE": "FLOAT32",
                    "DIM": dim,
                    "DISTANCE_METRIC": "COSINE",
                    "M": 16,
                    "EF_CONSTRUCTION": 200,
                    "EF_RUNTIME": 64,
                },
            ),
        ]

        definition = IndexDefinition(prefix=[self.key_prefix], index_type=IndexType.HASH)
        try:
            self.redis.ft(self.index_name).create_index(schema, definition=definition)
            logger.info(f"Created RediSearch index: {self.index_name}")
        except Exception as e:
            logger.error(f"Failed to create RediSearch index {self.index_name}: {e}")
            raise
    
    def add_documents(
        self,
        collection_name: str,
        documents: List[str],
        metadatas: List[Dict],
        ids: List[str]
    ) -> None:
        """Add documents as Redis hashes with vector embeddings"""
        try:
            # Generate embeddings (float32 bytes)
            vectors = self.embedding_model.encode(documents, show_progress_bar=True)
            vectors = np.asarray(vectors, dtype=np.float32)

            pipe = self.redis.pipeline(transaction=False)
            for i, doc in enumerate(documents):
                meta = metadatas[i] if i < len(metadatas) else {}
                doc_id = ids[i] if i < len(ids) else f"doc:{i}"
                key = f"{self.key_prefix}{doc_id}"

                mapping = {
                    "content": doc,
                    "syllabus_id": str(meta.get("syllabus_id", "")),
                    "subject": str(meta.get("subject", "")),
                    "file_name": str(meta.get("file_name", "")),
                    "chunk_index": int(meta.get("chunk_index", i)),
                    "embedding": vectors[i].tobytes(),
                }
                pipe.hset(key, mapping=mapping)

            pipe.execute()
            logger.info(f"Added {len(documents)} documents to Redis index via {collection_name}")
        except Exception as e:
            logger.error(f"Error adding documents to {collection_name}: {e}")
            raise
    
    def search(
        self,
        collection_name: str,
        query: str,
        top_k: int = 5,
        where: Optional[Dict] = None
    ) -> List[Dict]:
        """KNN search using RediSearch HNSW index"""
        try:
            # Encode query to vector bytes
            qvec = self.embedding_model.encode([query])
            qvec = np.asarray(qvec, dtype=np.float32)[0].tobytes()

            # Optional filters
            filter_clauses = []
            if where:
                if "syllabus_id" in where and where["syllabus_id"]:
                    sid = str(where["syllabus_id"]).replace(',', '\,')
                    filter_clauses.append(f"@syllabus_id:{{{sid}}}")
                if "subject" in where and where["subject"]:
                    subj = str(where["subject"]).replace(',', '\,')
                    filter_clauses.append(f"@subject:{{{subj}}}")

            base_query = " ".join(filter_clauses) if filter_clauses else "*"

            knn = f"=>[KNN {top_k} @embedding $vec AS score]"
            q = Query(base_query + knn)
            q = q.return_fields("content", "syllabus_id", "subject", "file_name", "chunk_index", "score")
            q = q.sort_by("score")
            q = q.paging(0, top_k)
            q = q.dialect(2)

            res = self.redis.ft(self.index_name).search(q, query_params={"vec": qvec})

            formatted_results = []
            for doc in res.docs:
                # RediSearch returns lower score for better match with cosine
                formatted_results.append({
                    "id": getattr(doc, "id", None),
                    "content": getattr(doc, "content", ""),
                    "metadata": {
                        "syllabus_id": getattr(doc, "syllabus_id", None),
                        "subject": getattr(doc, "subject", None),
                        "file_name": getattr(doc, "file_name", None),
                        "chunk_index": int(getattr(doc, "chunk_index", 0)),
                    },
                    "distance": float(getattr(doc, "score", 0.0)),
                })

            return formatted_results
        except Exception as e:
            logger.error(f"Error searching {collection_name}: {e}")
            return []
    
    def delete_collection(self, collection_name: str) -> None:
        """Delete all documents with matching `syllabus_id`"""
        try:
            sid = collection_name.replace("syllabus_", "")
            # Scan keys by prefix and delete those matching HGET syllabus_id == sid
            cursor = 0
            keys_to_delete = []
            while True:
                cursor, keys = self.redis.scan(cursor=cursor, match=f"{self.key_prefix}*")
                for k in keys:
                    try:
                        if self.redis.hget(k, "syllabus_id") == sid.encode():
                            keys_to_delete.append(k)
                    except Exception:
                        continue
                if cursor == 0:
                    break
            if keys_to_delete:
                self.redis.delete(*keys_to_delete)
            logger.info(f"Deleted {len(keys_to_delete)} documents for syllabus {sid}")
        except Exception as e:
            logger.error(f"Error deleting collection {collection_name}: {e}")
    
    def list_collections(self) -> List[str]:
        """List distinct syllabus collections by scanning keys"""
        try:
            cursor = 0
            syllabus_ids = set()
            while True:
                cursor, keys = self.redis.scan(cursor=cursor, match=f"{self.key_prefix}*")
                for k in keys:
                    try:
                        sid_bytes = self.redis.hget(k, "syllabus_id")
                        if sid_bytes:
                            sid = sid_bytes.decode()
                            syllabus_ids.add(f"syllabus_{sid}")
                    except Exception:
                        continue
                if cursor == 0:
                    break
            return sorted(list(syllabus_ids))
        except Exception as e:
            logger.error(f"Error listing collections: {e}")
            return []
    
    def get_collection_size(self, collection_name: str) -> int:
        """Count documents with matching `syllabus_id`"""
        try:
            sid = collection_name.replace("syllabus_", "")
            count = 0
            cursor = 0
            while True:
                cursor, keys = self.redis.scan(cursor=cursor, match=f"{self.key_prefix}*")
                for k in keys:
                    try:
                        if self.redis.hget(k, "syllabus_id") == sid.encode():
                            count += 1
                    except Exception:
                        continue
                if cursor == 0:
                    break
            return count
        except Exception as e:
            logger.error(f"Error getting collection size: {e}")
            return 0


class RAGService:
    """Retrieval-Augmented Generation service"""
    
    def __init__(self, vector_store: VectorStore):
        """
        Initialize RAG service
        
        Args:
            vector_store: VectorStore instance
        """
        self.vector_store = vector_store
    
    def setup_syllabus_collection(self, collection_name: str = "syllabi") -> None:
        """
        Setup collection for syllabus documents
        
        Args:
            collection_name: Name of collection
        """
        self.vector_store.create_collection(
            collection_name=collection_name,
            metadata={
                "type": "syllabi",
                "description": "Syllabus documents with semantic search"
            }
        )
    
    def add_syllabus(
        self,
        collection_name: str,
        syllabus_id: str,
        title: str,
        content: str,
        chunks: List[Dict],
        subject: str = None,
        program: str = None
    ) -> None:
        """
        Add syllabus document to RAG collection
        
        Args:
            collection_name: Collection name
            syllabus_id: Unique ID for syllabus
            title: Syllabus title
            content: Full text content
            chunks: Pre-chunked content
            subject: Subject area
            program: Program name
        """
        documents = []
        metadatas = []
        ids = []
        
        for chunk in chunks:
            doc_id = f"{syllabus_id}_chunk_{chunk['index']}"
            
            documents.append(chunk['content'])
            metadatas.append({
                "syllabus_id": syllabus_id,
                "title": title,
                "subject": subject or "Unknown",
                "program": program or "Unknown",
                "chunk_index": chunk['index'],
                "full_content": content[:500]  # Store preview
            })
            ids.append(doc_id)
        
        self.vector_store.add_documents(
            collection_name=collection_name,
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        logger.info(f"Added syllabus {syllabus_id} with {len(chunks)} chunks")
    
    def retrieve_context(
        self,
        collection_name: str,
        query: str,
        top_k: int = 3,
        max_chars: int = 2000
    ) -> Tuple[str, List[Dict]]:
        """
        Retrieve relevant context for a query
        
        Args:
            collection_name: Collection name
            query: Search query
            top_k: Number of chunks to retrieve
            max_chars: Maximum characters in context
            
        Returns:
            Tuple of (context_text, sources_metadata)
        """
        # Search for relevant chunks
        results = self.vector_store.search(
            collection_name=collection_name,
            query=query,
            top_k=top_k
        )
        
        # Build context
        context_parts = []
        sources = []
        total_chars = 0
        
        for result in results:
            if total_chars < max_chars:
                context_parts.append(result['content'])
                total_chars += len(result['content'])
                
                sources.append({
                    "syllabus_id": result['metadata'].get('syllabus_id'),
                    "title": result['metadata'].get('title'),
                    "subject": result['metadata'].get('subject'),
                    "relevance": 1.0 - (result['distance'] or 0)
                })
        
        context = "\n\n".join(context_parts)
        
        return context, sources
    
    def augment_prompt(
        self,
        collection_name: str,
        user_query: str,
        system_prompt: str = None
    ) -> Tuple[str, List[Dict]]:
        """
        Augment user query with retrieved context
        
        Args:
            collection_name: Collection name
            user_query: User's question
            system_prompt: Optional system prompt prefix
            
        Returns:
            Tuple of (augmented_prompt, sources)
        """
        # Retrieve context
        context, sources = self.retrieve_context(
            collection_name=collection_name,
            query=user_query,
            top_k=3
        )
        
        if not context:
            # No context found
            augmented = f"Câu hỏi: {user_query}\n\nLưu ý: Không tìm được tài liệu liên quan."
        else:
            augmented = f"""Dựa trên thông tin sau:

--- THÔNG TIN LIÊN QUAN ---
{context}
--- HẾT THÔNG TIN ---

Trả lời câu hỏi: {user_query}"""
        
        return augmented, sources
