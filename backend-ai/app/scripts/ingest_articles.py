import sys
import os
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from app.db.mongodb import (
    articles_collection,
    travelogues_collection,
    chunks_collection
)

from app.rag.chunker import chunk_article, chunk_travelogue
from app.rag.embedder import embed_texts


def delete_chunks_for_source(source_id):
    """Remove every stored chunk and vector belonging to one source document."""
    source_id = str(source_id)
    chunks_collection.delete_many({"source_id": source_id})

    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    pinecone_index_name = os.getenv("PINECONE_INDEX_NAME")
    if not pinecone_api_key or not pinecone_index_name:
        raise ValueError("Pinecone configuration keys (PINECONE_API_KEY, PINECONE_INDEX_NAME) are missing from the environment.")

    from pinecone import Pinecone
    pc = Pinecone(api_key=pinecone_api_key)
    index = pc.Index(pinecone_index_name)
    index.delete(filter={"source_id": source_id})


def ingest():

    articles = articles_collection.find({
        "$or": [
            {"last_embedded_at": {"$exists": False}},
            {"$expr": {"$gt": ["$updatedAt", "$last_embedded_at"]}}
        ]
    })
    articles = list(articles)

    travelogues = travelogues_collection.find({
        "$or": [
            {"last_embedded_at": {"$exists": False}},
            {"$expr": {"$gt": ["$updatedAt", "$last_embedded_at"]}}
        ]
    })
    travelogues = list(travelogues)

    print(
        f"Found {len(articles)} articles and {len(travelogues)} travelogues to ingest/process."
    )

    # Separate published (to ingest) and drafts (to skip chunking)
    published_articles = []
    published_travelogues = []
    for a in articles:
        if a.get("status", "published") == "published":
            published_articles.append(a)
    for t in travelogues:
        if t.get("status", "published") == "published":
            published_travelogues.append(t)

    # Clear old chunks only for published documents that were modified
    item_ids = [str(a["_id"]) for a in published_articles] + [str(t["_id"]) for t in published_travelogues]
    if item_ids:
        print(f"Clearing old chunks for {len(item_ids)} modified published items...")
        chunks_collection.delete_many({"source_id": {"$in": item_ids}})
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        pinecone_index_name = os.getenv("PINECONE_INDEX_NAME")
        if not pinecone_api_key or not pinecone_index_name:
            raise ValueError("Pinecone configuration keys (PINECONE_API_KEY, PINECONE_INDEX_NAME) are missing from the environment.")
            
        from pinecone import Pinecone
        pc = Pinecone(api_key=pinecone_api_key)
        index = pc.Index(pinecone_index_name)
        for item_id in item_ids:
            try:
                index.delete(filter={"source_id": item_id})
            except Exception as e:
                print(f"[WARNING] Pinecone delete for source {item_id} failed: {e}")
        print("Cleared old chunks from Pinecone.")

    all_chunks = []

    for article in published_articles:
        all_chunks.extend(chunk_article(article))
    for travelogue in published_travelogues:
        all_chunks.extend(chunk_travelogue(travelogue))

    print(
        f"Created {len(all_chunks)} chunks total from published articles/travelogues."
    )

    if all_chunks:
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
    else:
        print("No new published chunks to insert.")

    # Always update last_embedded_at for all processed documents (both published and drafts)
    # so they are not processed again on the next run.
    for article in articles:
        articles_collection.update_one(
            {"_id": article["_id"]},
            {"$set": {"last_embedded_at": datetime.utcnow()}}
        )
    for travelogue in travelogues:
        travelogues_collection.update_one(
            {"_id": travelogue["_id"]},
            {"$set": {"last_embedded_at": datetime.utcnow()}}
        )
    if articles or travelogues:
        print("Updated last_embedded_at timestamp for all processed articles and travelogues")


if __name__ == "__main__":
    ingest()
