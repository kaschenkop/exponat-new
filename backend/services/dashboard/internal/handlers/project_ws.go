package handlers

import (
	"log/slog"
	"net/http"
	"time"

	"exponat/dashboard/pkg/cache"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var wsUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		o := r.Header.Get("Origin")
		return o == "" || o == "http://localhost:3000" || o == "http://127.0.0.1:3000"
	},
}

func (h *ProjectHandlers) CollaborationWS(redis *cache.RedisCache) gin.HandlerFunc {
	return func(c *gin.Context) {
		orgID := resolveWSOrgID(c)
		if orgID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"message": "organization required"})
			return
		}

		conn, err := wsUpgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			slog.Error("ws upgrade", "err", err)
			return
		}
		defer conn.Close()

		_ = conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		conn.SetPongHandler(func(string) error {
			_ = conn.SetReadDeadline(time.Now().Add(60 * time.Second))
			return nil
		})

		if redis == nil {
			return
		}

		sub := redis.Subscribe(c.Request.Context(), "projects:org:"+orgID)
		if sub == nil {
			_ = conn.WriteJSON(map[string]string{"type": "ready", "mode": "noop"})
			tick := time.NewTicker(25 * time.Second)
			defer tick.Stop()
			for {
				select {
				case <-tick.C:
					_ = conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
					if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
						return
					}
				case <-c.Request.Context().Done():
					return
				}
			}
		}
		defer sub.Close()

		ch := sub.Channel()
		tick := time.NewTicker(25 * time.Second)
		defer tick.Stop()

		_ = conn.WriteJSON(map[string]string{"type": "ready", "channel": "projects:org:" + orgID})

		done := make(chan struct{})
		go func() {
			for {
				if _, _, err := conn.ReadMessage(); err != nil {
					close(done)
					return
				}
			}
		}()

		for {
			select {
			case <-done:
				return
			case msg, ok := <-ch:
				if !ok {
					return
				}
				if msg == nil {
					continue
				}
				_ = conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
				if err := conn.WriteMessage(websocket.TextMessage, []byte(msg.Payload)); err != nil {
					return
				}
			case <-tick.C:
				_ = conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
				if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					return
				}
			case <-c.Request.Context().Done():
				return
			}
		}
	}
}
