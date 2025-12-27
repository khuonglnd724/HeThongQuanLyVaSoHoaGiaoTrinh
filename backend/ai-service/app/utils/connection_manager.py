"""WebSocket connection manager for real-time notifications"""
from typing import Dict, List
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Manage WebSocket connections per user
    Track active connections and broadcast messages
    """
    
    def __init__(self):
        # Dict[user_id] = List[WebSocket connections]
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        """Accept and store a WebSocket connection"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        logger.info(f"Client {user_id} connected. Active connections: {len(self.active_connections[user_id])}")
    
    def disconnect(self, user_id: str, websocket: WebSocket):
        """Remove a closed WebSocket connection"""
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            
            logger.info(f"Client {user_id} disconnected")
    
    async def broadcast_to_user(self, user_id: str, message: dict):
        """Send message to all connections of a specific user"""
        if user_id not in self.active_connections:
            logger.warning(f"No active connections for user {user_id}")
            return
        
        disconnected = []
        
        for websocket in self.active_connections[user_id]:
            try:
                await websocket.send_json(message)
            except RuntimeError as e:
                logger.warning(f"Failed to send message to {user_id}: {e}")
                disconnected.append(websocket)
        
        # Clean up disconnected connections
        for websocket in disconnected:
            self.disconnect(user_id, websocket)
    
    async def broadcast_to_all(self, message: dict):
        """Send message to all connected users"""
        for user_id in list(self.active_connections.keys()):
            await self.broadcast_to_user(user_id, message)
    
    def get_active_users(self) -> List[str]:
        """Get list of users with active connections"""
        return list(self.active_connections.keys())
    
    def get_user_connection_count(self, user_id: str) -> int:
        """Get number of active connections for user"""
        return len(self.active_connections.get(user_id, []))
    
    def get_total_connections(self) -> int:
        """Get total active connections across all users"""
        return sum(len(conns) for conns in self.active_connections.values())

# Global instance
manager = ConnectionManager()
