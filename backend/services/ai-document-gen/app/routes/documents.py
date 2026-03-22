from fastapi import APIRouter

from app.models.document import DocumentRequest, DocumentResponse
from app.services.document_service import DocumentService

router = APIRouter()
service = DocumentService()


@router.post("/generate", response_model=DocumentResponse)
async def generate_document(request: DocumentRequest) -> DocumentResponse:
    return await service.generate(request)


@router.get("/templates")
async def list_templates() -> dict:
    return {"templates": service.get_templates()}
