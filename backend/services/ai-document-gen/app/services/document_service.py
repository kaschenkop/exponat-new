import uuid

from app.models.document import DocumentRequest, DocumentResponse

TEMPLATES = [
    {"id": "exhibition-plan", "name": "План выставки", "description": "Генерация плана выставки"},
    {"id": "budget-report", "name": "Бюджетный отчёт", "description": "Автоматический отчёт по бюджету"},
    {"id": "logistics-checklist", "name": "Логистический чеклист", "description": "Чеклист для логистики"},
    {"id": "participant-brief", "name": "Бриф участника", "description": "Бриф для участника выставки"},
]


class DocumentService:
    def get_templates(self) -> list[dict]:
        return TEMPLATES

    async def generate(self, request: DocumentRequest) -> DocumentResponse:
        # Placeholder: will be replaced with actual LLM integration
        return DocumentResponse(
            document_id=str(uuid.uuid4()),
            content=f"Generated document for project {request.project_id} using template {request.template_type}",
            format="markdown",
            template_type=request.template_type,
        )
