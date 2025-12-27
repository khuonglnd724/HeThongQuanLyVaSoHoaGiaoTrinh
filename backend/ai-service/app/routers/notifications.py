"""Notification router - WebSocket and REST endpoints"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import logging

from app.database.connection import get_db
from app.repositories.notification_repository import NotificationRepository
from app.utils.connection_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["notifications"])

# WebSocket endpoint for real-time notifications
@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time notification delivery
    Connect: ws://localhost:8000/notifications/ws/{user_id}
    """
    await manager.connect(user_id, websocket)
    
    try:
        while True:
            # Wait for messages from client (heartbeat, etc)
            data = await websocket.receive_text()
            
            # Optional: handle client messages (e.g., "ping" for heartbeat)
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
        logger.info(f"User {user_id} WebSocket disconnected")
    
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id, websocket)

# REST endpoints for notification management
@router.get("")
async def get_notifications(
    user_id: str = Query(..., description="User ID"),
    unread_only: bool = Query(False, description="Only unread notifications"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get notifications for a user
    
    Query parameters:
    - user_id: Required. User ID
    - unread_only: Optional. Only show unread (default: false)
    - limit: Optional. Max results (default: 50, max: 100)
    """
    try:
        notifications = NotificationRepository.get_user_notifications(
            db=db,
            user_id=user_id,
            unread_only=unread_only,
            limit=limit
        )
        
        return {
            "count": len(notifications),
            "data": [
                {
                    "id": n.id,
                    "jobId": n.job_id,
                    "title": n.title,
                    "message": n.message,
                    "type": n.notification_type,
                    "read": n.read,
                    "createdAt": n.created_at.isoformat(),
                    "readAt": n.read_at.isoformat() if n.read_at else None
                }
                for n in notifications
            ]
        }
    
    except Exception as e:
        logger.error(f"Error getting notifications: {e}")
        raise HTTPException(status_code=500, detail="Failed to get notifications")

@router.get("/unread-count")
async def get_unread_count(
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Get unread notification count for user"""
    try:
        count = NotificationRepository.get_unread_count(db, user_id)
        return {"unreadCount": count}
    
    except Exception as e:
        logger.error(f"Error getting unread count: {e}")
        raise HTTPException(status_code=500, detail="Failed to get unread count")

@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    try:
        notification = NotificationRepository.mark_as_read(db, notification_id)
        
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {
            "id": notification.id,
            "read": notification.read,
            "readAt": notification.read_at.isoformat() if notification.read_at else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark notification as read")

@router.post("/mark-all-read")
async def mark_all_as_read(
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for user"""
    try:
        count = NotificationRepository.mark_all_as_read(db, user_id)
        return {
            "message": f"Marked {count} notifications as read",
            "count": count
        }
    
    except Exception as e:
        logger.error(f"Error marking notifications as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark notifications as read")

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    try:
        success = NotificationRepository.delete_notification(db, notification_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Notification deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete notification")

@router.get("/status/connections")
async def get_connection_status():
    """Get active WebSocket connections status (admin only)"""
    return {
        "activeUsers": manager.get_active_users(),
        "totalConnections": manager.get_total_connections(),
        "userConnections": {
            user_id: manager.get_user_connection_count(user_id)
            for user_id in manager.get_active_users()
        }
    }
