from pydantic import BaseModel


class DocumentRequest(BaseModel):
    project_id: str
    template_type: str
    language: str = "ru"
    context: dict | None = None


class DocumentResponse(BaseModel):
    document_id: str
    content: str
    format: str
    template_type: str
