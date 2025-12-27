"""AI Client for Groq API integration"""
import os
import logging
from typing import List, Dict, Any, Optional
from groq import Groq
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


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
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
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
        Call Groq chat completion with retry logic
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Override default temperature
            max_tokens: Override default max_tokens
            json_mode: Force JSON response format
            
        Returns:
            Dict with 'content', 'usage', 'model'
        """
        if not self.client:
            raise ValueError("Groq API key not configured")
        
        try:
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
