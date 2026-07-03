import sys
import os
from pymongo import MongoClient
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv()

# Set console to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

def main():
    uri = os.getenv("MONGODB_URI")
    client = MongoClient(uri)
    db = client[os.getenv("MONGODB_DB_NAME", "test")]
    articles_col = db["articles"]
    
    print("--- Checking seoKeywords Values inside 'articles' collection ---")
    sample = list(articles_col.find({}).limit(5))
    for i, art in enumerate(sample):
        print(f"\n[{i+1}] Title: {art.get('title')}")
        print(f"    seoKeywords: {art.get('seoKeywords')}")
        
    client.close()

if __name__ == "__main__":
    main()
