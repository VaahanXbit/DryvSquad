import sys
import os
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from app.db.mongodb import (
    articles_collection,
    chunks_collection
)

from app.rag.chunker import chunk_article
from app.rag.embedder import embed_texts


def ingest():

    articles = articles_collection.find({
        "$or": [
            {
                "last_embedded_at": {
                    "$exists": False
                }
            },
            {
                "$expr": {
                    "$gt": [
                        "$updatedAt",
                        "$last_embedded_at"
                    ]
                }
            }
        ]
    })

    articles = list(articles)

    print(
        f"Found {len(articles)} articles"
    )

    article_ids = [str(a["_id"]) for a in articles]
    if article_ids:
        print(f"Clearing old chunks for {len(article_ids)} articles...")
        chunks_collection.delete_many({"source_id": {"$in": article_ids}})
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        pinecone_index_name = os.getenv("PINECONE_INDEX_NAME")
        if not pinecone_api_key or not pinecone_index_name:
            raise ValueError("Pinecone configuration keys (PINECONE_API_KEY, PINECONE_INDEX_NAME) are missing from the environment.")
            
        from pinecone import Pinecone
        pc = Pinecone(api_key=pinecone_api_key)
        index = pc.Index(pinecone_index_name)
        for art_id in article_ids:
            try:
                index.delete(filter={"source_id": art_id})
            except Exception as e:
                print(f"[WARNING] Pinecone delete for article {art_id} failed: {e}")
        print("Cleared old chunks from Pinecone.")

    all_chunks = []

    for article in articles:
        chunks = chunk_article(article)
        all_chunks.extend(chunks)

    print(
        f"Created {len(all_chunks)} chunks"
    )

    texts = [
        chunk["chunk_text"]
        for chunk in all_chunks
    ]

    print("Generating embeddings...")

    embeddings = embed_texts(texts)

    for i, chunk in enumerate(all_chunks):

        chunk["embedding"] = embeddings[i].tolist()
    
        chunk["embedding_model"] = "all-MiniLM-L6-v2"
    
        chunk["embedding_version"] = "1.0"
    
        chunk["token_count"] = len(
            chunk["chunk_text"].split()
        )
    
        chunk["is_active"] = True
    
        chunk["created_at"] = datetime.utcnow()
    
        chunk["updated_at"] = datetime.utcnow()

    if all_chunks:
        chunks_collection.insert_many(
            all_chunks
        )

        print(
            f"Inserted {len(all_chunks)} chunks into MongoDB"
        )

        # Upsert vectors to Pinecone (strictly enforced)
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        pinecone_index_name = os.getenv("PINECONE_INDEX_NAME")
        if not pinecone_api_key or not pinecone_index_name:
            raise ValueError("Pinecone configuration keys (PINECONE_API_KEY, PINECONE_INDEX_NAME) are missing from the environment.")
            
        from pinecone import Pinecone
        print("Connecting to Pinecone for vector upsert...")
        pc = Pinecone(api_key=pinecone_api_key)
        index = pc.Index(pinecone_index_name)
        
        vectors_to_upsert = []
        for chunk in all_chunks:
            vectors_to_upsert.append((
                str(chunk["_id"]),
                chunk["embedding"],
                {"source_id": str(chunk.get("source_id", ""))}
            ))
        
        print(f"Upserting {len(vectors_to_upsert)} vectors to Pinecone index '{pinecone_index_name}'...")
        batch_size = 100
        for start_idx in range(0, len(vectors_to_upsert), batch_size):
            batch = vectors_to_upsert[start_idx:start_idx + batch_size]
            index.upsert(vectors=batch)
        print("[SUCCESS] Successfully upserted vectors to Pinecone.")

        for article in articles:
            articles_collection.update_one(
                {"_id": article["_id"]},
                {"$set": {"last_embedded_at": datetime.utcnow()}}
            )
        print("Updated last_embedded_at timestamp for all processed articles")
    else:
        print("No new chunks to insert.")


if __name__ == "__main__":
    ingest()