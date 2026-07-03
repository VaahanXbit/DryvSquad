import sys
import os
import argparse
from datetime import datetime
import re
import json

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from app.db.mongodb import articles_collection
from app.scripts.ingest_articles import ingest
from app.llm.llm_service import generate

def install_and_import_pypdf():
    try:
        from pypdf import PdfReader
        return PdfReader
    except ImportError:
        print("[INFO] pypdf library is not installed. Installing pypdf...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
            from pypdf import PdfReader
            return PdfReader
        except Exception as e:
            print(f"[ERROR] Failed to install pypdf: {e}")
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
        for page in reader.pages:
            text = page.extract_text()
            if text:
                content_parts.append(text)
        return "\n\n".join(content_parts).strip()
    except Exception as e:
        print(f"[ERROR] Failed to read PDF: {e}")
        sys.exit(1)

def split_articles_with_ai(pdf_text):
    print("Extracting and splitting articles using AI. Please wait...")
    
    prompt = f"""You are a content extraction assistant. The text below is extracted from a single PDF that contains multiple distinct automotive articles.
Your job is to parse this text, identify the boundary of each article, and split them into structured JSON records.

TEXT FROM PDF:
{pdf_text}

INSTRUCTIONS:
1. Identify all individual articles present in the text.
2. For each article, extract:
   - "title": The title/headline of the article.
   - "category": Categorize it as either "Feature Reviews", "New Launches", or "Tech Insights".
   - "content": The complete body text of the article (include all relevant details, do not truncate or summarize the content).
   - "seoTitle": Extract the written SEO Title from the PDF text if present. If not present, generate a search-optimized title under 60 characters.
   - "seoDescription": Extract the written SEO Description from the PDF text if present. If not present, generate a summary under 160 characters.
   - "seoKeywords": Extract the written SEO Keywords from the PDF text as a list of strings if present. If not present, generate 3 to 5 highly relevant keywords (e.g. ["EV battery cost", "LFP battery"]).
3. Do not include introductory text, table of contents, page numbers, or footers as part of the content.
4. Output ONLY a valid JSON list. No explanation, no code blocks (like ```json).

JSON Format:
[
  {{
    "title": "Title of Article 1",
    "category": "Tech Insights",
    "content": "Full body text of Article 1...",
    "seoTitle": "SEO Optimized Title",
    "seoDescription": "Meta description...",
    "seoKeywords": ["keyword 1", "keyword 2"]
  }},
  {{
    "title": "Title of Article 2",
    "category": "Feature Reviews",
    "content": "Full body text of Article 2...",
    "seoTitle": "Another SEO Optimized Title",
    "seoDescription": "Another meta description...",
    "seoKeywords": ["keyword 3", "keyword 4"]
  }}
]"""

    try:
        raw_response = generate(prompt, max_tokens=8192)
        # Clean response string of any code block wrappers
        cleaned = raw_response.replace("```json", "").replace("```", "").strip()
        articles_list = json.loads(cleaned)
        if not isinstance(articles_list, list):
            raise ValueError("LLM did not return a list")
        return articles_list
    except Exception as e:
        print(f"[ERROR] AI splitting failed: {e}")
        print("Raw response from AI was:")
        print(raw_response if 'raw_response' in locals() else "None")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Ingest multiple articles from PDF file(s) using AI splitting.")
    # Either --pdf or --dir is required
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--pdf", help="Path to a single PDF file")
    group.add_argument("--dir", help="Path to a directory containing multiple PDF files")
    parser.add_argument("--author", default="DryvSquad PDF Splitter", help="Author name")
    
    args = parser.parse_args()
    
    pdf_files = []
    if args.dir:
        if not os.path.exists(args.dir):
            print(f"[ERROR] Directory does not exist: {args.dir}")
            sys.exit(1)
        pdf_files = [
            os.path.join(args.dir, f)
            for f in os.listdir(args.dir)
            if f.lower().endswith(".pdf")
        ]
        if not pdf_files:
            print(f"[INFO] No PDF files found in directory: {args.dir}")
            sys.exit(0)
        print(f"[INFO] Found {len(pdf_files)} PDF files in directory. Starting batch ingestion...")
    else:
        if not os.path.exists(args.pdf):
            print(f"[ERROR] PDF file does not exist: {args.pdf}")
            sys.exit(1)
        pdf_files = [args.pdf]

    total_inserted_or_updated = 0

    for idx, pdf_path in enumerate(pdf_files, 1):
        print(f"\n==================================================")
        print(f"Processing PDF ({idx}/{len(pdf_files)}): {pdf_path}")
        print(f"==================================================")
        
        pdf_text = parse_pdf(pdf_path)
        
        # Split text into separate articles using AI
        articles = split_articles_with_ai(pdf_text)
        
        print(f"\nAI successfully split the PDF into {len(articles)} distinct articles:")
        for a_idx, art in enumerate(articles, 1):
            print(f"  {a_idx}. [{art.get('category')}] {art.get('title')} (~{len(art.get('content', '').split())} words)")
            
        print("\nSaving articles to database...")
        inserted_count = 0
        for art in articles:
            title = art.get("title", "Untitled Article").strip()
            category = art.get("category", "Tech Insights")
            content = art.get("content", "").strip()
            
            if not title or not content:
                continue
                
            excerpt = content[:300].strip().replace("\n", " ") + "..."
            slug = generate_slug(title)
            
            # Extract SEO fields from AI response or fallback
            seo_title = art.get("seoTitle", title).strip()
            seo_description = art.get("seoDescription", excerpt.replace("...", "").strip()).strip()
            seo_keywords = art.get("seoKeywords")
            if not seo_keywords or not isinstance(seo_keywords, list):
                seo_keywords = [category, "Multi-PDF Import"]
            
            # Avoid duplicates by matching existing slug and updating instead of inserting
            existing = articles_collection.find_one({"slug": slug})
            if existing:
                print(f"[INFO] Article '{title}' already exists. Updating existing document...")
                try:
                    articles_collection.update_one(
                        {"_id": existing["_id"]},
                        {
                            "$set": {
                                "title": title,
                                "category": category,
                                "content": content,
                                "excerpt": excerpt,
                                "readTime": f"{max(1, len(content.split()) // 200)} mins",
                                "seoTitle": seo_title,
                                "seoDescription": seo_description,
                                "seoKeywords": seo_keywords,
                                "updatedAt": datetime.utcnow()
                            }
                        }
                    )
                    inserted_count += 1
                except Exception as e:
                    print(f"[WARNING] Failed to update article '{title}': {e}")
            else:
                article_doc = {
                    "title": title,
                    "slug": slug,
                    "category": category,
                    "excerpt": excerpt,
                    "content": content,
                    "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
                    "author": args.author,
                    "date": datetime.today().strftime("%b %d, %Y"),
                    "readTime": f"{max(1, len(content.split()) // 200)} mins",
                    "tags": ["Multi-PDF Import"],
                    "status": "published",
                    "seoTitle": seo_title,
                    "seoDescription": seo_description,
                    "seoKeywords": seo_keywords,
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
                try:
                    articles_collection.insert_one(article_doc)
                    inserted_count += 1
                except Exception as e:
                    print(f"[WARNING] Failed to insert article '{title}': {e}")
                    
        print(f"[SUCCESS] Successfully processed PDF. Inserted/Updated {inserted_count} articles.")
        total_inserted_or_updated += inserted_count
        
    if total_inserted_or_updated > 0:
        print("\nTriggering chunking and embedding generation for all new/updated articles...")
        try:
            ingest()
            print("[SUCCESS] RAG pipeline ingestion complete. All split articles are now searchable!")
        except Exception as e:
            print(f"[WARNING] Database updates succeeded, but RAG ingestion failed: {e}")
    else:
        print("\n[INFO] No articles were inserted or updated. RAG pipeline remains unchanged.")

if __name__ == "__main__":
    main()
