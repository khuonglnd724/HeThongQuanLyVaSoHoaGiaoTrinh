"""Document management and RAG endpoints"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
import uuid
import logging
from app.services.rag_service import VectorStore
from app.services.document_processor import DocumentProcessor
from app.database.connection import SessionLocal
from app.repositories.job_repository import JobRepository
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["documents"])

# Initialize vector store
vector_store = VectorStore(persist_directory="./chroma_data")


class DocumentIngestRequest(BaseModel):
    """Request for ingesting document"""
    syllabus_id: str
    subject_name: str


class DocumentIngestResponse(BaseModel):
    """Response after ingesting document"""
    success: bool
    message: str
    syllabus_id: str
    chunks_created: int


@router.post("/documents/ingest", response_model=DocumentIngestResponse)
async def ingest_document(
    file: UploadFile = File(...),
    syllabus_id: str = Form(...),
    subject_name: str = Form(default=""),
):
    """
    Ingest syllabus document (PDF/DOCX) into vector store
    
    For Chat and Suggest Similar CLOs to work with RAG
    
    Args:
        file: PDF or DOCX file
        syllabus_id: Unique identifier for syllabus
        subject_name: Subject name (optional)
    
    Returns:
        Number of chunks created and stored
    """
    try:
        if not syllabus_id:
            raise HTTPException(status_code=400, detail="syllabus_id is required")
        
        # Validate file type
        if not file.filename.endswith(('.pdf', '.docx', '.doc', '.txt')):
            raise HTTPException(
                status_code=400,
                detail="File must be PDF, DOCX or TXT format"
            )
        
        logger.info(f"Ingesting document: {syllabus_id} from {file.filename}")
        
        # Save temp file
        temp_path = f"/tmp/{uuid.uuid4()}_{file.filename}"
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Extract text from document
        if file.filename.endswith('.pdf'):
            extraction = DocumentProcessor.extract_from_pdf(temp_path)
        elif file.filename.endswith('.txt'):
            extraction = DocumentProcessor.extract_from_txt(temp_path)
        else:
            extraction = DocumentProcessor.extract_from_docx(temp_path)
        
        full_text = extraction.get("full_text", "")
        if not full_text:
            raise HTTPException(status_code=400, detail="No text extracted from document")
        
        # Chunk the document (split into 500-char overlapping chunks)
        chunks = _chunk_text(full_text, chunk_size=500, overlap=100)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Document produced no chunks")
        
        # Create collection for this syllabus if doesn't exist
        collection_name = f"syllabus_{syllabus_id}".lower()
        vector_store.create_collection(collection_name)
        
        # Create documents and IDs
        doc_ids = [f"{syllabus_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "syllabus_id": syllabus_id,
                "subject": subject_name or "Unknown",
                "chunk_index": i,
                "file_name": file.filename
            }
            for i in range(len(chunks))
        ]
        
        # Add to vector store
        vector_store.add_documents(
            collection_name=collection_name,
            documents=chunks,
            metadatas=metadatas,
            ids=doc_ids
        )
        
        logger.info(f"Successfully ingested {len(chunks)} chunks for syllabus {syllabus_id}")
        
        return DocumentIngestResponse(
            success=True,
            message=f"Document ingested successfully with {len(chunks)} chunks",
            syllabus_id=syllabus_id,
            chunks_created=len(chunks)
        )
    
    except Exception as e:
        logger.error(f"Error ingesting document: {e}")
        raise HTTPException(status_code=500, detail=f"Error ingesting document: {str(e)}")


@router.get("/documents/search")
async def search_documents(
    query: str,
    syllabus_id: str,
    limit: int = 5
):
    """
    Search documents in vector store using semantic similarity
    
    Args:
        query: Search query
        syllabus_id: Which syllabus to search in
        limit: Number of results to return
    
    Returns:
        List of most similar document chunks with similarity scores
    """
    try:
        if not query or not syllabus_id:
            raise HTTPException(status_code=400, detail="query and syllabus_id required")
        
        collection_name = f"syllabus_{syllabus_id}".lower()
        
        results = vector_store.search(
            collection_name=collection_name,
            query=query,
            top_k=limit
        )
        
        return {
            "query": query,
            "syllabus_id": syllabus_id,
            "results": results,
            "count": len(results)
        }
    
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching documents: {str(e)}")


@router.get("/documents/collections")
async def list_collections():
    """List all available document collections"""
    try:
        collections = vector_store.list_collections()
        return {
            "collections": collections,
            "count": len(collections)
        }
    except Exception as e:
        logger.error(f"Error listing collections: {e}")
        raise HTTPException(status_code=500, detail=f"Error listing collections: {str(e)}")


@router.delete("/documents/{syllabus_id}")
async def delete_syllabus_documents(syllabus_id: str):
    """Delete all documents for a syllabus"""
    try:
        collection_name = f"syllabus_{syllabus_id}".lower()
        vector_store.delete_collection(collection_name)
        
        return {
            "success": True,
            "message": f"Deleted documents for syllabus {syllabus_id}",
            "syllabus_id": syllabus_id
        }
    except Exception as e:
        logger.error(f"Error deleting documents: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting documents: {str(e)}")


def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list:
    """
    Split text into overlapping chunks
    
    Args:
        text: Full text to chunk
        chunk_size: Size of each chunk
        overlap: Number of chars to overlap between chunks
    
    Returns:
        List of text chunks
    """
    chunks = []
    start = 0
    
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()
        
        if chunk:  # Only add non-empty chunks
            chunks.append(chunk)
        
        start = end - overlap if end < len(text) else len(text)
    
    return chunks
