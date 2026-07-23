from app.db.mongodb import chunks_collection
from app.rag.embedder import embed_query

import numpy as np
import os

# build text index for keyword search
try:
    chunks_collection.create_index([("title", "text"), ("chunk_text", "text")], name="text_search_index")
except Exception as e:
    print(f"[WARNING] Could not create text index: {e}")

# Lazy-load CrossEncoder re-ranker model on first use (disabled by default on 512MB RAM free tier)
_reranker_model = None
_reranker_loaded = False


def _get_reranker():
    """Return the CrossEncoder re-ranker if enabled via environment variable."""
    global _reranker_model, _reranker_loaded
    if not _reranker_loaded:
        _reranker_loaded = True
        # Default to True on RAM-constrained hosting environments like Render Free Tier
        if os.getenv("ENABLE_RERANKER", "false").lower() == "true":
            try:
                print("[INFO] Lazy-loading CrossEncoder re-ranker model...")
                from sentence_transformers import CrossEncoder
                _reranker_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
                print("[SUCCESS] CrossEncoder re-ranker model loaded successfully.")
            except Exception as e:
                print(f"[WARNING] Could not load CrossEncoder model: {e}. Re-ranking fallback will be used.")
    return _reranker_model


def cosine_similarity(a, b):
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def retrieve(query, top_k=5):
    # Step 1: Run Vector Search
    query_vector = embed_query(query)[0].tolist()
    vector_results = []

    candidate_limit = 8
    try:
        from pinecone import Pinecone
        from bson import ObjectId
        
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        pinecone_index_name = os.getenv("PINECONE_INDEX_NAME")
        if pinecone_api_key and pinecone_index_name:
            pc = Pinecone(api_key=pinecone_api_key)
            index = pc.Index(pinecone_index_name)
            
            res = index.query(vector=query_vector, top_k=candidate_limit * 2, include_metadata=False)
            match_ids = [m.id for m in res.matches if m.score >= 0.50]
            
            if match_ids:
                vector_results = list(chunks_collection.find({
                    "_id": {"$in": [ObjectId(mid) for mid in match_ids]},
                    "is_active": True
                }))
                doc_map = {str(doc["_id"]): doc for doc in vector_results}
                vector_results = [doc_map[mid] for mid in match_ids if mid in doc_map]
        else:
            print("[INFO] Pinecone keys not configured, skipping vector search.")
    except Exception as e:
        print(f"[WARNING] Pinecone vector search failed: {e}. Falling back to keyword search.")

    # Step 2: Run Keyword Search
    keyword_results = []
    try:
        keyword_results = list(chunks_collection.find(
            {"$text": {"$search": query}, "is_active": True},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(candidate_limit * 2))
    except Exception:
        # Regex search fallback 
        keywords = [kw for kw in query.split() if len(kw) > 2]
        if keywords:
            regex_queries = [{"chunk_text": {"$regex": kw, "$options": "i"}} for kw in keywords]
            keyword_results = list(chunks_collection.find({"$or": regex_queries, "is_active": True}).limit(candidate_limit * 2))
        else:
            keyword_results = list(chunks_collection.find({
                "$or": [
                    {"title": {"$regex": query, "$options": "i"}}, 
                    {"chunk_text": {"$regex": query, "$options": "i"}}
                ],
                "is_active": True
            }).limit(candidate_limit * 2))

    # Step 3: Reciprocal Rank Fusion (RRF) merge candidates
    merged_results = reciprocal_rank_fusion(vector_results, keyword_results, limit=candidate_limit)

    reranker = _get_reranker()
    if reranker is not None and len(merged_results) > 0:
        try:
            pairs = [[query, doc["chunk_text"]] for doc in merged_results]
            scores = reranker.predict(pairs)
            scored_docs = []
            for idx, score in enumerate(scores):
                doc = merged_results[idx]
                doc["rerank_score"] = float(score)
                scored_docs.append(doc)
            scored_docs.sort(key=lambda x: x["rerank_score"], reverse=True)
            return scored_docs[:top_k]
        except Exception as e:
            print(f"[WARNING] Re-ranking failed: {e}. Falling back to RRF ordering.")
            return merged_results[:top_k]
    else:
        return merged_results[:top_k]

def reciprocal_rank_fusion(vector_results, keyword_results, limit=5, k=60):
    rrf_scores = {}
    doc_map = {}
    
    for rank, doc in enumerate(vector_results, 1):
        doc_id = str(doc["_id"])
        doc_map[doc_id] = doc
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank))
        
    for rank, doc in enumerate(keyword_results, 1):
        doc_id = str(doc["_id"])
        doc_map[doc_id] = doc
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank))
        
    sorted_docs = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    return [doc_map[doc_id] for doc_id, _ in sorted_docs[:limit]]


if __name__ == "__main__":
    while True:
        query = input("\nEnter query: ")

        if query.lower() == "exit":
            break

        results = retrieve(query)

        print("\nRetrieved Chunks:\n")

        for i, chunk in enumerate(results, 1):
            print(f"{i}. {chunk['title']}")
            print(f"   Source: {chunk['source_type']}")
            print(f"   Chunk: {chunk['chunk_text'][:300]}")
            print()