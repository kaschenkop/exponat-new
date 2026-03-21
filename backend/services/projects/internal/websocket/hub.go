package websocket

import (
	"encoding/json"
	"sync"

	ws "github.com/gorilla/websocket"
)

type Hub struct {
	projects map[string]map[*Client]bool

	register   chan *Client
	unregister chan *Client
	broadcast  chan *Message

	mu sync.RWMutex
}

type Client struct {
	Hub       *Hub
	Conn      *ws.Conn
	Send      chan []byte
	UserID    string
	ProjectID string
}

type Message struct {
	ProjectID string      `json:"projectId"`
	Type      string      `json:"type"`
	Data      any         `json:"data"`
}

func NewHub() *Hub {
	return &Hub{
		projects:   make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *Message, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.projects[client.ProjectID]; !ok {
				h.projects[client.ProjectID] = make(map[*Client]bool)
			}
			h.projects[client.ProjectID][client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.projects[client.ProjectID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.Send)
				}
				if len(clients) == 0 {
					delete(h.projects, client.ProjectID)
				}
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			if clients, ok := h.projects[message.ProjectID]; ok {
				payload := marshalMessage(message)
				for cl := range clients {
					select {
					case cl.Send <- payload:
					default:
						close(cl.Send)
						delete(clients, cl)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) Register(client *Client) {
	h.register <- client
}

func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
}

func (h *Hub) BroadcastToProject(projectID, eventType string, data any) {
	h.broadcast <- &Message{
		ProjectID: projectID,
		Type:      eventType,
		Data:      data,
	}
}

func marshalMessage(m *Message) []byte {
	b, err := json.Marshal(m)
	if err != nil {
		return []byte(`{"type":"error","data":"marshal failed"}`)
	}
	return b
}
