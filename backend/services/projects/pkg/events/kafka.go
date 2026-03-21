package events

import (
	"log/slog"
)

// PublishEvent — заглушка публикации в Kafka (подключите продюсер при интеграции).
func PublishEvent(event string, payload any) {
	slog.Info("events.publish", "event", event, "payload", payload)
}
