"""CLO Similarity Matching Service"""
import logging
from typing import List, Dict, Any
from app.services.ai_client import AIClient

logger = logging.getLogger(__name__)


class CLOMatcher:
    """Service for finding similar CLOs"""
    
    def __init__(self):
        self.ai_client = AIClient()
    
    def find_similar_clos(
        self,
        current_clo: str,
        subject_area: str = None,
        level: str = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find similar CLOs using AI semantic search
        
        In production, this would:
        1. Query vector database with embeddings
        2. Search existing syllabuses in PostgreSQL
        3. Use AI to rank and filter results
        
        For now, we use AI to generate similar examples
        """
        try:
            # Build prompt for AI to suggest similar CLOs
            system_prompt = """You are an education expert specializing in learning outcomes.
Given a CLO (Course Learning Outcome), suggest similar CLOs that might exist in related courses.
Consider different phrasing, related skills, and progression levels.

Return JSON format:
{
    "similarCLOs": [
        {
            "clo": "exact CLO text",
            "subject": "subject name",
            "similarity": 0.0-1.0,
            "reasoning": "why this is similar"
        }
    ]
}"""
            
            user_prompt = f"""Current CLO: "{current_clo}"

Find {limit} similar CLOs that:
- Address related learning objectives
- Use similar action verbs (Bloom's taxonomy)
- Target similar cognitive levels"""
            
            if subject_area:
                user_prompt += f"\n- Are in subject area: {subject_area}"
            
            if level:
                user_prompt += f"\n- Are at level: {level}"
            
            user_prompt += "\n\nGenerate realistic, diverse CLO examples."
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            # Call AI
            response = self.ai_client.chat_completion(
                messages=messages,
                temperature=0.7,
                max_tokens=1500,
                json_mode=True
            )
            
            # Parse response
            import json
            result = json.loads(response["content"])
            
            similar_clos = []
            for idx, item in enumerate(result.get("similarCLOs", [])[:limit]):
                similar_clos.append({
                    "clo": item.get("clo", ""),
                    "subject": item.get("subject", "Related Course"),
                    "syllabusId": f"SYL-{2024}-{idx+1:03d}",  # Mock ID
                    "similarity": item.get("similarity", 0.85),
                    "context": item.get("reasoning", "")
                })
            
            return similar_clos
            
        except Exception as e:
            logger.error(f"CLO matching error: {e}")
            # Return fallback similar CLOs
            return self._get_fallback_clos(current_clo, limit)
    
    def _get_fallback_clos(self, current_clo: str, limit: int) -> List[Dict[str, Any]]:
        """Fallback similar CLOs if AI fails"""
        return [
            {
                "clo": "Apply fundamental concepts to solve problems",
                "subject": "General Studies",
                "syllabusId": "SYL-2024-001",
                "similarity": 0.75,
                "context": "Generic learning outcome"
            }
        ][:limit]
