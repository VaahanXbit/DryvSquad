import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv()

# Set console to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

from app.rag.retriever import retrieve

def main():
    print("--- Testing Live retrieval on 46 articles ---")
    query = "How does ABS prevent wheels from locking up?"
    print(f"Query: '{query}'")
    
    results = retrieve(query, top_k=3)
    print(f"\nRetrieved {len(results)} chunks:")
    for i, doc in enumerate(results):
        print(f"\n[{i+1}] Article: {doc.get('title')}")
        print(f"    Excerpt: {doc.get('chunk_text')[:150]}...")
        print(f"    Category: {doc.get('category')}")
        print(f"    Keywords in DB: {doc.get('seoKeywords')}")

if __name__ == "__main__":
    main()
