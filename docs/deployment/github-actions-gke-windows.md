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

### 5.2 Variables (тот же environment или Repository variables)

Добавьте переменные (имена **строго** как ниже — так ожидает workflow):

| Имя | Пример значения |
|-----|------------------|
| **`GCP_PROJECT_ID`** | `exponat-staging-491022` |
| **`GKE_CLUSTER_NAME`** | `exponat-staging` |
| **`GKE_LOCATION`** | `europe-west3-a` или `europe-west3` |

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

## 7. Проверка

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

## Сводка имён для этого репозитория

| Где | Имя |
|-----|-----|
| Секрет GitHub (environment **staging**) | **`GCP_SA_KEY`** |
| Variables | **`GCP_PROJECT_ID`**, **`GKE_CLUSTER_NAME`**, **`GKE_LOCATION`** |
| Workflow | [`.github/workflows/deploy-staging.yml`](../../.github/workflows/deploy-staging.yml) |
| Связанная документация | [staging-gcp-k8s-db.md](./staging-gcp-k8s-db.md), [staging-gcp.md](./staging-gcp.md) |
