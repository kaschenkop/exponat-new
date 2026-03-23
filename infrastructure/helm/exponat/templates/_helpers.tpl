{{/*
Имя сервиса/Deployment в Kubernetes (DNS-1035): ключ values → kebab-case, напр. aiDocumentGen → ai-document-gen.
*/}}
{{- define "exponat.k8sServiceName" -}}
{{- . | kebabcase -}}
{{- end }}
