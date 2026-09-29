"""
WebSocket connection manager for real-time dashboard updates.
"""

from fastapi import WebSocket
from utils.logger import logger


class ConnectionManager:
    """Manages WebSocket connections and broadcasts updates."""

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WebSocket connected – %d active", len(self.active_connections))

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a disconnected WebSocket."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info("WebSocket disconnected – %d active", len(self.active_connections))

    async def broadcast(self, data: dict) -> None:
        """Send a JSON message to all connected clients."""
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                dead.append(connection)
        # Clean up dead connections
        for conn in dead:
            self.disconnect(conn)

    async def send_personal(self, websocket: WebSocket, data: dict) -> None:
        """Send a JSON message to a single client."""
        try:
            await websocket.send_json(data)
        except Exception:
            self.disconnect(websocket)


# Module-level singleton
manager = ConnectionManager()
