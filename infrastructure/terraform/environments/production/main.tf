terraform {
  required_version = ">= 1.5"

  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = ">= 0.100"
    }
  }

  backend "s3" {
    bucket   = "exponat-terraform-state"
    key      = "production/terraform.tfstate"
    region   = "ru-central1"
    endpoint = "storage.yandexcloud.net"
  }
}

module "kubernetes" {
  source = "../../modules/kubernetes"

  environment = "production"
  node_count  = 5
  node_cpu    = 8
  node_memory = 16
}

module "database" {
  source = "../../modules/database"

  environment = "production"
  db_name     = "exponat_production"
}
