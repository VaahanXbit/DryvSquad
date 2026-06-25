import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from app.rag.retriever import retrieve
from app.llm.prompt_builder import build_prompt
from app.llm.llm_service import generate

def safe_print(text):
    if not text:
        return
    sys_encoding = sys.stdout.encoding or 'utf-8'
    print(text.encode(sys_encoding, errors='replace').decode(sys_encoding))

def main():
    query = "Is AWD worth buying in India?"
    safe_print(f"User Query: '{query}'")
    
    safe_print("\nRetrieving chunks...")
    chunks = retrieve(query, top_k=5)
    safe_print(f"Retrieved {len(chunks)} chunks.")
    
    safe_print("\nBuilding prompt...")
    prompt = build_prompt(query, chunks)
    
    safe_print("\nSynthesizing answer...")
    try:
        raw_response = generate(prompt)
        safe_print("\nRaw Response:")
        safe_print(raw_response)
        
        # Clean response tags 
        cleaned = raw_response.replace("```json", "").replace("```", "").strip()
        result = json.loads(cleaned)
        
        safe_print("\nParsed Result:")
        safe_print("="*50)
        safe_print(f"Reasoning: {result.get('reasoning')}")
        safe_print("\nPros:")
        for pro in result.get("pros", []):
            safe_print(f" - {pro}")
        safe_print("\nCons:")
        for con in result.get("cons", []):
            safe_print(f" - {con}")
        safe_print(f"\nVerdict: {result.get('verdict')}")
        safe_print("="*50)
        
    except Exception as e:
        safe_print(f"\nError generating answer: {e}")

if __name__ == "__main__":
    main()
