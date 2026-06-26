def build_prompt(query: str, chunks: list[dict]) -> str:
    """
    Build the RAG prompt from retrieved chunks and user query.
    Strict RAG, answer only from provided context.
    """
    if not chunks:
        return f"""You are VAHAN, an automotive knowledge assistant for Indian car buyers.

A user asked: "{query}"

No relevant information was found in Vaahan's knowledge base for this query.

Respond with exactly this JSON and nothing else(STRICTLY):
{{
  "reasoning": "",
  "pros": [],
  "cons": [],
  "verdict": "Please try searching for a more specific automotive topic.",
  "sources": [],
  "has_answer": false
}}"""

    # Building from chunks
    context_parts = []
    seen_titles = set()

    for i, chunk in enumerate(chunks):
        title = chunk["title"]
        text = chunk["chunk_text"]
        source_type = chunk["source_type"]
        context_parts.append(
            f"[Source {i+1} — {source_type.upper()}: {title}]\n{text}"
        )
        seen_titles.add(title)

    context = "\n\n".join(context_parts)

    # Build sources list for response
    sources = []
    for chunk in chunks:
        source_entry = {
            "title": chunk["title"],
            "slug": chunk["slug"],
            "source_type": chunk["source_type"],
            "category": chunk["category"]
        }
        if source_entry not in sources:
            sources.append(source_entry)

    sources_json = str(sources).replace("'", '"')

    prompt = f"""You are VAHAN, a highly knowledgeable and expert automotive advisor for Indian car buyers.
Your goal is to answer the user's question accurately, with deep understanding, using ONLY the provided context. Make the response highly engaging to read and keep the user's attention.

CONTEXT FROM VAAHAN KNOWLEDGE BASE:
{context}

USER QUESTION: {query}

INSTRUCTIONS:
1. CUSTOMIZE RESPONSE BASED ON THE QUERY TYPE:
   - FOR DECISION-MAKING / ADVICE QUERIES (e.g. "Should I buy...", "Is ... worth it?", "X vs Y"):
     - "verdict": A clear, direct, one-line recommendation (e.g. "Skip sunroofs unless you drive at night on highways; they are useless in hot Indian summers.").
     - "reasoning": A detailed, well-structured explanation supporting your verdict (4-5 sentences, highly informative).
     - "pros" & "cons": Lists of 2-3 specific advantages and disadvantages under Indian conditions.
   - FOR FACTUAL / DEFINITIONAL QUERIES (e.g. "What is E20?", "What does ADAS stand for?"):
     - "verdict": A clear, one-sentence summary definition or core fact (e.g. "E20 is petrol blended with 20% ethanol, currently being phased in across India.").
     - "reasoning": A detailed explanation of what it is, why it matters, and any compatibility concerns (4-5 sentences).
     - "pros" & "cons": Include only if there are clear benefits/drawbacks to that technology (e.g. for E20: lower emissions vs fuel line damage). Otherwise, leave as empty arrays [].
   - FOR HOW-TO / PROCESS QUERIES (e.g. "How to check compliance?", "How to clean injector?"):
     - "verdict": A one-sentence summary of the main method or answer.
     - "reasoning": A clear step-by-step or descriptive explanation of the procedure (4-5 sentences).
     - "pros" & "cons": Keep as empty arrays [] since pros/cons do not apply to how-to instructions.

2. STABILITY & TRUTH:
   - Answer ONLY using the provided context. Do NOT make up facts or use external internet knowledge.
   - If the context does not contain the answer or the query is completely irrelevant:
     - Set "verdict" to "I couldn't find relevant information in Vaahan's knowledge base."
     - Set "has_answer" to false.
     - Set "reasoning" to a brief explanation of what is missing.
     - Set "pros" and "cons" to [].

Respond STRICTLY in JSON format (do not wrap in markdown or backticks, do not include any text before or after the JSON):
{{
  "reasoning": "Detailed, engaging explanation matching the query type (4-5 sentences)",
  "pros": ["pro 1", "pro 2"] or [],
  "cons": ["con 1", "con 2"] or [],
  "verdict": "One-line recommendation, definition, or summary",
  "sources": {sources_json},
  "has_answer": true
}}"""

    return prompt