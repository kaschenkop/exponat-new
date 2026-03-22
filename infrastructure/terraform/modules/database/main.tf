variable "environment" {
  type = string
}

variable "db_name" {
  type = string
}

output "connection_string" {
  value     = "postgresql://exponat:password@db-${var.environment}:5432/${var.db_name}"
  sensitive = true
}
