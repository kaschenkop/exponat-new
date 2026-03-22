from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import documents, health

app = FastAPI(
    title="Exponat AI Document Generator",
    version="0.1.0",
    description="AI-powered document generation service for Exponat platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(documents.router, prefix="/api/v1/ai/documents", tags=["documents"])
