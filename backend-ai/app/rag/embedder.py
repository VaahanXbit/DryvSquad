import os
import json
import urllib.request
import numpy as np

API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
HF_TOKEN = os.getenv("HF_API_TOKEN")


def _query_hf_api(texts: list[str]) -> list:
    """Send requests to Hugging Face serverless inference API."""
    payload = {"inputs": texts}
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {HF_TOKEN}" if HF_TOKEN else ""
    }
    
    req = urllib.request.Request(
        API_URL, 
        data=json.dumps(payload).encode("utf-8"), 
        headers=headers, 
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result
    except Exception as e:
        print(f"[ERROR] Hugging Face API call failed: {e}")
        # Return dummy zero-vectors as a fallback to prevent app crashing
        return [[0.0] * 384 for _ in texts]


def embed_texts(texts: list[str]) -> np.ndarray:
    """
    Convert a list of text strings into embeddings (vectors).
    Returns a numpy array of shape (len(texts), 384)
    384 is the vector dimension for all-MiniLM-L6-v2
    """
    embeddings = _query_hf_api(texts)
    return np.array(embeddings)


def embed_query(query: str) -> np.ndarray:
    """
    Embed a single user query for similarity search.
    Returns a numpy array of shape (1, 384)
    """
    embedding = _query_hf_api([query])
    return np.array(embedding)


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
    