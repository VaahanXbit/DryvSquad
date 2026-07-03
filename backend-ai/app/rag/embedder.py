from sentence_transformers import SentenceTransformer
import numpy as np

# Load model once at module level, so it doesn't reload on every call
# model used :- all-MiniLM-L6-v2 

MODEL_NAME = "all-MiniLM-L6-v2"
model = SentenceTransformer(MODEL_NAME)


def embed_texts(texts: list[str]) -> np.ndarray:
    """
    Convert a list of text strings into embeddings (vectors).
    Returns a numpy array of shape (len(texts), 384)
    384 is the vector dimension for all-MiniLM-L6-v2
    """
    embeddings = model.encode(
        texts,
        show_progress_bar=True,
        batch_size=32,
        convert_to_numpy=True
    )
    return embeddings


def embed_query(query: str) -> np.ndarray:
    """
    Embed a single user query for similarity search.
    Returns a numpy array of shape (1, 384)
    """
    embedding = model.encode([query], convert_to_numpy=True)
    return embedding


if __name__ == "__main__":
    # Testing
    test_texts = [
        "AWD is not worth it for city driving in India.",
        "ABS prevents wheels from locking up during emergency braking.",
        "Hyundai Creta is a popular SUV with good mileage."
    ]

    print("Embedding test texts...")
    embeddings = embed_texts(test_texts)
    print(f"✅ Shape: {embeddings.shape}")
    print(f"✅ First vector (first 5 values): {embeddings[0][:5]}")

    print("\nEmbedding test query...")
    query_embedding = embed_query("Is AWD worth buying in India?")
    print(f"✅ Query shape: {query_embedding.shape}")
    print("✅ Embedder working correctly")
    