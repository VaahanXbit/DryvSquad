import sys
import os
import argparse
from datetime import datetime
import re

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from app.db.mongodb import articles_collection
from app.scripts.ingest_articles import ingest

def install_and_import_pypdf():
    try:
        from pypdf import PdfReader
        return PdfReader
    except ImportError:
        print("[INFO] pypdf library is not installed. Attempting to install pypdf...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
            from pypdf import PdfReader
            print("[SUCCESS] pypdf installed successfully.")
            return PdfReader
        except Exception as e:
            print(f"[ERROR] Failed to install pypdf: {e}")
            print("Please run: pip install pypdf")
            sys.exit(1)

def generate_slug(title):
    slug = title.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    return slug

def parse_pdf(pdf_path):
    PdfReader = install_and_import_pypdf()
    print(f"Reading PDF from: {pdf_path}")
    
    try:
        reader = PdfReader(pdf_path)
        content_parts = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                content_parts.append(text)
        
        full_content = "\n\n".join(content_parts).strip()
        if not full_content:
            raise ValueError("No text extracted from PDF. The PDF might contain only images/scans.")
            
        print(f"Extracted {len(reader.pages)} pages ({len(full_content)} characters).")
        return full_content
    except Exception as e:
        print(f"[ERROR] Failed to read PDF: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Ingest articles from a PDF file into DryvSquad RAG Database.")
    parser.add_argument("--pdf", required=True, help="Path to the PDF file")
    parser.add_argument("--title", required=True, help="Title of the article")
    parser.add_argument("--category", default="Tech Insights", 
                        choices=["Feature Reviews", "New Launches", "Tech Insights"],
                        help="Article category")
    parser.add_argument("--author", default="DryvSquad PDF Ingest", help="Author name")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.pdf):
        print(f"[ERROR] PDF file does not exist: {args.pdf}")
        sys.exit(1)
        
    # Extract text from PDF
    pdf_content = parse_pdf(args.pdf)
    
    # Generate excerpt (first 300 characters ending with ellipsis)
    excerpt = pdf_content[:300].strip().replace("\n", " ") + "..."
    
    # Avoid duplicates by matching existing slug and updating instead of inserting
    slug = generate_slug(args.title)
    existing_article = articles_collection.find_one({"slug": slug})
    
    if existing_article:
        print(f"[INFO] Article with slug '{slug}' already exists. Updating existing document...")
        try:
            articles_collection.update_one(
                {"_id": existing_article["_id"]},
                {
                    "$set": {
                        "title": args.title,
                        "category": args.category,
                        "content": pdf_content,
                        "excerpt": excerpt,
                        "readTime": f"{max(1, len(pdf_content.split()) // 200)} mins",
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            print("[SUCCESS] Article successfully updated in the database.")
        except Exception as e:
            print(f"[ERROR] Failed to update article in database: {e}")
            sys.exit(1)
    else:
        # Construct Article Document compatible with MongoDB NodeJS model
        article_doc = {
            "title": args.title,
            "slug": slug,
            "category": args.category,
            "excerpt": excerpt,
            "content": pdf_content,
            "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800", # default car thumbnail placeholder
            "author": args.author,
            "date": datetime.today().strftime("%b %d, %Y"),
            "readTime": f"{max(1, len(pdf_content.split()) // 200)} mins",
            "tags": ["PDF Import"],
            "status": "published",
            "seoTitle": args.title,
            "seoDescription": excerpt.replace("...", "").strip(),
            "seoKeywords": ["PDF Import", args.category],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        print("\nInserting article into database...")
        try:
            res = articles_collection.insert_one(article_doc)
            print(f"[SUCCESS] Article successfully inserted with ID: {res.inserted_id}")
        except Exception as e:
            print(f"[ERROR] Failed to insert article into database: {e}")
            sys.exit(1)
        
    print("\nTriggering chunking and embedding generation...")
    try:
        ingest()
        print("✅ RAG pipeline ingestion complete. PDF content is now searchable!")
    except Exception as e:
        print(f"[WARNING] Article was inserted, but RAG ingestion failed: {e}")

if __name__ == "__main__":
    main()
