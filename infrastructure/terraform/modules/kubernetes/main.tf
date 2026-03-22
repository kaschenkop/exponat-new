variable "environment" {
  type = string
}

variable "node_count" {
  type    = number
  default = 2
}

variable "node_cpu" {
  type    = number
  default = 2
}

variable "node_memory" {
  type    = number
  default = 4
}

output "cluster_id" {
  value = "exponat-${var.environment}-cluster"
}
