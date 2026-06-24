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

    # Actually delete existing chunks for these articles to prevent duplicates/errors
    article_ids = [str(a["_id"]) for a in articles]
    if article_ids:
        print(f"Clearing old chunks for {len(article_ids)} articles...")
        chunks_collection.delete_many({"source_id": {"$in": article_ids}})

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

        # Update last_embedded_at on the processed articles
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