import os
import dns.resolver
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
# Override dns.resolver default nameservers to resolve MongoDB Atlas SRV records
try:
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1']
except Exception as e:
    print(f"[WARNING] Failed to set custom DNS nameservers: {e}")

client = MongoClient(os.getenv("MONGODB_URI"))

db = client[os.getenv("MONGODB_DB_NAME")]

articles_collection = db["articles"]
travelogues_collection = db["travelogues"]
chunks_collection = db["ai_chunks"]
cache_collection = db["ai_cache"]

# Initialize indexes for the cache collection
try:
    # Unique index on normalized query to prevent duplicate records
    cache_collection.create_index("query", unique=True)
    # TTL index on createdAt field, automatically deleting documents after 24 hours (86400 seconds)
    cache_collection.create_index("createdAt", expireAfterSeconds=86400)
except Exception as e:
    print(f"[WARNING] Failed to initialize MongoDB cache indexes: {e}")
