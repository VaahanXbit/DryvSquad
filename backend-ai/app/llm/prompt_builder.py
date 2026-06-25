def build_prompt(query: str, chunks: list[dict]) -> str:
    """
    Build the RAG prompt from retrieved chunks and user query.
    Strict RAG, answer only from provided context.
    """
    if not chunks:
        return f"""You are VAHAN, an automotive knowledge assistant for Indian car buyers.

A user asked: "{query}"

No relevant information was found in Vaahan's knowledge base for this query.

Respond with exactly this JSON and nothing else:
{{
  "reasoning": "I couldn't find relevant information in Vaahan's knowledge base for this query.",
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

    prompt = f"""You are VAHAN, an expert automotive knowledge assistant for Indian car buyers.
You answer questions STRICTLY based on the provided context from Vaahan's knowledge base.
You give honest, practical, opinionated advice, not generic yes/no answers.
If the answer cannot be found in the context, say so clearly.

CONTEXT FROM VAAHAN KNOWLEDGE BASE:
{context}

USER QUESTION: {query}

INSTRUCTIONS:
- Answer ONLY from the context above
- Be direct and opinionated, give a clear recommendation
- If context doesn't contain enough info, say "I couldn't find relevant information in Vaahan's knowledge base"
- Do NOT use general internet knowledge
- Keep reasoning concise (2-3 sentences)
- Pros and cons should be specific to Indian conditions

Respond with ONLY this JSON format, no markdown, no backticks, no extra text:
{{
  "reasoning": "2-3 sentences explaining the answer based on the context",
  "pros": ["specific pro 1", "specific pro 2", "specific pro 3"],
  "cons": ["specific con 1", "specific con 2", "specific con 3"],
  "verdict": "direct one-line recommendation",
  "sources": {sources_json},
  "has_answer": true
}}"""

    return prompt