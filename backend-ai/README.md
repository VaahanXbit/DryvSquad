---
title: DryvSquad AI Backend
emoji: 🚗
colorFrom: yellow
colorTo: blue
sdk: docker
app_port: 7860
---

# AI Backend

## Setup & Configuration

### 1. Create a Virtual Environment
```bash
cd backend-ai
python -m venv venv
venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables (`.env`)
Create a `.env` file in the `backend-ai/` root folder:
```ini
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<app>
MONGODB_DB_NAME=test
```

---

## Running the Data Pipeline

### 1. Create MongoDB Search Index
Run this script once to programmatically build the vector search index (`vector_index`) on the `ai_chunks` collection:
```bash
venv\Scripts\python.exe app\scripts\create_search_index.py
```

### 2. Ingest Articles & Generate Embeddings
Run this to parse and embed migrated articles from the MongoDB `articles` collection:
```bash
venv\Scripts\python.exe app\scripts\ingest_articles.py
```
*Note: This automatically deletes old chunks for processed articles and updates the `last_embedded_at` timestamp on completion.*

### 3. Ingest Articles from PDF Files
We have added scripts to support direct PDF ingestion into the RAG database:

* **For a single article PDF**:
  ```bash
  venv\Scripts\python.exe app\scripts\ingest_pdf.py --pdf "path/to/document.pdf" --title "Article Title" --category "Tech Insights"
  ```
  *(Creates a single article doc and embeds it)*

* **For a multi-article PDF (AI-Assisted Splitting)**:
  If a single PDF contains multiple (e.g. 10) articles, run this to automatically split and ingest them as separate documents:
  ```bash
  venv\Scripts\python.exe app\scripts\ingest_multi_article_pdf.py --pdf "path/to/articles.pdf"
  ```

---

## Running the Server

Start the FastAPI app locally:
```bash
venv\Scripts\uvicorn.exe --app-dir app main:app --reload --port 8000
```
The server will start on `http://localhost:8000` and watch for code changes.

---

## Verification & Manual Testing

To verify the retrieval pipeline and LLM synthesis end-to-end, execute the test script:
```bash
venv\Scripts\python.exe app\scripts\test_rag.py
```

### Expected Output
```text
User Query: 'Is AWD worth buying in India?'

Retrieving chunks...
[INFO] Checking Atlas Search index status...
[INFO] Found vector search index: vector_index, status: READY
[SUCCESS] Atlas Vector Search active.
Retrieved 5 chunks.

Building prompt...

Synthesizing answer...
[INFO] Attempting answer generation with Groq...
[SUCCESS] Answered using Groq (llama-3.3-70b-versatile) with API key from: GROQ_API_KEY

Raw Response:
{
  "reasoning": "...",
  "pros": [...],
  "cons": [...],
  "verdict": "...",
  "sources": [...],
  "has_answer": true
}
```

---

## Verification Info
* **Last Verified Date:** June 26, 2026
* **Verification Status:** Passed (Atlas Vector Search Index, Plain-text Chunker, PDF splits/ingestion, Groq-Cascade LLM, Hybrid Search, CrossEncoder Re-ranking, and Frontend Full-page AI Mode Page fully operational)
* **Owner:** Shravani Pachkawade (AI Full Stack Intern)
* **Branch:** `dev-shravani-ai`