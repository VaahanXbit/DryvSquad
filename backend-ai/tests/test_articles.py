from app.db.mongodb import articles_collection

articles = list(articles_collection.find())

print("Articles:", len(articles))

for article in articles[:2]:
    print(article["title"])