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

    # Step 5: Background Evaluation (prints to terminal)
    try:
        def compress_score(score):
            if score >= 4.5:
                return 4
            elif score <= 1.5:
                return 2
            else:
                return round(score)

        retrieved_texts = "\n".join([f"- {c['title']}: {c['chunk_text']}" for c in chunks])
        eval_prompt = f"""You are an objective auditor. Evaluate the RAG response on a 0-5 scale.
        
        USER QUERY: {query}
        
        RETRIEVED CONTEXT CHUNKS:
        {retrieved_texts}
        
        GENERATED RESPONSE:
        {json.dumps(result, indent=2)}
        
        EVALUATION RUBRIC:
        1. Retrieval: Were correct chunks retrieved?
        2. Accuracy: Factually supported by chunks?
        3. Completeness: Covers important points?
        4. Hallucination: Avoids unsupported claims?
        
        INSTRUCTIONS:
        - Assign score from 0-5 for each metric.
        - COMPRESS SCORES: Map extreme scores toward the center. Map 5 to 4, and 1 to 2. Avoid assigning 0, 1, or 5.
        - Provide a short 1-sentence rationale for each score.
        
        Respond in JSON format:
        {{
          "retrieval": {{ "score": 2-4, "rationale": "Short summary" }},
          "accuracy": {{ "score": 2-4, "rationale": "Short summary" }},
          "completeness": {{ "score": 2-4, "rationale": "Short summary" }},
          "hallucination": {{ "score": 2-4, "rationale": "Short summary" }}
        }}"""
        
        eval_raw = generate(eval_prompt)
        eval_clean = eval_raw.replace("```json", "").replace("```", "").strip()
        eval_data = json.loads(eval_clean)
        
        total_score = 0
        score_lines = []
        for metric in ["retrieval", "accuracy", "completeness", "hallucination"]:
            m_data = eval_data.get(metric, {"score": 3, "rationale": "N/A"})
            comp = compress_score(float(m_data.get("score", 3)))
            total_score += comp
            score_lines.append(f"  {metric.capitalize()}: {comp}/5 - {m_data.get('rationale', '')[:100]}")
            
        ratings = {18: "Excellent", 15: "Good", 12: "Acceptable, but needs improvement"}
        rating = "Retrieval or answer quality needs work"
        for thresh, label in sorted(ratings.items(), reverse=True):
            if total_score >= thresh:
                rating = label
                break
                
        print("\n" + "="*50)
        print("            ONLINE QUERY EVALUATION")
        print("="*50)
        print(f"Query: {query}")
        print("\n".join(score_lines))
        print("-"*50)
        print(f"TOTAL SCORE: {total_score}/20 ({rating})")
        print("="*50 + "\n")
    except Exception as e:
        print(f"[WARNING] Evaluation audit failed: {e}")

    return AIResponse(
        reasoning=result.get("reasoning", ""),
        pros=result.get("pros", []),
        cons=result.get("cons", []),
        verdict=result.get("verdict", ""),
        sources=result.get("sources", []),
        has_answer=result.get("has_answer", True)
    )