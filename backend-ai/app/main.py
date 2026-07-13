import sys
import os
import json

# Add 'app' and its parent 'backend-ai' to python path before any local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Optional, List
from rag.retriever import retrieve, cosine_similarity
from rag.embedder import embed_query

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llm.prompt_builder import build_prompt, build_rewrite_prompt, check_small_talk, build_small_talk_prompt
from llm.llm_service import generate
from llm.car_finder import find_matching_cars
from db.mongodb import cache_collection, articles_collection
from datetime import datetime

app = FastAPI(
    title="DryvSquad AI Mode API",
    description="RAG-powered automotive knowledge assistant",
    version="1.0.0"
)

# CORS -> allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://vaahan-international-obbc.vercel.app",
        "https://dryvsquad.com",
        "https://www.dryvsquad.com"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    sender: str
    text: Optional[str] = ""
    result: Optional[dict] = None


class QueryRequest(BaseModel):
    query: str
    history: List[ChatMessage] = []


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
    is_small_talk: Optional[bool] = False
    suggest_loan: Optional[bool] = False
    suggest_insurance: Optional[bool] = False


class CarFinderRequest(BaseModel):
    budget: str
    seating: str
    usage: List[str] = []
    terrain: str
    driver: str
    city: str
    state: str = "DL"
    lifeProfile: str = "solo_commuter"
    tenure: str = ""
    fuelPref: str = ""
    resaleImportance: str = ""
    monthlyOpexBand: str = ""
    nonNegotiables: List[str] = []
    custom_query: Optional[str] = ""


@app.get("/")
def root():
    return {"status": "DryvSquad AI Mode API is running"}


@app.get("/health")
def health():
    return {"status": "ok", "service": "dryvsquad-ai"}



@app.post("/api/ai-car-finder")
async def ai_car_finder(request: CarFinderRequest):
    budget = request.budget.strip()
    seating = request.seating.strip()
    usage = request.usage
    terrain = request.terrain.strip()
    driver = request.driver.strip()
    city = request.city.strip()
    state = request.state.strip() if request.state else "DL"
    life_profile = request.lifeProfile.strip() if request.lifeProfile else "solo_commuter"
    tenure = request.tenure.strip() if request.tenure else ""
    fuel_pref = request.fuelPref.strip() if request.fuelPref else ""
    resale_importance = request.resaleImportance.strip() if request.resaleImportance else ""
    monthly_opex_band = request.monthlyOpexBand.strip() if request.monthlyOpexBand else ""
    non_negotiables = request.nonNegotiables
    custom_query = request.custom_query.strip() if request.custom_query else ""
    
    if not budget or not seating or not terrain or not driver or not city:
        raise HTTPException(status_code=400, detail="Missing required search parameters.")
        
    result = find_matching_cars(
        budget=budget,
        seating=seating,
        usage=usage,
        terrain=terrain,
        driver=driver,
        city=city,
        state=state,
        life_profile=life_profile,
        tenure=tenure,
        fuel_pref=fuel_pref,
        resale_importance=resale_importance,
        monthly_opex_band=monthly_opex_band,
        non_negotiables=non_negotiables,
        custom_query=custom_query
    )
    return result


@app.post("/api/ai-mode", response_model=AIResponse)
async def ai_mode(request: QueryRequest):
    query = request.query.strip()

    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    if len(query) > 500:
        raise HTTPException(status_code=400, detail="Query too long")

    search_query = query

    # Step 1: Slice history to keep last 2 messages (1 turn) to prevent prompt bloat and context bleed
    sliced_history = request.history[-2:]
    history_list = [
        {
            "sender": h.sender,
            "text": h.text or "",
            "result": h.result
        }
        for h in sliced_history
    ]

    # Check for general small talk / greetings (bypasses RAG retrieval)
    if check_small_talk(query):
        print(f"[INFO] Detected small talk query: '{query}'. Bypassing retrieval.")
        prompt = build_small_talk_prompt(query, history=history_list)
        try:
            raw_response = generate(prompt)
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")
    else:
        # Step 2: Query rewriting for conversational follow-ups
        search_query = query
        if history_list:
            try:
                rewrite_prompt = build_rewrite_prompt(query, history_list)
                raw_rewrite = generate(rewrite_prompt, max_tokens=80)
                cleaned_rewrite = raw_rewrite.strip().strip('"').strip("'").strip()
                if cleaned_rewrite and len(cleaned_rewrite) < 150:
                    search_query = cleaned_rewrite
                    print(f"[INFO] Conversational query '{query}' rewritten to: '{search_query}'")
            except Exception as e:
                print(f"[WARNING] Query rewriting failed: {e}. Falling back to original query.")

        # Check MongoDB Cache for the resolved standalone query
        normalized_query = search_query.lower().strip("?!. \t,")
        try:
            # Try Exact Match first (fastest)
            cached_entry = cache_collection.find_one({"query": normalized_query})
            
            # If not exact match, try Semantic Match
            if not cached_entry:
                query_vector = embed_query(search_query)[0].tolist()
                candidates = list(cache_collection.find({}, {"query": 1, "embedding": 1, "response": 1}))
                
                best_match = None
                highest_sim = 0.0
                for cand in candidates:
                    cand_vector = cand.get("embedding")
                    if cand_vector:
                        sim = cosine_similarity(query_vector, cand_vector)
                        if sim > highest_sim:
                            highest_sim = sim
                            best_match = cand
                
                # If similarity is 0.85 or higher, treat it as a semantic cache hit
                if highest_sim >= 0.85 and best_match:
                    print(f"[SUCCESS] Semantic cache hit (similarity: {highest_sim:.4f}) for: '{search_query}' matching cached query '{best_match['query']}'.")
                    cached_entry = best_match

            if cached_entry:
                print(f"[SUCCESS] Cache hit resolved for query: '{search_query}'. Serving response from DB cache.")
                try:
                    cache_collection.update_one(
                        {"_id": cached_entry["_id"]},
                        {
                            "$inc": {"hits": 1},
                            "$set": {"last_accessed_at": datetime.utcnow()}
                        }
                    )
                except Exception as e:
                    print(f"[WARNING] Failed to update cache hit stats: {e}")
                
                cached_res = cached_entry["response"]
                return AIResponse(
                    reasoning=cached_res.get("reasoning", ""),
                    pros=cached_res.get("pros", []),
                    cons=cached_res.get("cons", []),
                    verdict=cached_res.get("verdict", ""),
                    sources=cached_res.get("sources", []),
                    has_answer=cached_res.get("has_answer", True),
                    is_small_talk=cached_res.get("is_small_talk", False)
                )
        except Exception as e:
            print(f"[WARNING] Cache lookup failed: {e}")

        # Step 3: Retrieve relevant chunks using the (possibly rewritten) search query
        chunks = retrieve(search_query, top_k=4)

        # Step 4: Build prompt with original query and conversation history
        prompt = build_prompt(query, chunks, history=history_list)

        # Step 5: Generate answer
        try:
            raw_response = generate(prompt)
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")

    # Step 4: Parse JSON response
    try:
        cleaned = raw_response.replace("```json", "").replace("```", "").strip()
        result = json.loads(cleaned)
        # Ensure is_small_talk is set if we detected small talk
        if "is_small_talk" not in result:
            result["is_small_talk"] = check_small_talk(query)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")

    # If it was a RAG query (not small talk), save the successfully parsed response to cache
    if not result.get("is_small_talk"):
        try:
            norm_q = search_query.lower().strip("?!. \t,")
            query_vector = embed_query(search_query)[0].tolist()
            cache_collection.insert_one({
                "query": norm_q,
                "embedding": query_vector,
                "response": result,
                "hits": 1,
                "createdAt": datetime.utcnow(),
                "last_accessed_at": datetime.utcnow()
            })
            print(f"[SUCCESS] Successfully cached query response for: '{search_query}'")
        except Exception as e:
            print(f"[WARNING] Failed to save query response to cache: {e}")



    return AIResponse(
        reasoning=result.get("reasoning", ""),
        pros=result.get("pros", []),
        cons=result.get("cons", []),
        verdict=result.get("verdict", ""),
        sources=result.get("sources", []),
        has_answer=result.get("has_answer", True),
        is_small_talk=result.get("is_small_talk", False),
        suggest_loan=result.get("suggest_loan", False),
        suggest_insurance=result.get("suggest_insurance", False)
    )


def watch_mongodb_changes():
    import time
    from app.scripts.ingest_articles import ingest
    
    print("[CHANGESTREAM] Starting background MongoDB change stream listener...")
    while True:
        try:
            # Watch for insertions, updates, and replacements on the articles collection
            with articles_collection.watch() as stream:
                for change in stream:
                    op_type = change.get("operationType")
                    if op_type in ["insert", "update", "replace"]:
                        print(f"[CHANGESTREAM] Detected article '{op_type}' event. Triggering auto-ingestion...")
                        try:
                            ingest()
                            print("[CHANGESTREAM] Auto-ingestion complete.")
                        except Exception as e:
                            print(f"[CHANGESTREAM ERROR] Failed during auto-ingestion: {e}")
        except Exception as e:
            # Sleep 10s and retry (graceful fallback if MongoDB is not running as a replica set)
            print(f"[CHANGESTREAM WARNING] Connection lost or not a replica set: {e}. Retrying in 10 seconds...")
            time.sleep(10)


@app.on_event("startup")
def startup_event():
    import threading
    thread = threading.Thread(target=watch_mongodb_changes, daemon=True)
    thread.start()