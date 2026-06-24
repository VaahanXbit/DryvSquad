import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from app.db.mongodb import db, chunks_collection

def create_vector_index():
    print("Checking if 'vector_index' already exists...")
    try:
        existing_indexes = list(chunks_collection.list_search_indexes())
        for idx in existing_indexes:
            if idx.get("name") == "vector_index":
                print("Index 'vector_index' already exists!")
                return
    except Exception as e:
        print(f"Could not list search indexes: {e}")

    print("Creating Atlas Vector Search index 'vector_index' on collection 'ai_chunks'...")
    try:
        # Use the raw database command which is highly compatible
        result = db.command(
            "createSearchIndexes",
            "ai_chunks",
            indexes=[
                {
                    "name": "vector_index",
                    "type": "vectorSearch",
                    "definition": {
                        "fields": [
                            {
                                "type": "vector",
                                "path": "embedding",
                                "numDimensions": 384,
                                "similarity": "cosine"
                            }
                        ]
                    }
                }
            ]
        )
        print(f"Successfully created search index: {result}")
        print("MongoDB Atlas will now build the index in the background.")
        print("This usually takes a few minutes.")
    except Exception as e:
        print(f"Failed using db.command: {e}")
        print("Trying PyMongo SearchIndexModel method...")
        try:
            from pymongo.operations import SearchIndexModel
            index_model = SearchIndexModel(
                name="vector_index",
                definition={
                    "fields": [
                        {
                            "type": "vector",
                            "path": "embedding",
                            "numDimensions": 384,
                            "similarity": "cosine"
                        }
                    ]
                },
                type="vectorSearch"
            )
            result = chunks_collection.create_search_index(model=index_model)
            print(f"Successfully requested search index creation: {result}")
        except Exception as e2:
            print(f"Failed using SearchIndexModel method: {e2}")

if __name__ == "__main__":
    create_vector_index()
