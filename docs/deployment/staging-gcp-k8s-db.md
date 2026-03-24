# Staging в GCP: PostgreSQL и Redis внутри Kubernetes

Инструкция для случая, когда **нет Cloud SQL и Memorystore**: базы крутятся в кластере **GKE** как StatefulSet (через субчарты **Bitnami** в Helm-чарте `infrastructure/helm/exponat`). Это обычно **дешевле**, чем managed-сервисы, но **вы** отвечаете за резервные копии, обновления и устойчивость к перезапускам нод.

**См. также:** общая схема VPC и GKE — [staging-gcp.md](./staging-gcp.md). Здесь предполагается, что кластер уже создан и `kubectl` настроен.

---

## 1. Когда так делать

| Плюсы | Минусы |
|--------|--------|
| Ниже счёт (нет отдельной платы за Cloud SQL / Memorystore) | Нет автоматических бэкапов как у Cloud SQL |
| Всё в одном namespace / одном Helm-релизе | **Preemptible-ноды** могут убить под — нужны PV и понимание риска |
| Удобно для dev/staging с малым RPS | Для production лучше managed БД или отдельный кластер под stateful |

**Рекомендация:** для **staging** с **прерываемыми** узлами либо используйте **обычные** ноды для пула с БД, либо смиритесь с редкими рестартами и храните **снимки** перед важными тестами.

### Деплой из GitHub Actions (`Deploy to Staging`)

Kubeconfig, снятый на **Windows** (`gke-gcloud-auth-plugin.exe`), на **ubuntu-latest** в Actions **не работает**. Для GKE в CI задайте:

1. Секрет **`GCP_SA_KEY`** — JSON ключ сервисного аккаунта с ролью минимум **`roles/container.developer`** (или набор прав на деплой в нужные namespace).
2. **Repository variables** (или variables окружения **staging**): **`GCP_PROJECT_ID`**, **`GKE_CLUSTER_NAME`**, **`GKE_LOCATION`** — значение из `gcloud container clusters list` (колонка LOCATION): для **zonal** — зона (`europe-west3-a`), для **regional** — регион (`europe-west3`). См. [github-actions-gke-windows.md](./github-actions-gke-windows.md).

Переменную **`KUBERNETES_AUTH=kubeconfig`** задавайте только если используете секрет **`KUBE_CONFIG_STAGING`** с машины **Linux/macOS** (`kubectl config view --raw --minify --flatten`).

Пошагово под **Windows (PowerShell)**: [github-actions-gke-windows.md](./github-actions-gke-windows.md).

**GHCR (образы `ghcr.io/...`):** опционально **`GHCR_READ_PACKAGES_TOKEN`** (PAT с **`read:packages`**) — чтобы `Secret/ghcr-credentials` в кластере **оставался рабочим между деплоями** (kubelet тянет образы и после завершения job). **Username** для PAT = логин владельца PAT; при необходимости **`GHCR_DOCKER_USERNAME`**. Если PAT на OAuth для `repository:<owner>/web` отвечает **403 / DENIED** (часто у **fine-grained** без явного доступа к Packages или при **SSO**), это **не мешает пушу** в CI: там используется **`GITHUB_TOKEN`**. Workflow **Deploy to Staging** в таком случае записывает в кластер **`GITHUB_TOKEN`** того же прогона (тот же доступ к пакетам репозитория); он **перестаёт действовать после окончания job** — для долгого окна без деплоев всё же настройте PAT или сделайте пакет **public** для staging. **IfNotPresent** у подов снижает частоту pull с кластера. Перед Helm workflow создаёт **`exponat-backend-env`** из **`exponat-postgres-auth`** / **`exponat-redis-auth`**, если секрета ещё нет (`infrastructure/k8s/ensure_exponat_backend_env.py`).

---

## 2. Что уже есть в репозитории

В `infrastructure/helm/exponat/Chart.yaml` объявлены зависимости:

- **postgresql** (Bitnami), `condition: postgresql.enabled`
- **redis** (Bitnami), `condition: redis.enabled`

В `values.yaml` по умолчанию `postgresql.enabled: true` и `redis.enabled: true`. Для GCP in-cluster в **`values-staging-gcp-incluster.yaml`** к деплоям **projects / budget / dashboard** подключён **`envFrom`** → Secret **`exponat-backend-env`** (см. § 4 ниже).

---

## 3. Подготовка Helm-зависимостей

Из корня репозитория:

```bash
cd infrastructure/helm/exponat
helm dependency update
```

Зависимости тянутся из **OCI** `oci://registry-1.docker.io/bitnamicharts` (см. `Chart.yaml`), без `helm repo add` — так обходится **403** на `https://charts.bitnami.com/bitnami` у части сетей/регионов.

Должны появиться архивы в `charts/` (postgresql-*.tgz, redis-*.tgz).

---

## 4. Файл значений для GCP + БД в кластере

В репозитории есть **`infrastructure/helm/exponat/values-staging-gcp-incluster.yaml`** — подключайте вторым `-f` к `values-staging.yaml`. В Git **нет паролей**: используются только имена Kubernetes **Secret** (`existingSecret`).

### Секреты (обязательно до `helm install`)

Сгенерируйте свои пароли (менеджер паролей / `openssl rand -base64 24`). Если пароли когда-либо попадали в Git — **считайте их скомпрометированными** и задайте новые; при необходимости очистите историю (`git filter-repo` и т.п.) и смените пароли в кластере.

**1. PostgreSQL** — Secret `exponat-postgres-auth` в namespace `staging`:

- ключ **`postgres-password`** — пароль суперпользователя `postgres` (нужен для админки и одноразовых SQL);
- ключ **`password`** — пароль пользователя `exponat` (приложение).

**Bash:**

```bash
kubectl create namespace staging --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic exponat-postgres-auth -n staging \
  --from-literal=postgres-password='СГЕНЕРИРУЙТЕ_САМИ' \
  --from-literal=password='СГЕНЕРИРУЙТЕ_САМИ' \
  --dry-run=client -o yaml | kubectl apply -f -
```

**PowerShell:**

```powershell
kubectl create namespace staging --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic exponat-postgres-auth -n staging `
  --from-literal=postgres-password='СГЕНЕРИРУЙТЕ_САМИ' `
  --from-literal=password='СГЕНЕРИРУЙТЕ_САМИ' `
  --dry-run=client -o yaml | kubectl apply -f -
```

**2. Redis** — Secret `exponat-redis-auth`, ключ **`redis-password`**:

```bash
kubectl create secret generic exponat-redis-auth -n staging \
  --from-literal=redis-password='СГЕНЕРИРУЙТЕ_САМИ' \
  --dry-run=client -o yaml | kubectl apply -f -
```

**Не коммитьте:** пароли, `*-secrets.yaml`, сгенерированные `.sql` с паролями. В `.gitignore` можно добавить шаблон `*.local.yaml` для локальных overrides.

**3. Микросервисы (projects, budget, dashboard)** — Secret **`exponat-backend-env`** в `staging`. Пароли берутся из уже созданных **`exponat-postgres-auth`** и **`exponat-redis-auth`** (скрипт ничего не печатает в консоль кроме результата `kubectl apply`):

**PowerShell:**

```powershell
kubectl create namespace staging --dry-run=client -o yaml | kubectl apply -f -

$b64pw = kubectl get secret exponat-postgres-auth -n staging -o jsonpath='{.data.password}'
$pw = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($b64pw))
$enc = [uri]::EscapeDataString($pw)
$dbUrl = "postgres://exponat:${enc}@exponat-postgresql:5432/exponat_staging?sslmode=disable"

$b64r = kubectl get secret exponat-redis-auth -n staging -o jsonpath='{.data.redis-password}'
$rpw = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($b64r))

kubectl create secret generic exponat-backend-env -n staging `
  --from-literal=DATABASE_URL=$dbUrl `
  --from-literal=REDIS_ADDR=exponat-redis-master:6379 `
  --from-literal=REDIS_PASSWORD=$rpw `
  --from-literal=SKIP_AUTH=true `
  --from-literal=DEFAULT_ORGANIZATION_ID=11111111-1111-1111-1111-111111111111 `
  --dry-run=client -o yaml | kubectl apply -f -
```

Для **строгого JWT** уберите `SKIP_AUTH` и задайте в том же Secret переменные из кода (`OIDC_ISSUER`, `JWT_SECRET`, …).

**4. Next.js (фронт в GKE)** — Secret **`exponat-web-env`** в `staging` (обычный `generic`, все ключи как **переменные окружения** контейнера `web`):

| Ключ | Назначение |
|------|------------|
| `NEXTAUTH_URL` | Публичный URL фронта, например `https://app.staging.exponat.site` |
| `NEXTAUTH_SECRET` | Случайная строка ≥ 32 символов |
| `NEXT_PUBLIC_API_BASE_URL` | Базовый URL API (часто тот же хост, что у Kong, например `https://api.staging.exponat.site`) |
| `NEXT_PUBLIC_PROJECTS_API_URL` | Обычно совпадает с `NEXT_PUBLIC_API_BASE_URL` |
| `KEYCLOAK_ISSUER` | URL realm, например `https://auth.staging.exponat.site/realms/your-realm` |
| `KEYCLOAK_CLIENT_ID` | Client ID веб-приложения в Keycloak |

Пример (подставьте свои значения):

```powershell
kubectl create secret generic exponat-web-env -n staging `
  --from-literal=NEXTAUTH_URL='https://app.staging.exponat.site' `
  --from-literal=NEXTAUTH_SECRET='СГЕНЕРИРУЙТЕ_МИНИМУМ_32_СИМВОЛА' `
  --from-literal=NEXT_PUBLIC_API_BASE_URL='https://api.staging.exponat.site' `
  --from-literal=NEXT_PUBLIC_PROJECTS_API_URL='https://api.staging.exponat.site' `
  --from-literal=KEYCLOAK_ISSUER='https://ВАШ_KEYCLOAK/realms/ВАШ_REALM' `
  --from-literal=KEYCLOAK_CLIENT_ID='exponat-web' `
  --dry-run=client -o yaml | kubectl apply -f -
```

**DNS:** A/CNAME **`app.staging.exponat.site`** → внешний адрес **Ingress** (nginx). API по-прежнему через **Kong** (`api.staging…` или IP балансировщика Kong) — см. CORS в `infrastructure/kong/kong.yml` (origin `https://app.staging.exponat.site`).

### Keycloak в staging (Helm Bitnami)

Развёртывание из CI: после успешного `helm exponat` workflow ставит **Keycloak** в тот же namespace **`staging`**, БД **`keycloak`** в существующем **Postgres** (`exponat-postgresql`), импортирует realm из `infrastructure/keycloak/realm-export.json` (job **keycloak-config-cli**).

1. **GitHub** — в environment **staging** добавьте секрет **`KEYCLOAK_STAGING_ADMIN_PASSWORD`** (сильный пароль для пользователя **admin** в консоли Keycloak).
2. **DNS** — A-запись **`auth.staging`** → тот же **внешний IP Ingress** (nginx), что и для фронта (`app.staging`), если Keycloak отдаётся через тот же Ingress-класс.
3. **Фронт** — в Secret **`exponat-web-env`** задайте  
   `KEYCLOAK_ISSUER=https://auth.staging.exponat.site/realms/exponat-development`  
   (realm **`exponat-development`** как в экспорте). После смены секрета перезапустите Deployment **`web`**.

Локально / без полного CI:

```bash
kubectl create secret generic keycloak-admin -n staging --from-literal=password='ВАШ_ПАРОЛЬ_ADMIN' --dry-run=client -o yaml | kubectl apply -f -
python3 infrastructure/k8s/ensure_keycloak_staging.py staging
kubectl create configmap keycloak-realm-export -n staging \
  --from-file=realm-export.json=./infrastructure/keycloak/realm-export.json \
  --dry-run=client -o yaml | kubectl apply -f -
helm upgrade --install keycloak oci://registry-1.docker.io/bitnamicharts/keycloak \
  --version 24.0.5 \
  -f ./infrastructure/keycloak/helm/values-staging-gke.yaml \
  -n staging --timeout 20m --wait
```

Values: `infrastructure/keycloak/helm/values-staging-gke.yaml`. Образы тянутся с **`public.ecr.aws/bitnami/...`** (как Postgres в `values-staging-gcp-incluster.yaml`), чтобы реже упираться в лимит Docker Hub.

После появления Keycloak для **строгого JWT** на бэкенде уберите `SKIP_AUTH` из **`exponat-backend-env`** и задайте **`OIDC_ISSUER`** с тем же URL, что и `KEYCLOAK_ISSUER` (см. `docs/keycloak-setup.md`).

### Keycloak: отдельная БД на том же Postgres (ручной SQL, если без скрипта)

Если не используете `ensure_keycloak_staging.py`, после первого успешного старта PostgreSQL выполните **один раз**. Имя StatefulSet: `kubectl get sts -n staging` (часто `exponat-postgresql`).

**Интерактивный psql** (пароль суперпользователя `postgres` — Secret `exponat-postgres-auth`, ключ `postgres-password`):

```bash
kubectl exec -it -n staging sts/exponat-postgresql -c postgresql -- psql -U postgres
```

В консоли `psql`:

```sql
CREATE USER keycloak WITH PASSWORD 'ваш_секрет_для_keycloak_в_бд';
CREATE DATABASE keycloak OWNER keycloak;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;
\q
```

**Не кладите** этот SQL с реальными паролями в репозиторий.

**Альтернатива до первого запуска БД:** временный файл `init-keycloak.sql` (в `.gitignore`), Secret `kubectl create secret generic exponat-postgres-init-scripts -n staging --from-file=00-keycloak-db.sql=init-keycloak.sql` и в **локальном** (не коммитимом) patch values поле `primary.initdb.scriptsSecret: exponat-postgres-init-scripts`. Если PVC уже создан без этого шага, initdb не выполнится повторно — используйте интерактивный `psql` или скрипт выше.

Имена сервисов Kubernetes после установки релиза `exponat` в namespace `staging` (типично для Bitnami как субчартов):

- PostgreSQL: **`exponat-postgresql`** (порт **5432**)
- Redis: **`exponat-redis-master`** (порт **6379**)

Точные имена проверьте:

```bash
kubectl get svc -n staging
```

---

## 5. Установка

```bash
kubectl create namespace staging --dry-run=client -o yaml | kubectl apply -f -

helm upgrade --install exponat ./infrastructure/helm/exponat `
  -f ./infrastructure/helm/exponat/values-staging.yaml `
  -f ./infrastructure/helm/exponat/values-staging-gcp-incluster.yaml `
  --namespace staging `
  --wait --timeout 15m
```

Проверка:

```bash
kubectl get pods -n staging
kubectl get pvc -n staging
```

Статус БД:

```bash
kubectl exec -n staging deploy/exponat-postgresql -- pg_isready -U exponat
```

(имя деплоя может быть `exponat-postgresql` — уточните `kubectl get deploy -n staging`.)

Если в Events **`Insufficient cpu`**: либо **увеличьте ёмкость кластера** (вторая нода или `e2-standard-2`), см. раздел **«5.1 Масштаб ноды»** в [staging-gcp.md](./staging-gcp.md), либо используйте урезанные **`values-staging-lowfootprint.yaml`** + **`values-staging-gcp-incluster-lowfootprint.yaml`** вместо обычных `values-staging*.yaml`.

### Типичные ошибки в консоли GKE (ваш случай)

| Симптом | Что обычно не так | Что сделать |
|--------|-------------------|-------------|
| **Postgres — Unschedulable** | Не хватает **CPU/RAM** по requests на ноде (плюс 4 Deployment + системные поды). | Вторая нода или **e2-standard-2** ([staging-gcp.md § 5.1](./staging-gcp.md)); либо **`values-staging-gcp-bootstrap.yaml`** (отключить микросервисы, оставить только БД) + при необходимости **`values-staging-gcp-incluster-lowfootprint.yaml`**. Если ноды **забиты аддонами GKE** (~900m/940m), отключите **Managed Prometheus** и лишний мониторинг: [staging-gcp.md § 5.2](./staging-gcp.md). |
| **Postgres / Redis — ImagePullBackOff** | Часто лимит **Docker Hub** (`docker.io/bitnami/*`) или сеть. | В `values-staging-gcp-incluster.yaml` задано зеркало **`public.ecr.aws/bitnami/...`** — выполните `helm upgrade`. Иначе: Hub login + `global.imagePullSecrets` или свой mirror; детали — `kubectl describe pod` на `exponat-postgresql-0` / redis. |
| **projects / dashboard / … — ImagePullBackOff / 403 ghcr** | В Events: `failed to fetch anonymous token` / **403** — пакет **приватный**, кластер тянет образ без учётки. | Создайте **imagePullSecret** для `ghcr.io` (PAT с `read:packages`), пропишите **`global.imagePullSecrets`** в values и `helm upgrade` (см. комментарий в `values-staging-gcp-incluster.yaml`). Либо сделайте пакеты **public** в GitHub. |
| **projects / dashboard / … — Does not have minimum availability** | Иначе: **нет образа** (404 / manifest unknown) или под падает после старта. | CI пушит в **`ghcr.io/<owner>/<сервис>`** (`owner` = GitHub owner репозитория); Helm в deploy-staging задаёт **`image.repositoryPrefix`**. Для ручного деплоя выставьте тот же префикс, что у образов в GHCR. Либо **`values-staging-gcp-bootstrap.yaml`**. |
| **В логах `localhost:5432` / `exponat_dev` при том что в Deployment уже есть `envFrom`** | Часто **залипший rolling update**: новый ReplicaSet не стартует (**ImagePullBackOff**), старый под без `envFrom` ещё работает и шумит в логах. | Почините pull с GHCR; либо временно **`kubectl scale rs <старое-имя> -n staging --replicas=0`** (имя из `kubectl get rs -l app=projects`). После успешного pull новый под поднимется с **`DATABASE_URL`**. |
| **networking-dra-driver — 0/0** | Системный DaemonSet GKE. | К **приложению** обычно не относится; можно не трогать, если ноды **Ready**. |
| **Kong — `FailedScheduling` / `Insufficient cpu`** (namespace `kong`) | Ноды уже заняты requests (exponat + системные поды), под Kong не влезает. | Уменьшить **`resources.requests.cpu`** в `infrastructure/kong/kong-values-staging.yaml` (по умолчанию снижено до **50m**), либо вторая нода / тип ВМ крупнее, либо временно освободить CPU (`kubectl describe nodes`). |
| **Helm exponat: `web` — `may not specify more than 1 handler type`** | После ручного patch у пробы остались и **httpGet**, и **tcpSocket**. В PowerShell inline JSON к `kubectl patch` часто ломается. | Из корня репозитория: `kubectl patch deployment web -n staging --type=json --patch-file=./infrastructure/k8s/patches/web-deployment-probes-http.json` — затем снова `helm upgrade`. |
| **CI: `Get https://…/api/v1/... context deadline exceeded`** | Это **API control plane GKE** (в логе часто IP), не сервис **web**. Runner GitHub не достучался до apiserver: **Authorized networks**, приватный endpoint, сеть. | [github-actions-gke-windows.md](./github-actions-gke-windows.md) — раздел **«Таймаут Kubernetes API»**; при DNS-based endpoint в GKE — variable **`GKE_USE_DNS_BASED_ENDPOINT=true`**. |

**Режим «дешево, всё сразу» на 1–2× e2-medium** (урезанные requests, без смены типа ВМ):

```bash
helm upgrade --install exponat ./infrastructure/helm/exponat \
  -f ./infrastructure/helm/exponat/values-staging-lowfootprint.yaml \
  -f ./infrastructure/helm/exponat/values-staging-gcp-incluster.yaml \
  -f ./infrastructure/helm/exponat/values-staging-gcp-incluster-lowfootprint.yaml \
  --namespace staging --atomic --timeout 20m
```

Ориентировочно по CPU requests: 4×80m + 150m (Postgres) + 50m (Redis) ≈ **520m** только под чарт; Kong staging — **50m** (`kong-values-staging.yaml`). Системные поды GKE часто съедают **~850–930m** из **940m** allocatable на e2-medium — без второй ноды или урезания аддонов Kong мог не влезать при **150m** request.

**Команда «сначала только БД», затем образы приложений:**

```bash
helm upgrade --install exponat ./infrastructure/helm/exponat \
  -f ./infrastructure/helm/exponat/values-staging.yaml \
  -f ./infrastructure/helm/exponat/values-staging-gcp-incluster.yaml \
  -f ./infrastructure/helm/exponat/values-staging-gcp-bootstrap.yaml \
  -f ./infrastructure/helm/exponat/values-staging-gcp-incluster-lowfootprint.yaml \
  --namespace staging --atomic --timeout 20m
```

Когда Postgres и Redis **Running**, уберите из команды **`values-staging-gcp-bootstrap.yaml`** и **`...-lowfootprint.yaml`**, добавьте образы в registry и повторите upgrade.

---

## 6. Строки подключения для приложений

Внутри кластера (тот же namespace `staging`):

```text
DATABASE_URL=postgresql://exponat:ПАРОЛЬ@exponat-postgresql:5432/exponat_staging?sslmode=disable
REDIS_ADDR=exponat-redis-master:6379
```

Для Keycloak (отдельный Deployment, если поднимаете):

```text
KC_DB_URL=jdbc:postgresql://exponat-postgresql:5432/keycloak
```

Пароль пользователя `keycloak` в БД задаётся одноразовой командой из § 4 (не храните его в Git).

**Важно:** для GCP in-cluster задайте Secret **`exponat-backend-env`** (§ 4) — в `values-staging-gcp-incluster.yaml` уже подключён **`envFrom`** для **projects / budget / dashboard**.

---

## 7. Диски и StorageClass в GKE

- По умолчанию часто есть класс **`standard-rwo`** (Regional) или **`standard`** (Zonal) — зависит от версии GKE.
- Убедитесь, что **PVC** в статусе `Bound`:

```bash
kubectl describe pvc -n staging
```

Если `Pending` — укажите рабочий `storageClassName` в `values` для `postgresql.primary.persistence` и `redis.master.persistence`.

---

## 8. Бэкапы (минимум для staging)

Автоматических снимков как у Cloud SQL нет. Варианты:

- Ручной дамп: `kubectl exec` + `pg_dump` в файл или в **GCS** (`gsutil`).
- [Velero](https://velero.io/) для бэкапа PVC (сложнее в настройке).
- Для совсем тестового staging — пересоздание сидов из `migrations/`.

---

## 9. Kong и Ingress

Порядок как в [staging-gcp.md](./staging-gcp.md): сначала **Ingress Controller**, затем **Kong** (namespace `kong`), затем приложения. Upstream’ы в `infrastructure/kong/kong.yml` должны указывать на **Service**-имена в `staging`.

---

## 10. Чеклист

- [ ] `helm dependency update` выполнен в `infrastructure/helm/exponat`
- [ ] PVC `Bound`, поды PostgreSQL и Redis `Running`
- [ ] Секреты с паролями не в Git
- [ ] В деплоях приложений заданы `DATABASE_URL` и Redis
- [ ] Preemptible: осознанный риск или отдельный пул без preemptible для нод с БД

---

## 11. Отказ от Cloud SQL в этой схеме

Разделы **6–8** основного [staging-gcp.md](./staging-gcp.md) про **Cloud SQL** можно **не выполнять**, если данные только в Kubernetes. **Private Service Connection** (VPC peering для Cloud SQL) для этой схемы **не нужен** — его имеет смысл не создавать, если managed SQL не используете (экономия на операциях и упрощение сети).

Если позже перейдёте на Cloud SQL, отключите встроенный PostgreSQL (`postgresql.enabled: false`), перенесите данные дампом и обновите `DATABASE_URL`.
