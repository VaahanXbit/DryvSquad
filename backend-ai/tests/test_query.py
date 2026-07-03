import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv()

from app.db.mongodb import articles_collection

def main():
    print("--- Database Diagnostics ---")
    print("Target DB URI:", os.getenv("MONGODB_URI"))
    print("Target DB Name:", os.getenv("MONGODB_DB_NAME"))
    print("Connected DB Name:", articles_collection.database.name)
    print("Collection Name:", articles_collection.name)
    print("Total articles in collection:", articles_collection.count_documents({}))
    print("Articles missing 'last_embedded_at':", articles_collection.count_documents({"last_embedded_at": {"$exists": False}}))
    
    # Show one document structure
    doc = articles_collection.find_one({})
    if doc:
        print("\nDocument keys:")
        for k in doc.keys():
            print(f"  - {k}")
            
if __name__ == "__main__":
    main()
