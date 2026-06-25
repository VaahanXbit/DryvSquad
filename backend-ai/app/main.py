import sys
import os
import json

# Add 'app' and its parent 'backend-ai' to python path before any local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rag.retriever import retrieve

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llm.prompt_builder import build_prompt
from llm.llm_service import generate

app = FastAPI(
    title="Vaahan AI Mode API",
    description="RAG-powered automotive knowledge assistant",
    version="1.0.0"
)

# CORS -> allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str


class Source(BaseModel):
    title: str
    slug: str
    source_type: str
    category: str


class AIResponse(BaseModel):
    reasoning: str
    pros: list[str]
    cons: list[str]
    verdict: str
    sources: list[dict]
    has_answer: bool


@app.get("/")
def root():
    return {"status": "Vaahan AI Mode API is running"}


@app.get("/health")
def health():
    return {"status": "ok", "service": "vaahan-ai"}


@app.post("/api/ai-mode", response_model=AIResponse)
async def ai_mode(request: QueryRequest):
    query = request.query.strip()

    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    if len(query) > 500:
        raise HTTPException(status_code=400, detail="Query too long")

    # Step 1: Retrieve relevant chunks
    chunks = retrieve(query, top_k=5)

    # Step 2: Build prompt
    prompt = build_prompt(query, chunks)

    # Step 3: Generate answer
    try:
        raw_response = generate(prompt)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")

    # Step 4: Parse JSON response
    try:
        cleaned = raw_response.replace("```json", "").replace("```", "").strip()
        result = json.loads(cleaned)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")

    return AIResponse(
        reasoning=result.get("reasoning", ""),
        pros=result.get("pros", []),
        cons=result.get("cons", []),
        verdict=result.get("verdict", ""),
        sources=result.get("sources", []),
        has_answer=result.get("has_answer", True)
    )