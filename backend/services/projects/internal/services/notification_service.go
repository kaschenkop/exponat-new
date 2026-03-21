package services

import "log/slog"

// NotificationService — заглушка для push/email уведомлений.
type NotificationService struct{}

func (NotificationService) NotifyProjectUpdated(projectID string) {
	slog.Info("notify.project_updated", "projectId", projectID)
}
