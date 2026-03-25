# Развёртывание staging в Google Cloud Platform (GCP)

Подробное руководство по поднятию **staging**-среды платформы Экспонат в GCP. Репозиторий сейчас содержит заготовки Terraform под **Yandex Cloud** (`infrastructure/terraform/environments/staging/`) и workflow деплоя под **произвольный Kubernetes** (kubeconfig в секретах). Ниже — эквивалентная схема для **GKE + Cloud SQL** с упором на **одну managed PostgreSQL** (приложение и Keycloak — разные базы на одном инстансе, без второго кластера Postgres).

**Альтернатива (дешевле, БД в кластере):** [staging-gcp-k8s-db.md](./staging-gcp-k8s-db.md) — PostgreSQL и Redis через Bitnami внутри Kubernetes, без Cloud SQL / Memorystore.

---

## 1. Целевая архитектура (staging)

| Компонент | Рекомендация для GCP staging |
|-----------|------------------------------|
| Оркестратор | **GKE** (Standard: 1 зона, 1–2 узла e2-standard-2 или e2-medium — по бюджету; либо **Autopilot** с минимальными сервисами) |
| БД | **Cloud SQL for PostgreSQL** — **один** инстанс; отдельные БД: `exponat_staging`, `keycloak` |
| Кэш | **Memorystore for Redis** (минимальный tier) **или** Bitnami Redis в кластере, если нужно дешевле и проще |
| Образы | **Artifact Registry** (`REGION-docker.pkg.dev/PROJECT/exponat/...`) |
| Вход HTTP | **Ingress** (nginx или GKE Ingress) + **Google-managed SSL** или cert-manager |
| API-шлюз | **Kong** (как в `.github/workflows/deploy-staging.yml`), конфиг `infrastructure/kong/kong.yml` |
| Фронтенд | По умолчанию в CI — **Vercel**; в GCP можно **Cloud Run** или статика за Load Balancer — на ваш выбор |

Текущий пайплайн `.github/workflows/deploy-staging.yml` при пуше в `develop` деплоит фронт в Vercel и бэкенд в Kubernetes через `helm` + `kubectl`. Для GCP достаточно выдать **kubeconfig** на GKE и при необходимости поменять триггер ветки / образы.

---

## 2. Предварительные требования

- Учётная запись GCP с включённым биллингом.
- Установлены: [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`), `kubectl`, `helm` 3.x.
- [Документация по аутентификации](https://cloud.google.com/docs/authentication/application-default-credentials): `gcloud auth login` и `gcloud auth application-default login` при работе с клиентами.

Задайте переменные (подставьте свои значения).

**Bash (Linux, macOS, Git Bash):**

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="europe-west1"          # пример: Бельгия
export ZONE="${REGION}-b"
export CLUSTER_NAME="exponat-staging"
export NETWORK="exponat-staging-vpc"
export SUBNET="exponat-staging-subnet"
gcloud config set project "$PROJECT_ID"
```

**PowerShell (Windows)** — команды `export` здесь **не работают**, используйте `$env:`:

```powershell
$env:PROJECT_ID = "your-gcp-project-id"
$env:REGION = "europe-west1"
$env:ZONE = "$($env:REGION)-b"
$env:CLUSTER_NAME = "exponat-staging"
$env:NETWORK = "exponat-staging-vpc"
$env:SUBNET = "exponat-staging-subnet"
gcloud config set project $env:PROJECT_ID
```

В остальных фрагментах документа для PowerShell подставляйте переменные так: `$env:PROJECT_ID`, `$env:REGION` и т.д. Многострочные вызовы `gcloud ... \` в bash в PowerShell заменяйте на обратную кавычку `` ` `` в конце строки.

---

## 3. Включение необходимых API

```bash
gcloud services enable \
  container.googleapis.com \
  sqladmin.googleapis.com \
  servicenetworking.googleapis.com \
  compute.googleapis.com \
  artifactregistry.googleapis.com \
  redis.googleapis.com \
  secretmanager.googleapis.com
```

---

## 4. VPC и подсеть (для приватного доступа к Cloud SQL)

Один регион, одна зона — дешевле, чем multi-zone HA для staging.

```bash
gcloud compute networks create "exponat-staging-vpc" --subnet-mode=custom

gcloud compute networks subnets create "exponat-staging-subnet" --network="exponat-staging-vpc" --region="europe-west3" --range=10.10.0.0/20
```

Выделение диапазона для **private services** (Cloud SQL private IP):

```bash
gcloud compute addresses create google-managed-services-default --global --purpose=VPC_PEERING --prefix-length=16 --network="exponat-staging-vpc"
gcloud services vpc-peerings connect --service=servicenetworking.googleapis.com --ranges=google-managed-services-default --network="exponat-staging-vpc"
```

---

## 5. GKE кластер

Минимальный вариант (Standard, один пул, один узел в одной зоне):

```bash
gcloud container clusters create "exponat-staging" \
  --region="$REGION" \
  --num-nodes=1 \
  --machine-type=e2-standard-2 \
  --network="$NETWORK" \
  --subnetwork="$SUBNET" \
  --enable-ip-alias \
  --release-channel=regular
```

Для экономии можно использовать **preemptible** узлы (прерываемые ВМ) — для staging часто приемлемо:

```bash
# пример: отдельный node pool с preemptible (создайте кластер с --num-nodes=0 и добавьте pool)
gcloud container node-pools create preemptible-pool \
  --cluster="$CLUSTER_NAME" \
  --region="$REGION" \
  --num-nodes=1 \
  --machine-type=e2-medium \
  --preemptible
```

Получение учётных данных для `kubectl`:

```bash
gcloud container clusters get-credentials "$CLUSTER_NAME" --region "$REGION"
kubectl get nodes
```

### 5.1 Масштаб ноды: вторая нода или `e2-standard-2` (альтернатива урезанию requests)

Чарты `values-staging.yaml` + `values-staging-gcp-incluster.yaml` рассчитаны на **достаточный** запас CPU/RAM (Postgres + Redis + несколько Deployment). На **одной** ноде **e2-medium** (2 vCPU) планировщик может выдать **`Insufficient cpu`** — тогда либо **расширяют кластер**, либо переходят на файлы **`values-staging-lowfootprint.yaml`** и **`values-staging-gcp-incluster-lowfootprint.yaml`** (см. ниже).

**Вариант A — второй узел в том же пуле** (проще всего, тот же тип машины):

```bash
# Имя пула и зона/регион подставьте свои:
gcloud container node-pools list --cluster="$CLUSTER_NAME" --region="$REGION"

# Zonal-кластер (пример):
gcloud container clusters resize "$CLUSTER_NAME" --zone=europe-west3-a \
  --node-pool default-pool --num-nodes=2

# Regional-кластер — смотрите документацию: num-nodes часто «на зону»; при необходимости --enable-autoscaling.
```

**Вариант B — одна нода, но мощнее (`e2-standard-2`, 8 GB RAM)**  
Тип машины **существующего** пула в GKE **не меняют на месте**. Типичный путь:

1. Создать **новый** node pool с нужным типом и перенести нагрузку (или поднять staging с нуля на новом пуле):

```bash
gcloud container node-pools create standard2-pool \
  --cluster="$CLUSTER_NAME" \
  --zone=europe-west3-a \
  --machine-type=e2-standard-2 \
  --num-nodes=1 \
  --enable-autorepair

# Уменьшить старый пул до 0 нод или удалить пул после миграции подов (осторожно с PV).
gcloud container clusters resize "$CLUSTER_NAME" --zone=europe-west3-a \
  --node-pool default-pool --num-nodes=0
```

2. Либо **пересоздать** кластер сразу с `--machine-type=e2-standard-2` (как в § 5 выше).

**Вариант C — оставить одну e2-medium**  
Использовать урезанные values (три файла):

```bash
helm upgrade --install exponat ./infrastructure/helm/exponat \
  -f ./infrastructure/helm/exponat/values-staging-lowfootprint.yaml \
  -f ./infrastructure/helm/exponat/values-staging-gcp-incluster.yaml \
  -f ./infrastructure/helm/exponat/values-staging-gcp-incluster-lowfootprint.yaml \
  --namespace staging --create-namespace --wait
```

### 5.2 Отключить «лишнее» на нодах (staging, экономия CPU)

На **Standard** GKE с **e2-medium** заметную долю **allocatable CPU** съедают системные и управляемые поды (**fluentbit**, **gke-metrics-agent**, **Managed Service for Prometheus** — namespace `gmp-system` и т.д.). Для **staging** часть функций можно отключить.

**1. Managed Service for Prometheus (часто самый тяжёлый)** — снимает поды вроде `gmp-system/collector`, оператор и т.д.

Сначала оставьте в Cloud Monitoring только **системные** метрики (`SYSTEM`). Иначе при отключении GMP API отвечает ошибкой вида: *«Metric packages … require managed Prometheus»* — на кластере включены пакеты метрик (CADVISOR, POD, kube-state и др.), которые в GKE завязаны на Managed Prometheus. Подробнее: [Configure metrics collection — Disable metric packages](https://cloud.google.com/kubernetes-engine/docs/how-to/configure-metrics#disable_metric_packages).

**Шаг A — только системные метрики (сбрасывает «тяжёлые» пакеты):**

Zonal:

```powershell
gcloud container clusters update exponat-staging `
  --zone=europe-west3-a `
  --monitoring=SYSTEM
```

Regional:

```powershell
gcloud container clusters update exponat-staging `
  --region=europe-west3 `
  --monitoring=SYSTEM
```

**Шаг B — отключить Managed Prometheus:**

```powershell
gcloud container clusters update exponat-staging `
  --zone=europe-west3-a `
  --disable-managed-prometheus
```

(Для regional замените `--zone=…` на `--region=…`.)

Для **нового** кластера при создании: **`--no-enable-managed-prometheus`** и при необходимости сразу **`--monitoring=SYSTEM`**, чтобы не тащить лишние пакеты.

**Последствия:** после шага A пропадут отдельные «пакетные» метрики (kube-state/cAdvisor по списку GKE), не только Prometheus; после шага B не будет встроенного **Managed Prometheus**. Для staging обычно приемлемо. Базовые **system metrics** (`kubernetes.io/...`) при `SYSTEM` сохраняются.

**2. Проверка после обновления**

```powershell
kubectl get pods -n gmp-system
kubectl describe nodes | Select-String -Pattern "Allocated resources" -Context 0,8
```

Часть подов исчезнет после применения настроек (иногда **несколько минут**).

**3. Что не отключаем без необходимости**

- **Logging** (Fluent Bit) — отключение усложняет отладку; при необходимости смотрите [документацию GKE по логам](https://cloud.google.com/kubernetes-engine/docs/how-to/hardening-your-cluster#logging).
- **CSI / сетевые** аддоны — нужны для дисков и сети.

**4. Консоль**

Альтернатива CLI: **Google Cloud Console → Kubernetes Engine → кластер → вкладка «Наблюдаемость» / Observability** — отключите компоненты мониторинга, которые не нужны на staging.

---

## 6. Cloud SQL: одна PostgreSQL, две базы

Создайте инстанс (минимальный tier для staging, например `db-f1-micro` или `db-g1-small` — по нагрузке):

```bash
export SQL_INSTANCE="exponat-staging-pg"

gcloud sql instances create "exponat-staging-pg" `
  --database-version=POSTGRES_16 `
  --edition=ENTERPRISE `
  --tier=db-f1-micro `
  --region="europe-west3" `
  --network=projects/exponat-staging-491022/global/networks/exponat-staging-vpc `
  --no-assign-ip `
  --root-password=$([Convert]::ToBase64String([byte[]](1..18 | ForEach-Object { Get-Random -Maximum 256 })))
```

**PowerShell (тот же сценарий: инстанс → пользователь → базы):**

```powershell
$env:SQL_INSTANCE = "exponat-staging-pg"
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
$bytes = New-Object byte[] 24
$rng.GetBytes($bytes)
$rootPass = [Convert]::ToBase64String($bytes)
gcloud sql instances create $env:SQL_INSTANCE `
  --database-version=POSTGRES_16 `
  --tier=db-g1-small `
  --region=$env:REGION `
  --network=projects/$env:PROJECT_ID/global/networks/$env:NETWORK `
  --no-assign-ip `
  --root-password=$rootPass
$env:APP_DB_USER = "exponat"
$rng.GetBytes($bytes)
$env:APP_DB_PASS = [Convert]::ToBase64String($bytes)
gcloud sql users create $env:APP_DB_USER `
  --instance=$env:SQL_INSTANCE `
  --password=$env:APP_DB_PASS
gcloud sql databases create exponat_staging --instance=$env:SQL_INSTANCE
gcloud sql databases create keycloak --instance=$env:SQL_INSTANCE
```

Создайте пользователя приложения и базы (bash, если инстанс уже создан первым блоком выше):

```bash
export APP_DB_USER="exponat"
export APP_DB_PASS="$(openssl rand -base64 24)"

gcloud sql users create "$APP_DB_USER" \
  --instance="$SQL_INSTANCE" \
  --password="$APP_DB_PASS"

gcloud sql databases create exponat_staging --instance="$SQL_INSTANCE"
gcloud sql databases create keycloak --instance="$SQL_INSTANCE"
```

Права: для Keycloak удобно завести отдельного пользователя только на БД `keycloak` (через `psql` после подключения) — по политике безопасности.

**Подключение из GKE к Cloud SQL:**

- Рекомендуется **[Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/connect-kubernetes-engine)** как sidecar или отдельный Deployment + Unix socket / TCP.
- Альтернатива: **Workload Identity** + встроенный коннектор в приложении (Go: `cloud.google.com/go/cloudsqlconn`).

Важно: Helm-чарт `infrastructure/helm/exponat` в шаблонах **не прописывает** `DATABASE_URL` и другие переменные — их нужно добавить в chart или через **Kustomize/патчи** / `kubectl set env` после релиза. Для staging обычно создают `Secret` и монтируют через `envFrom` в расширенном values или отдельном overlay.

Пример строки подключения (после настройки прокси на `127.0.0.1:5432` в поде):

```text
postgresql://exponat:ПАРОЛЬ@127.0.0.1:5432/exponat_staging?sslmode=disable
```

(для прямого SSL к Cloud SQL — используйте параметры из консоли Cloud SQL и корневой сертификат.)

---

## 7. Redis

**Вариант A — Memorystore (управляемый Redis):**

```bash
gcloud redis instances create exponat-staging-redis \
  --size=1 \
  --region="$REGION" \
  --network=projects/${PROJECT_ID}/global/networks/${NETWORK} \
  --redis-version=redis_7_x \
  --tier=basic
```

Запишите **host** и **port** из вывода — их передадите сервисам в переменных окружения.

**Вариант B — Redis из Helm (Bitnami)** в том же namespace, если в `values.yaml` у вас `redis.enabled: true` — дешевле по счёту GCP, но операционно это ещё один Stateful workload в кластере.

Для соответствия «одна Postgres» Redis отдельно — это нормально; ограничение касалось именно **не дублировать второй кластер PostgreSQL**.

---

## 8. Artifact Registry и образы

Создайте репозиторий для Docker-образов:

```bash
gcloud artifacts repositories create exponat \
  --repository-format=docker \
  --location="$REGION" \
  --description="Exponat services"

gcloud auth configure-docker "${REGION}-docker.pkg.dev"
```

В CI собирайте образы вида:

```text
${REGION}-docker.pkg.dev/${PROJECT_ID}/exponat/<service>:<tag>
```

и в Helm переопределите `image.registry` / тег (сейчас в `values.yaml` указано `ghcr.io` — для GCP замените на свой Artifact Registry).

Настройте **Workload Identity**, чтобы GitHub Actions (или Cloud Build) пушил образы без долгоживущих JSON-ключей:

- [Workload Identity Federation для GitHub](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines).

---

## 9. Ingress и TLS

Установите **ingress-nginx** (привычная связка с Kong и cert-manager):

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

Получите внешний IP Ingress:

```bash
kubectl get svc -n ingress-nginx
```

**DNS:** создайте A-запись для `api.staging.exponat.site` (или ваш домен) на этот IP.

**TLS:** [Google-managed certificates](https://cloud.google.com/kubernetes-engine/docs/how-to/managed-certs) для GKE Ingress **или** cert-manager + Let’s Encrypt.

В `infrastructure/helm/exponat/values-staging.yaml` указан хост `api.staging.exponat.site` — привяжите его к реальному DNS в GCP или у регистратора.

---

## 10. Kong API Gateway в GCP

Workflow деплоя создаёт ConfigMap и ставит chart `kong/kong` с `kong-values-common.yaml` + `kong-values-staging.yaml`.

Для **GCP** удалите или замените аннотации Yandex в `kong-values-common.yaml`:

```yaml
proxy:
  type: LoadBalancer
  annotations:
    yandex.cloud/load-balancer-type: external   # ← убрать для GCP
    yandex.cloud/subnet-id: "..."               # ← убрать
```

На GKE достаточно `type: LoadBalancer` без этих аннотаций (получите внешний IP сервиса Kong). Для **staging** можно уменьшить `replicaCount` с `3` до `1`, чтобы снизить стоимость.

```bash
kubectl create namespace kong --dry-run=client -o yaml | kubectl apply -f -
kubectl create configmap kong-dbless-config \
  --from-file=kong.yml=./infrastructure/kong/kong.yml \
  -n kong --dry-run=client -o yaml | kubectl apply -f -

helm repo add kong https://charts.konghq.com && helm repo update
helm upgrade --install kong kong/kong \
  -f ./infrastructure/kong/kong-values-common.yaml \
  -f ./infrastructure/kong/kong-values-staging.yaml \
  -n kong --wait --timeout 10m
```

Проверьте маршруты в `infrastructure/kong/kong.yml`: upstream’ы должны указывать на **Kubernetes Service**-имена в namespace `staging` (например `http://projects:80` при `port: 80` у Service).

---

## 11. Namespace и секреты

```bash
kubectl create namespace staging
```

Создайте секреты с паролями БД, Redis, JWT, Keycloak (пример структуры — имена согласуйте с вашими Deployment):

```bash
kubectl create secret generic exponat-staging-secrets \
  --namespace=staging \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=REDIS_ADDR='memorystore-ip:6379' \
  --from-literal=OIDC_ISSUER='https://auth.staging.example.com/realms/...'
```

Дальше нужно **добавить в Helm-шаблоны** `envFrom` или явные `env`, ссылающиеся на этот Secret — текущий `deployment.yaml` этого не содержит.

---

## 12. Установка приложения (Helm)

```bash
helm upgrade --install exponat ./infrastructure/helm/exponat \
  -f ./infrastructure/helm/exponat/values-staging.yaml \
  --namespace staging \
  --create-namespace \
  --wait
```

Для GCP staging **отключите** встроенные в chart Bitnami PostgreSQL/Redis, если используете Cloud SQL и Memorystore — в отдельном файле, например `values-staging-gcp.yaml`:

```yaml
postgresql:
  enabled: false
redis:
  enabled: false
```

```bash
helm upgrade --install exponat ./infrastructure/helm/exponat \
  -f ./infrastructure/helm/exponat/values-staging.yaml \
  -f ./infrastructure/helm/exponat/values-staging-gcp.yaml \
  --namespace staging \
  --wait
```

Проверка:

```bash
kubectl get pods -n staging
kubectl get ingress -n staging
```

---

## 13. Keycloak на staging

Локально Keycloak использует вторую БД на том же Postgres (`migrations/initdb/000_keycloak_database.sql`). В GCP: та же схема — **один Cloud SQL**, БД `keycloak`, отдельный пользователь с доступом только к ней.

Развёртывание в Kubernetes: официальный chart или образ `quay.io/keycloak/keycloak` + переменные `KC_DB_URL`, как в `docker-compose.yml`. Внешний доступ — отдельный Ingress / поддомен `auth.staging...`, в Vercel/Next.js — `KEYCLOAK_ISSUER` на этот URL.

---

## 14. Миграции схемы БД

Выполните миграции из `migrations/app/` через **golang-migrate** против `exponat_staging` (см. `infrastructure/k8s/apply_exponat_app_migrations.sh` или Cloud SQL Proxy + `migrate up`). Порядок задаёт номер в имени файла `NNNNNN_*.up.sql`.

---

## 15. GitHub Actions и GKE

Текущий workflow ожидает секрет **`KUBE_CONFIG_STAGING`** с kubeconfig. Для GCP:

1. Сгенерируйте kubeconfig после `get-credentials` (без долгоживущих ключей в репозитории — лучше OIDC + Workload Identity Federation).
2. Либо используйте **[google-github-actions/auth](https://github.com/google-github-actions/auth)** + `get-credentials` в job.

Замените триггер `develop` на вашу ветку, если используете Git Flow с `feature/*` → PR → `develop`.

---

## 16. Чеклист приёмки staging

- [ ] `kubectl get nodes` — узлы Ready.
- [ ] Cloud SQL — инстанс Running, две БД созданы.
- [ ] Поды `staging` и `kong` — Running.
- [ ] Health сервисов (`/health`) отвечают через Kong или напрямую по ClusterIP.
- [ ] DNS на Ingress / Kong LB указывает на нужный IP.
- [ ] TLS открывает UI/API без ошибок сертификата.
- [ ] Фронтенд (Vercel или Cloud Run) настроен на `NEXT_PUBLIC_*` URL API staging.

---

## 17. Стоимость и удешевление

- Один регион, одна зона, **один** узел GKE или Autopilot с минимальными ресурсами.
- **Preemptible** узлы для некритичного staging.
- Cloud SQL **минимальный tier**, без HA.
- Один инстанс PostgreSQL на среду (без второго кластера БД).
- Отключить неиспользуемые API и удалить Load Balancer / диски после тестов.

Официальный калькулятор: [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator).

---

## 18. Соответствие коду в репозитории

| Артефакт | Назначение |
|----------|------------|
| `infrastructure/kong/kong.yml` | Маршруты и плагины Kong |
| `infrastructure/kong/kong-values-common.yaml` + `kong-values-staging.yaml` | Helm Kong; **очистить аннотации Yandex** в common для GCP |
| `infrastructure/helm/exponat/values-staging.yaml` | Реплики staging, Ingress host |
| `.github/workflows/deploy-staging.yml` | Порядок: Kong → Helm exponat, Vercel для `web/` |
| `infrastructure/terraform/environments/staging/` | Пример Terraform **не для GCP** — для GCP state храните в **GCS bucket** (`terraform { backend "gcs" { ... } }`) при появлении модулей |

При появлении отдельного Terraform под GCP перенесите backend state в GCS и провайдер `google` — эта инструкция остаётся валидной на уровне архитектуры и команд `gcloud`.

---

Если нужно, следующим шагом можно добавить в репозиторий готовый `values-staging-gcp.yaml` и патч `kong-values-gcp.yaml`, чтобы не править файлы вручную при каждом деплое.
