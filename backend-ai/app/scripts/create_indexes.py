from app.db.mongodb import chunks_collection

chunks_collection.create_index(
    "chunk_id",
    unique=True
)

chunks_collection.create_index(
    [
        ("source_type", 1),
        ("source_id", 1)
    ]
)

chunks_collection.create_index(
    "is_active"
)

chunks_collection.create_index(
    "category"
)

chunks_collection.create_index(
    "tags"
)

print("Indexes created")