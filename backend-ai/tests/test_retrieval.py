import sys
import os

sys.path.append(
    os.path.join(
        os.path.dirname(__file__),
        "../.."
    )
)

from app.rag.retriever import retrieve

query = "5000"

results = retrieve(query)

print("\nRESULTS\n")

for r in results:
    print("=" * 50)
    title_safe = r["title"].encode(sys.stdout.encoding or 'utf-8', errors='replace').decode(sys.stdout.encoding or 'utf-8')
    print(title_safe)
    print()
    text_safe = r["chunk_text"][:300].encode(sys.stdout.encoding or 'utf-8', errors='replace').decode(sys.stdout.encoding or 'utf-8')
    print(text_safe)

    print()