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

---

## 2. Что уже есть в репозитории

В `infrastructure/helm/exponat/Chart.yaml` объявлены зависимости:

- **postgresql** (Bitnami), `condition: postgresql.enabled`
- **redis** (Bitnami), `condition: redis.enabled`

В `values.yaml` по умолчанию `postgresql.enabled: true` и `redis.enabled: true`. Образы приложений по-прежнему должны получать **`DATABASE_URL` и адрес Redis** — в текущих шаблонах `deployment.yaml` переменные **не заданы**; их нужно добавить в chart или через **Kustomize / патчи** после установки (см. ниже).

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
kubectl create secret generic exponat-redis-auth -n staging `
  --from-literal=redis-password='СГЕНЕРИРУЙТЕ_САМИ' `
  --dry-run=client -o yaml | kubectl apply -f -
```

**Не коммитьте:** пароли, `*-secrets.yaml`, сгенерированные `.sql` с паролями. В `.gitignore` можно добавить шаблон `*.local.yaml` для локальных overrides.

### Keycloak: отдельная БД на том же Postgres

После первого успешного старта PostgreSQL выполните **один раз**. Имя StatefulSet уточните: `kubectl get sts -n staging` (часто `exponat-postgresql`).

**Проще всего — интерактивный psql** (пароль суперпользователя `postgres` — тот, что в Secret `exponat-postgres-auth`, ключ `postgres-password`):

```bash
kubectl exec -it -n staging sts/exponat-postgresql -- psql -U postgres
```

В консоли `psql`:

```sql
CREATE USER keycloak WITH PASSWORD 'ваш_секрет_для_keycloak_в_бд';
CREATE DATABASE keycloak OWNER keycloak;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;
\q
```

**Не кладите** этот SQL в репозиторий.

**Альтернатива до первого запуска БД:** временный файл `init-keycloak.sql` (в `.gitignore`), Secret `kubectl create secret generic exponat-postgres-init-scripts -n staging --from-file=00-keycloak-db.sql=init-keycloak.sql` и в **локальном** (не коммитимом) patch values поле `primary.initdb.scriptsSecret: exponat-postgres-init-scripts`. Если PVC уже создан без этого шага, initdb не выполнится повторно — используйте интерактивный `psql` выше.

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
| **networking-dra-driver — 0/0** | Системный DaemonSet GKE. | К **приложению** обычно не относится; можно не трогать, если ноды **Ready**. |

**Режим «дешево, всё сразу» на 1–2× e2-medium** (урезанные requests, без смены типа ВМ):

```bash
helm upgrade --install exponat ./infrastructure/helm/exponat \
  -f ./infrastructure/helm/exponat/values-staging-lowfootprint.yaml \
  -f ./infrastructure/helm/exponat/values-staging-gcp-incluster.yaml \
  -f ./infrastructure/helm/exponat/values-staging-gcp-incluster-lowfootprint.yaml \
  --namespace staging --atomic --timeout 20m
```

Ориентировочно по CPU requests: 4×80m + 150m (Postgres) + 50m (Redis) ≈ **520m** только под чарт — помещается на одну ноду с **940m** allocatable вместе с системными подами с запасом; **вторая нода** даёт запас под Kong / ingress и пики.

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

**Важно:** расширьте шаблоны Helm (`templates/deployment.yaml`) полями `env` / `envFrom` или вынесите конфиг в **Secret** и подключите к деплоям сервисов — иначе поды не увидят `DATABASE_URL`.

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
