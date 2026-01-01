"""AI Client for Groq API integration"""
import os
import logging
import time
from typing import List, Dict, Any, Optional
from groq import Groq
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)


class GroqRateLimitError(Exception):
    """Custom exception for Groq rate limit errors"""
    pass


class AIClient:
    """Wrapper for Groq API with retry logic and error handling"""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            logger.warning("GROQ_API_KEY not set - AI features will not work")
        
        # Groq models: llama-3.3-70b-versatile (best), mixtral-8x7b-32768, gemma2-9b-it
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.temperature = float(os.getenv("GROQ_TEMPERATURE", "0.7"))
        self.max_tokens = int(os.getenv("GROQ_MAX_TOKENS", "2000"))
        
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        
        # Token tracking for rate limiting (approx 14000 tokens/min for free tier)
        self.tokens_used_minute = 0
        self.last_minute_reset = time.time()
        self.max_tokens_per_minute = int(os.getenv("GROQ_MAX_TOKENS_PER_MINUTE", "14000"))
    
    def _check_rate_limit(self, estimated_tokens: int = 2000):
        """Check and enforce rate limiting"""
        current_time = time.time()
        
        # Reset counter if more than 60 seconds have passed
        if current_time - self.last_minute_reset > 60:
            self.tokens_used_minute = 0
            self.last_minute_reset = current_time
        
        # Check if we would exceed rate limit
        if self.tokens_used_minute + estimated_tokens > self.max_tokens_per_minute:
            wait_time = 60 - (current_time - self.last_minute_reset)
            logger.warning(f"Rate limit approaching. Waiting {wait_time:.1f}s")
            if wait_time > 0:
                time.sleep(wait_time)
            self.tokens_used_minute = 0
            self.last_minute_reset = time.time()
    
    def _update_token_count(self, total_tokens: int):
        """Update token usage tracking"""
        self.tokens_used_minute += total_tokens
        logger.info(f"Tokens used this minute: {self.tokens_used_minute}/{self.max_tokens_per_minute}")
    
    @retry(
        stop=stop_after_attempt(2),  # Reduced from 4 for faster failure
        wait=wait_exponential(multiplier=1, min=2, max=10),  # Faster backoff
        retry=retry_if_exception_type((Exception,)),
        reraise=True
    )
    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        json_mode: bool = False
    ) -> Dict[str, Any]:
        """
        Call Groq chat completion with retry logic and error handling
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Override default temperature
            max_tokens: Override default max_tokens
            json_mode: Force JSON response format
            
        Returns:
            Dict with 'content', 'usage', 'model'
            
        Raises:
            ValueError: If API key not configured
            GroqRateLimitError: If rate limited
            Exception: Other API errors (will retry)
        """
        if not self.client:
            raise ValueError("Groq API key not configured")
        
        try:
            # Estimate tokens and check rate limit
            estimated_tokens = sum(len(msg.get("content", "").split()) for msg in messages) + (max_tokens or self.max_tokens)
            self._check_rate_limit(estimated_tokens)
            
            # Groq uses response_format for JSON mode
            kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature or self.temperature,
                "max_tokens": max_tokens or self.max_tokens,
            }
            
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}
            
            response = self.client.chat.completions.create(**kwargs)
            
            # Update token tracking
            self._update_token_count(response.usage.total_tokens)
            
            return {
                "content": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                "model": response.model,
                "finish_reason": response.choices[0].finish_reason
            }
            
        except Exception as e:
            error_msg = str(e).lower()
            
            # Handle specific error types
            if "rate_limit" in error_msg or "429" in error_msg:
                logger.warning(f"Rate limit hit, will retry: {e}")
                raise GroqRateLimitError(f"Rate limited: {e}") from e
            elif "authentication" in error_msg or "401" in error_msg:
                logger.error(f"Authentication failed: {e}")
                raise ValueError(f"Invalid Groq API key: {e}") from e
            elif "timeout" in error_msg or "connection" in error_msg:
                logger.warning(f"Connection error, will retry: {e}")
                raise Exception(f"Connection error (will retry): {e}") from e
            else:
                logger.error(f"Groq API error: {e}")
                raise
    
    def create_system_message(self, role_description: str) -> Dict[str, str]:
        """Create system message for chat"""
        return {"role": "system", "content": role_description}
    
    def create_user_message(self, content: str) -> Dict[str, str]:
        """Create user message for chat"""
        return {"role": "user", "content": content}
    
    def create_assistant_message(self, content: str) -> Dict[str, str]:
        """Create assistant message for chat"""
        return {"role": "assistant", "content": content}


# Singleton instance
_ai_client = None

def get_ai_client() -> AIClient:
    """Get or create AI client singleton"""
    global _ai_client
    if _ai_client is None:
        _ai_client = AIClient()
    return _ai_client
