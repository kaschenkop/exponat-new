from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "ai-document-gen"


def test_list_templates() -> None:
    response = client.get("/api/v1/ai/documents/templates")
    assert response.status_code == 200
    data = response.json()
    assert "templates" in data
    assert len(data["templates"]) > 0


def test_generate_document() -> None:
    response = client.post(
        "/api/v1/ai/documents/generate",
        json={
            "project_id": "test-123",
            "template_type": "exhibition-plan",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["template_type"] == "exhibition-plan"
    assert "document_id" in data
    assert "content" in data
