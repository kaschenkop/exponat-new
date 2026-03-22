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
    key      = "staging/terraform.tfstate"
    region   = "ru-central1"
    endpoint = "storage.yandexcloud.net"
  }
}

module "kubernetes" {
  source = "../../modules/kubernetes"

  environment = "staging"
  node_count  = 3
  node_cpu    = 4
  node_memory = 8
}

module "database" {
  source = "../../modules/database"

  environment = "staging"
  db_name     = "exponat_staging"
}
