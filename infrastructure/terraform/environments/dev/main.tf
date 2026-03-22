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
    key      = "dev/terraform.tfstate"
    region   = "ru-central1"
    endpoint = "storage.yandexcloud.net"
  }
}

module "kubernetes" {
  source = "../../modules/kubernetes"

  environment = "dev"
  node_count  = 2
  node_cpu    = 2
  node_memory = 4
}

module "database" {
  source = "../../modules/database"

  environment = "dev"
  db_name     = "exponat_dev"
}
