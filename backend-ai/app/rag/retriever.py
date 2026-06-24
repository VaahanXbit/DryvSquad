from app.db.mongodb import chunks_collection
from app.rag.embedder import embed_query

import numpy as np


def cosine_similarity(a, b):
    return np.dot(a, b) / (
        np.linalg.norm(a)
        * np.linalg.norm(b)
    )

def retrieve(query, top_k=5):
    query_vector = embed_query(query)[0].tolist() # Convert NumPy array to list
    
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",  # Must match the name created in Atlas
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": top_k * 10,
                "limit": top_k
            }
        }
    ]
    
    return list(chunks_collection.aggregate(pipeline))

# def retrieve(
#     query,
#     top_k=5
# ):

#     query_vector = embed_query(
#         query
#     )[0]

#     chunks = list(
#         chunks_collection.find({})
#     )

#     scored = []

#     for chunk in chunks:

#         embedding = np.array(
#             chunk["embedding"]
#         )

#         score = cosine_similarity(
#             query_vector,
#             embedding
#         )

#         scored.append(
#             (score, chunk)
#         )

#     scored.sort(
#         key=lambda x: x[0],
#         reverse=True
#     )

#     return [
#         chunk
#         for score, chunk
#         in scored[:top_k]
#     ]

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