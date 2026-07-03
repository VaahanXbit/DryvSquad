import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from app.rag.retriever import retrieve
from app.llm.prompt_builder import build_prompt
from app.llm.llm_service import generate

def compress_score(score):
    # Compresses score to center of 0-5 scale (avoiding extremes 0/1 and 5)
    if score >= 4.5:
        return 4
    elif score <= 1.5:
        return 2
    else:
        return round(score)

def run_evaluation(query):
    print(f"\n[EVAL] Running query: '{query}'")
    
    # 1. Retrieve Context
    chunks = retrieve(query, top_k=5)
    retrieved_texts = "\n".join([f"- {c['title']}: {c['chunk_text']}" for c in chunks])
    
    # 2. Generate Answer
    prompt = build_prompt(query, chunks)
    raw_response = generate(prompt)
    
    # Clean response
    cleaned = raw_response.replace("```json", "").replace("```", "").strip()
    try:
        response_json = json.loads(cleaned)
    except Exception:
        response_json = {"verdict": cleaned, "reasoning": "Could not parse JSON"}

    # 3. Formulate Evaluation Prompt
    eval_prompt = f"""You are an objective auditor. Evaluate the RAG response on a 0-5 scale.
    
    USER QUERY: {query}
    
    RETRIEVED CONTEXT CHUNKS:
    {retrieved_texts}
    
    GENERATED RESPONSE:
    {json.dumps(response_json, indent=2)}
    
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

    # 4. Generate Evaluation
    eval_raw = generate(eval_prompt)
    try:
        eval_clean = eval_raw.replace("```json", "").replace("```", "").strip()
        eval_data = json.loads(eval_clean)
    except Exception:
        # Fallback if evaluation parsing fails
        eval_data = {
            "retrieval": {"score": 3, "rationale": "Failed to parse evaluation."},
            "accuracy": {"score": 3, "rationale": "Failed to parse evaluation."},
            "completeness": {"score": 3, "rationale": "Failed to parse evaluation."},
            "hallucination": {"score": 3, "rationale": "Failed to parse evaluation."}
        }
        
    # Standardize & compress scores programmatically
    total_score = 0
    scores = {}
    for metric in ["retrieval", "accuracy", "completeness", "hallucination"]:
        metric_data = eval_data.get(metric, {"score": 3, "rationale": "No rationale."})
        raw_score = float(metric_data.get("score", 3))
        compressed = compress_score(raw_score)
        scores[metric] = {
            "score": compressed,
            "rationale": metric_data.get("rationale", "No rationale provided.")[:100] # keep brief
        }
        total_score += compressed
        
    # Interpret total score
    if total_score >= 18:
        interpretation = "Excellent"
    elif total_score >= 15:
        interpretation = "Good"
    elif total_score >= 12:
        interpretation = "Acceptable, but needs improvement"
    else:
        interpretation = "Retrieval or answer quality needs work"
        
    # Output results
    print("\n" + "="*40)
    print("           EVALUATION REPORT")
    print("="*40)
    print(f"Query: {query}")
    print(f"Generated Verdict: {response_json.get('verdict', '')}\n")
    
    for metric, data in scores.items():
        print(f"{metric.capitalize()}: {data['score']}/5")
        print(f"  Rationale: {data['rationale']}")
    
    print("-"*40)
    print(f"TOTAL SCORE: {total_score}/20")
    print(f"Rating: {interpretation}")
    print("="*40 + "\n")

if __name__ == "__main__":
    test_query = "Is AWD worth buying in India?"
    if len(sys.argv) > 1:
        test_query = " ".join(sys.argv[1:])
    run_evaluation(test_query)
