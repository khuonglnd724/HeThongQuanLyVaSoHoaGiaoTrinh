"""CLO Similarity Matching Service with RAG"""
import logging
import os
from typing import List, Dict, Any, Optional
from app.services.ai_client import AIClient
from app.services.rag_service import VectorStore

logger = logging.getLogger(__name__)


class CLOMatcher:
    """Service for finding similar CLOs using vector search and AI ranking"""
    
    def __init__(self):
        self.ai_client = AIClient()
        self.vector_store = VectorStore()
    
    def find_similar_clos(
        self,
        current_clo: str,
        subject_area: str = None,
        level: str = None,
        syllabus_ids: List[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find similar CLOs using RAG vector search
        
        Args:
            current_clo: CLO to find similar matches for
            subject_area: Filter by subject (optional)
            level: Filter by Bloom's level (optional)
            syllabus_ids: List of syllabuses to search in (optional)
            limit: Number of results to return
        
        Returns:
            List of similar CLOs with similarity scores
        """
        try:
            # Build vector search query
            similar_clos = []
            
            # If specific syllabuses provided, search in those collections
            if syllabus_ids:
                for syllabus_id in syllabus_ids:
                    collection_name = f"syllabus_{syllabus_id}".lower()
                    try:
                        results = self.vector_store.search(
                            collection_name=collection_name,
                            query=current_clo,
                            top_k=limit
                        )
                        
                        for result in results:
                            similar_clos.append({
                                "clo": result['document'][:200],  # CLO text
                                "subject": result['metadata'].get('subject', 'Unknown'),
                                "syllabusId": syllabus_id,
                                "similarity": result.get('distance', 0),
                                "source": "syllabus_content"
                            })
                    except Exception as e:
                        logger.warning(f"Error searching syllabus {syllabus_id}: {e}")
                        continue
            else:
                # If no specific syllabuses, search all available collections
                logger.info("Searching all available syllabuses for similar CLOs")
                collections = self.vector_store.list_collections()
                
                for collection in collections:
                    if collection.startswith("syllabus_"):
                        try:
                            results = self.vector_store.search(
                                collection_name=collection,
                                query=current_clo,
                                top_k=2  # Fewer per collection when searching all
                            )
                            
                            for result in results:
                                similar_clos.append({
                                    "clo": result['document'][:200],
                                    "subject": result['metadata'].get('subject', 'Unknown'),
                                    "syllabusId": result['metadata'].get('syllabus_id', 'unknown'),
                                    "similarity": result.get('distance', 0),
                                    "source": "syllabus_content"
                                })
                        except Exception as e:
                            logger.warning(f"Error searching {collection}: {e}")
                            continue
            
            # If RAG found results, use AI to rank and enrich them
            if similar_clos:
                logger.info(f"Found {len(similar_clos)} candidates from RAG, using AI to rank")
                
                # Use AI to score similarity
                clo_text = "\n".join([f"- {clo['clo']}" for clo in similar_clos[:limit]])
                
                system_prompt = """You are an education expert specializing in learning outcomes.
Analyze CLOs and rank them by semantic similarity to the given CLO.
Score similarity from 0.0 (completely different) to 1.0 (identical).

Return JSON format:
{
    "rankedCLOs": [
        {
            "clo": "exact CLO text",
            "similarity": 0.0-1.0,
            "reasoning": "brief explanation"
        }
    ]
}"""
                
                user_prompt = f"""Current CLO: "{current_clo}"

Rank these similar CLOs by relevance:
{clo_text}

Consider:
- Action verbs (Bloom's taxonomy)
- Learning domains
- Cognitive levels
- Topic relevance"""
                
                if subject_area:
                    user_prompt += f"\nPrefer CLOs in subject: {subject_area}"
                
                if level:
                    user_prompt += f"\nTarget Bloom's level: {level}"
                
                try:
                    ai_response = self.ai_client.chat_completion(
                        messages=[
                            self.ai_client.create_system_message(system_prompt),
                            self.ai_client.create_user_message(user_prompt)
                        ],
                        temperature=0.3,
                        json_mode=True
                    )
                    
                    import json
                    ranked_data = json.loads(ai_response['content'])
                    
                    # Merge AI scores with RAG results
                    final_results = []
                    for ai_result in ranked_data.get('rankedCLOs', [])[:limit]:
                        # Find matching RAG result by similarity (not string matching)
                        # Use levenshtein-like approach: find closest match
                        ai_clo = ai_result['clo']
                        matching_rag = None
                        
                        if similar_clos:
                            # Find RAG result with text closest to AI result
                            min_distance = float('inf')
                            for rag in similar_clos:
                                # Simple similarity: common prefix length
                                common_len = len(os.path.commonprefix([ai_clo, rag['clo']]))
                                if common_len > len(ai_clo) * 0.3:  # At least 30% match
                                    distance = abs(len(ai_clo) - len(rag['clo']))
                                    if distance < min_distance:
                                        min_distance = distance
                                        matching_rag = rag
                        
                        final_results.append({
                            "clo": ai_clo,
                            "similarity": ai_result.get('similarity', 0.5),
                            "reasoning": ai_result.get('reasoning', ''),
                            "subject": matching_rag.get('subject') if matching_rag else 'Unknown',
                            "syllabusId": matching_rag.get('syllabusId') if matching_rag else 'unknown',
                            "source": "rag_ranked_by_ai"
                        })
                    
                    return final_results[:limit]
                
                except Exception as e:
                    logger.error(f"AI ranking failed, returning RAG results: {e}")
                    return similar_clos[:limit]
            else:
                # No RAG results, fall back to pure AI generation
                logger.info("No RAG results found, generating via AI")
                return self._generate_similar_clos_ai(current_clo, subject_area, level, limit)
        
        except Exception as e:
            logger.error(f"Error finding similar CLOs: {e}")
            # Graceful fallback to AI generation
            return self._generate_similar_clos_ai(current_clo, subject_area, level, limit)
    
    def _generate_similar_clos_ai(
        self,
        current_clo: str,
        subject_area: Optional[str],
        level: Optional[str],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Fallback: Generate similar CLOs purely via AI (no RAG)"""
        try:
            system_prompt = """You are an education expert. Generate similar CLOs based on Bloom's taxonomy and learning theory.

Return JSON format:
{
    "similarCLOs": [
        {
            "clo": "exact CLO text",
            "similarity": 0.0-1.0,
            "reasoning": "brief explanation"
        }
    ]
}"""
            
            user_prompt = f"""Current CLO: "{current_clo}"

Generate {limit} similar CLOs that:
- Address related learning objectives
- Use similar action verbs
- Target similar cognitive levels"""
            
            if subject_area:
                user_prompt += f"\n- Are in subject area: {subject_area}"
            
            if level:
                user_prompt += f"\n- Target Bloom's level: {level}"
            
            ai_response = self.ai_client.chat_completion(
                messages=[
                    self.ai_client.create_system_message(system_prompt),
                    self.ai_client.create_user_message(user_prompt)
                ],
                temperature=0.7,
                json_mode=True
            )
            
            import json
            data = json.loads(ai_response['content'])
            
            return [
                {
                    "clo": clo['clo'],
                    "similarity": clo.get('similarity', 0.5),
                    "reasoning": clo.get('reasoning', ''),
                    "subject": subject_area or 'Generated',
                    "source": "ai_generated"
                }
                for clo in data.get('similarCLOs', [])[:limit]
            ]
        
        except Exception as e:
            logger.error(f"AI generation failed: {e}")
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
