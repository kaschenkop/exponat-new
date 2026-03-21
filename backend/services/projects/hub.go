package projects

import (
	"exponat/projects/internal/websocket"
)

// Hub — публичный алиас WebSocket hub для интеграции (dashboard не может импортировать internal).
type Hub = websocket.Hub

// NewHub создаёт hub и должен сопровождаться go hub.Run() в фоне.
func NewHub() *Hub {
	return websocket.NewHub()
}
