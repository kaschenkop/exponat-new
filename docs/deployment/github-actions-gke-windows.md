# GitHub Actions → GKE (staging): сервисный аккаунт GCP под Windows

Инструкция для репозитория **exponat**: workflow [`.github/workflows/deploy-staging.yml`](../../.github/workflows/deploy-staging.yml) в CI на **Linux** получает доступ к кластеру через **JSON-ключ сервисного аккаунта** и шаги `google-github-actions/auth` + `get-gke-credentials`. Локально на **Windows** вы создаёте SA и ключ через **PowerShell** и **gcloud** (Google Cloud SDK).

**Важно:** kubeconfig, экспортированный на Windows с `gke-gcloud-auth-plugin.exe`, в GitHub Actions **не использовать** — в CI нужен описанный ниже способ (**`GCP_SA_KEY`** + variables).

---

## Что понадобится

- Установленный [Google Cloud SDK](https://cloud.google.com/sdk/docs/install-sdk#windows) (в PATH должны быть `gcloud` и при необходимости `kubectl`).
- Вход в GCP под учёткой с правами создавать сервисные аккаунты и выдавать роли на проект (например **Owner** или **IAM Admin** + доступ к GKE).
- Репозиторий на GitHub с веткой **`develop`** и настроенным environment **`staging`** (как в workflow).

---

## 1. Подставьте свои идентификаторы

В PowerShell задайте переменные (пример из документации по staging; замените на свои):

```powershell
$env:PROJECT_ID = "exponat-staging-491022"   # ваш GCP Project ID
$env:SA_NAME = "github-actions-gke-staging"
$env:SA_EMAIL = "$env:SA_NAME@$env:PROJECT_ID.iam.gserviceaccount.com"
$env:GKE_CLUSTER = "exponat-staging"         # имя кластера в GKE
$env:GKE_ZONE = "europe-west3-a"             # зона (или регион, если regional-кластер)
```

Проверить имя кластера и зону:

```powershell
gcloud config set project $env:PROJECT_ID
gcloud container clusters list
```

Если кластер **regional**, в `$env:GKE_ZONE` укажите регион, например `europe-west3`.

### `GKE_LOCATION` в GitHub — буквально как в `gcloud container clusters list`

В variable **`GKE_LOCATION`** нужно подставить значение из колонки **LOCATION** вывода:

```powershell
gcloud container clusters list --project=$env:PROJECT_ID
```

| Тип кластера | Пример LOCATION | Что вписать в `GKE_LOCATION` |
|--------------|-----------------|--------------------------------|
| **Zonal** (одна зона) | `europe-west3-a` | **`europe-west3-a`** (не `europe-west3`) |
| **Regional** | `europe-west3` | **`europe-west3`** |

Если указать только **`europe-west3`**, а кластер создан как **zonal** в `europe-west3-a`, API ищет *региональный* кластер и отвечает **`not found`**. Исправление: в GitHub Variables поменять **`GKE_LOCATION`** на зону с **`-a` / `-b`** и т.д.

Уточнить одной командой:

```powershell
gcloud container clusters describe $env:GKE_CLUSTER --project=$env:PROJECT_ID --format="value(location)"
```

Подставьте вывод этой команды в **`GKE_LOCATION`**.

---

## 2. Создать сервисный аккаунт

```powershell
gcloud iam service-accounts create $env:SA_NAME `
  --project=$env:PROJECT_ID `
  --display-name="GitHub Actions staging GKE"
```

---

## 3. Выдать роль на проект

Минимально для деплоя через `kubectl`/`helm` в GKE обычно хватает **Kubernetes Engine Developer**:

```powershell
gcloud projects add-iam-policy-binding $env:PROJECT_ID `
  --member="serviceAccount:$env:SA_EMAIL" `
  --role="roles/container.developer"
```

При ошибках вида **Forbidden** на ресурсы внутри кластера может понадобиться привязка пользователя Kubernetes к роли (см. [§ 6](#6-опционально-rbac-в-кластере)).

---

## 4. Создать JSON-ключ

Сохраните ключ в файл **вне репозитория** (каталог вроде `$HOME\.secrets`):

```powershell
$KeyPath = "$env:USERPROFILE\.secrets\gcp-github-staging.json"
New-Item -ItemType Directory -Force -Path (Split-Path $KeyPath) | Out-Null

gcloud iam service-accounts keys create $KeyPath `
  --iam-account=$env:SA_EMAIL `
  --project=$env:PROJECT_ID
```

Откройте файл в редакторе, выделите **всё содержимое** (один JSON целиком) — его нужно вставить в GitHub.

**Не коммитьте** JSON в git. После загрузки в GitHub локальный файл можно удалить или хранить в менеджере секретов.

---

## 5. Настроить GitHub

### 5.1 Environment `staging`

1. Репозиторий → **Settings** → **Environments** → **staging** (создайте, если нет).
2. **Environment secrets** → **Add secret**:
   - **`GCP_SA_KEY`** — вставьте **полный** текст JSON из шага 4 (как есть, многострочно).
   - **`GHCR_READ_PACKAGES_TOKEN`** — [Personal Access Token](https://github.com/settings/tokens) (classic) с **`read:packages`**; владелец пакетов в GHCR должен совпадать с **`github.repository_owner`** (для `kaschenkop/exponat-new` — пользователь **`kaschenkop`**). Workflow создаёт/обновляет в кластере `Secret/ghcr-credentials` в namespace **`staging`** для pull образов `ghcr.io/<owner>/...`. Не используйте заглушку вроде букв «PAT» — только реальный токен. При SSO у org — **Authorize** для токена.

### 5.2 Variables (тот же environment или Repository variables)

Добавьте переменные (имена **строго** как ниже — так ожидает workflow):

| Имя | Пример значения |
|-----|------------------|
| **`GCP_PROJECT_ID`** | `exponat-staging-491022` |
| **`GKE_CLUSTER_NAME`** | `exponat-staging` |
| **`GKE_LOCATION`** | Точно как в `gcloud`: для zonal-кластера **`europe-west3-a`**, для regional — **`europe-west3`** |

### 5.3 Режим kubeconfig (не рекомендуется для Windows → CI)

Использовать только если сознательно идёте в **KUBE_CONFIG_STAGING** с Linux/macOS. Тогда задайте variable **`KUBERNETES_AUTH`** = `kubeconfig`. Для сценария из этой инструкции **не задавайте** `KUBERNETES_AUTH` (или любое значение **кроме** `kubeconfig`).

---

## 6. (Опционально) RBAC в кластере

Если после настройки секретов в логах Actions появляется **Forbidden** от Kubernetes API при `helm upgrade` / `kubectl apply`, под своей обычной учёткой (уже с доступом к кластеру) выполните:

```powershell
gcloud container clusters get-credentials $env:GKE_CLUSTER --zone $env:GKE_ZONE --project $env:PROJECT_ID
# для regional: --region $env:GKE_ZONE

kubectl create clusterrolebinding github-actions-staging-admin `
  --clusterrole=cluster-admin `
  --user=$env:SA_EMAIL
```

**Только для staging:** `cluster-admin` широкий; для production лучше отдельный `Role` / `RoleBinding` по namespace (`staging`, `kong`).

---

## 7. Перекат только Kong через CI (без сборки образов)

Если менялись **`infrastructure/kong/*.yaml`** или **`kong.yml`** и не нужен build в GHCR:

1. Закоммитьте и **запушьте в `develop`** — сработает полный **Deploy to Staging** (образы + Kong + exponat).
2. Либо **Actions → Deploy to Staging → Run workflow**:
   - включите **Skip publish images** — пропустить job публикации в GHCR;
   - включите **Kong only** — выполнится только namespace, ConfigMap и **helm upgrade kong** (чарт **exponat** не трогается).

Таймаут ожидания готовности Kong в workflow — **15m**.

---

## 8. Проверка

1. Запушьте в **`develop`** или запустите workflow **Deploy to Staging** вручную (**Actions**).
2. Убедитесь, что шаги **Authenticate to Google Cloud** и **Get GKE credentials** проходят, затем **Deploy Kong** / **Deploy exponat**.

Локально на Windows можно проверить, что ключ вообще ходит в API (не обязательно):

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = $KeyPath
gcloud auth activate-service-account --key-file=$KeyPath
gcloud container clusters get-credentials $env:GKE_CLUSTER --zone $env:GKE_ZONE --project $env:PROJECT_ID
kubectl get ns
```

---

## Ошибка: `another operation (install/upgrade/rollback) is in progress` (Helm)

Чаще всего предыдущий прогон CI **прервали** или он упал во время `helm upgrade`, релиз остался в **`pending-upgrade`** / **`pending-install`**.

1. В новых версиях workflow перед upgrade выполняется **rollback** залипших релизов (`kong`, `exponat`).
2. Вручную: `helm status kong -n kong` / `helm status exponat -n staging` — если статус `pending-*`, то `helm rollback kong -n kong` или `helm rollback exponat -n staging`.

---

## Ошибка: `not found: projects/.../locations/.../clusters/...`

1. **`GKE_LOCATION`** не совпадает с типом кластера (часто в variable указан регион **`europe-west3`**, а кластер **zonal** в **`europe-west3-a`**) — см. блок про `gcloud container clusters describe ... value(location)` выше.
2. Неверные **`GCP_PROJECT_ID`** или **`GKE_CLUSTER_NAME`** — сверить с `gcloud container clusters list`.
3. Сервисный аккаунт без доступа к проекту обычно даёт **permission denied**, не `not found`; `not found` почти всегда про имя/локацию.

---

## Сводка имён для этого репозитория

| Где | Имя |
|-----|-----|
| Секрет GitHub (environment **staging**) | **`GCP_SA_KEY`**, **`GHCR_READ_PACKAGES_TOKEN`** |
| Variables | **`GCP_PROJECT_ID`**, **`GKE_CLUSTER_NAME`**, **`GKE_LOCATION`** |
| Workflow | [`.github/workflows/deploy-staging.yml`](../../.github/workflows/deploy-staging.yml) |
| Связанная документация | [staging-gcp-k8s-db.md](./staging-gcp-k8s-db.md), [staging-gcp.md](./staging-gcp.md) |
