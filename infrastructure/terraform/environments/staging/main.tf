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

# Staging: минимальная стоимость (одна зона, мало нод, меньше vCPU/RAM).
module "kubernetes" {
  source = "../../modules/kubernetes"

  environment = "staging"
  node_count  = 1
  node_cpu    = 2
  node_memory = 4
}

# Одна managed PostgreSQL на среду: приложение и Keycloak — разные БД внутри одного инстанса (не два кластера Postgres).
module "database" {
  source = "../../modules/database"

  environment = "staging"
  db_name     = "exponat_staging"
}
