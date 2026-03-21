package services

import "exponat/projects/internal/websocket"

// CollaborationService оборачивает WebSocket hub для расширения (presence, locks).
type CollaborationService struct {
	Hub *websocket.Hub
}

func NewCollaborationService(hub *websocket.Hub) *CollaborationService {
	return &CollaborationService{Hub: hub}
}
