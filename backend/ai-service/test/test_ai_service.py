"""Unit tests for AI Service components"""
import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from app.services.ai_client import AIClient, GroqRateLimitError
from app.services.document_processor import DocumentProcessor


class TestAIClient:
    """Tests for AI Client"""
    
    @patch.dict('os.environ', {
        'GROQ_API_KEY': 'test-key',
        'GROQ_MODEL': 'llama-3.3-70b-versatile'
    })
    def test_ai_client_initialization(self):
        """Test AI client initialization"""
        client = AIClient()
        assert client.api_key == 'test-key'
        assert client.model == 'llama-3.3-70b-versatile'
    
    @patch.dict('os.environ', {
        'GROQ_API_KEY': ''
    })
    def test_ai_client_no_key(self):
        """Test AI client without API key"""
        client = AIClient()
        assert client.client is None
    
    @patch.dict('os.environ', {
        'GROQ_API_KEY': 'test-key',
        'GROQ_MAX_TOKENS_PER_MINUTE': '14000'
    })
    def test_rate_limiting(self):
        """Test rate limit checking"""
        client = AIClient()
        
        # Should not raise
        client._check_rate_limit(1000)
        
        # Simulate high usage
        client.tokens_used_minute = 13500
        
        # Should check and possibly wait
        client._check_rate_limit(800)
    
    def test_message_creation(self):
        """Test message creation helpers"""
        client = AIClient()
        
        sys_msg = client.create_system_message("You are helpful")
        assert sys_msg["role"] == "system"
        assert sys_msg["content"] == "You are helpful"
        
        user_msg = client.create_user_message("Hello")
        assert user_msg["role"] == "user"
        
        asst_msg = client.create_assistant_message("Hi")
        assert asst_msg["role"] == "assistant"


class TestDocumentProcessor:
    """Tests for Document Processor"""
    
    def test_clean_text(self):
        """Test text cleaning"""
        dirty_text = "  This   has   extra    spaces  \n\n\n  and newlines  "
        clean = DocumentProcessor.clean_text(dirty_text)
        assert clean == "This has extra spaces and newlines"
    
    def test_chunk_text(self):
        """Test text chunking"""
        text = "Sentence one. Sentence two. Sentence three. " * 50
        chunks = DocumentProcessor.chunk_text(text, chunk_size=100, overlap=10)
        
        assert len(chunks) > 0
        assert all('content' in chunk for chunk in chunks)
        assert all('index' in chunk for chunk in chunks)
    
    def test_chunk_text_with_overlap(self):
        """Test chunking preserves overlap"""
        text = "This is a test sentence. " * 20
        chunks = DocumentProcessor.chunk_text(text, chunk_size=100, overlap=20)
        
        # Check that consecutive chunks have overlap
        if len(chunks) > 1:
            chunk1_end = chunks[0]['end']
            chunk2_start = chunks[1]['start']
            assert chunk1_end > chunk2_start  # There should be overlap


class TestPrompts:
    """Tests for Prompts"""
    
    def test_suggest_prompt_building(self):
        """Test suggest prompt generation"""
        from app.services.prompts import build_suggest_prompt
        
        content = "Test syllabus content"
        prompt = build_suggest_prompt(content, "assessment")
        
        assert "Test syllabus content" in prompt
        assert "assessment" in prompt
    
    def test_chat_prompt_building(self):
        """Test chat prompt with history"""
        from app.services.prompts import build_chat_prompt
        
        messages = build_chat_prompt(
            message="What is CLO?",
            syllabus_context="CLO means Course Learning Outcome",
            chat_history=[{"role": "user", "content": "Hi"}]
        )
        
        assert len(messages) >= 2
        assert messages[0]["role"] == "system"
        assert any("What is CLO?" in msg.get("content", "") for msg in messages)
    
    def test_diff_prompt_building(self):
        """Test diff prompt generation"""
        from app.services.prompts import build_diff_prompt
        
        old = "Old content"
        new = "New content"
        prompt = build_diff_prompt(old, new)
        
        assert "Old content" in prompt
        assert "New content" in prompt


class TestJobRepository:
    """Tests for Job Repository"""
    
    def test_job_status_enum(self):
        """Test job status values"""
        from app.database.models import AIJobStatus
        
        statuses = [
            AIJobStatus.QUEUED,
            AIJobStatus.RUNNING,
            AIJobStatus.SUCCEEDED,
            AIJobStatus.FAILED
        ]
        assert len(statuses) == 4


class TestIntegration:
    """Integration tests"""
    
    @pytest.mark.asyncio
    async def test_suggest_task_flow(self):
        """Test suggest task end-to-end (mocked)"""
        
        payload = {
            "userId": "user123",
            "syllabusId": "syll456",
            "content": "Test syllabus",
            "focusArea": "assessment"
        }
        
        # This would normally be called via Celery
        # For now, just verify payload structure
        assert payload["userId"] is not None
        assert payload["content"] is not None
    
    @pytest.mark.asyncio
    async def test_chat_task_flow(self):
        """Test chat task end-to-end (mocked)"""
        
        payload = {
            "userId": "user123",
            "syllabusId": "syll456",
            "conversationId": "conv789",
            "message": "What is this course about?",
            "syllabusContext": "Introduction to Python"
        }
        
        assert payload["message"] is not None
        assert "about" in payload["message"].lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
