"""Vector store for semantic search and RAG"""
import logging
import json
from typing import List, Dict, Optional, Tuple
import chromadb
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class VectorStore:
    """Vector database for storing and searching embeddings"""
    
    def __init__(self, persist_directory: str = "./chroma_data"):
        """
        Initialize vector store
        
        Args:
            persist_directory: Directory for persistent storage
        """
        self.persist_directory = persist_directory
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Initialize embedding model (lightweight)
        self.embedding_model = SentenceTransformer(
            'sentence-transformers/all-MiniLM-L6-v2',
            device='cpu'  # Use CPU to avoid GPU memory issues
        )
        
        logger.info(f"Vector store initialized at {persist_directory}")
    
    def create_collection(self, collection_name: str, metadata: Optional[Dict] = None) -> None:
        """
        Create or get a collection (does not delete existing collections)
        
        Args:
            collection_name: Name of collection
            metadata: Optional metadata dict
        """
        try:
            # Check if collection already exists - do not delete!
            try:
                collection = self.client.get_collection(name=collection_name)
                logger.info(f"Collection {collection_name} already exists, skipping creation")
                return
            except:
                # Collection doesn't exist, create it
                pass
            
            # Create collection with embedding function
            self.client.create_collection(
                name=collection_name,
                metadata=metadata or {"description": f"Collection {collection_name}"}
            )
            
            logger.info(f"Created collection: {collection_name}")
        
        except Exception as e:
            logger.error(f"Error creating collection {collection_name}: {e}")
            raise
    
    def add_documents(
        self,
        collection_name: str,
        documents: List[str],
        metadatas: List[Dict],
        ids: List[str]
    ) -> None:
        """
        Add documents to collection with embeddings
        
        Args:
            collection_name: Name of collection
            documents: List of text documents
            metadatas: List of metadata dicts
            ids: List of unique IDs
        """
        try:
            collection = self.client.get_collection(name=collection_name)
            
            # Generate embeddings
            embeddings = self.embedding_model.encode(documents, show_progress_bar=True)
            
            # Add to collection
            collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
                embeddings=embeddings.tolist()
            )
            
            logger.info(f"Added {len(documents)} documents to {collection_name}")
        
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
        """
        Search for similar documents
        
        Args:
            collection_name: Name of collection
            query: Search query text
            top_k: Number of top results
            where: Optional filter conditions
            
        Returns:
            List of results with text and metadata
        """
        try:
            collection = self.client.get_collection(name=collection_name)
            
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query])[0].tolist()
            
            # Search
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where
            )
            
            # Format results
            formatted_results = []
            if results and results['documents'] and len(results['documents']) > 0:
                for i, doc in enumerate(results['documents'][0]):
                    formatted_results.append({
                        "id": results['ids'][0][i] if results['ids'] else None,
                        "document": doc,
                        "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                        "distance": results['distances'][0][i] if results['distances'] else None
                    })
            
            return formatted_results
        
        except Exception as e:
            logger.error(f"Error searching {collection_name}: {e}")
            return []
    
    def delete_collection(self, collection_name: str) -> None:
        """
        Delete a collection
        
        Args:
            collection_name: Name of collection
        """
        try:
            self.client.delete_collection(name=collection_name)
            logger.info(f"Deleted collection: {collection_name}")
        except Exception as e:
            logger.error(f"Error deleting collection {collection_name}: {e}")
    
    def list_collections(self) -> List[str]:
        """
        List all collections
        
        Returns:
            List of collection names
        """
        try:
            collections = self.client.list_collections()
            # collections is a list of Collection objects with .name attribute
            names = []
            for c in collections:
                if hasattr(c, 'name'):
                    names.append(c.name)
                elif isinstance(c, dict) and 'name' in c:
                    names.append(c['name'])
                else:
                    names.append(str(c))
            return names
        except Exception as e:
            logger.error(f"Error listing collections: {e}")
            return []
    
    def get_collection_size(self, collection_name: str) -> int:
        """
        Get number of documents in collection
        
        Args:
            collection_name: Name of collection
            
        Returns:
            Number of documents
        """
        try:
            collection = self.client.get_collection(name=collection_name)
            return collection.count()
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
