package websocket

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	ws "github.com/gorilla/websocket"
)

var upgrader = ws.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

const (
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
	writeWait  = 10 * time.Second
)

// ServeWS поднимает WebSocket для projectId из query.
func ServeWS(hub *Hub, c *gin.Context) {
	projectID := c.Query("projectId")
	if projectID == "" {
		c.JSON(400, gin.H{"error": "projectId required"})
		return
	}
	userID := c.GetString("userId")
	if userID == "" {
		userID = "00000000-0000-0000-0000-000000000001"
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		slog.Error("ws upgrade", "err", err)
		return
	}
	if err := conn.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		slog.Error("ws set read deadline", "err", err)
		_ = conn.Close()
		return
	}
	conn.SetPongHandler(func(string) error {
		return conn.SetReadDeadline(time.Now().Add(pongWait))
	})

	client := &Client{
		Hub:       hub,
		Conn:      conn,
		Send:      make(chan []byte, 256),
		UserID:    userID,
		ProjectID: projectID,
	}
	hub.Register(client)

	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.Hub.Unregister(c)
		_ = c.Conn.Close()
	}()
	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
				slog.Debug("ws read", "err", err)
			}
			break
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		_ = c.Conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.Send:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.Conn.WriteMessage(ws.CloseMessage, []byte{})
				return
			}
			w, err := c.Conn.NextWriter(ws.TextMessage)
			if err != nil {
				return
			}
			_, _ = w.Write(message)
			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(ws.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
