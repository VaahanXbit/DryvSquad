def build_prompt(query: str, chunks: list[dict], history: list = None) -> str:
    """
    Build the RAG prompt from retrieved chunks and user query, including conversation history.
    Strict RAG, answer only from provided context.
    """
    if not chunks:
        return f"""You are DryvSquad AI, an automotive knowledge assistant for Indian car buyers.

A user asked: "{query}"

No relevant information was found in DryvSquad's knowledge base for this query.

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

    # Format conversation history if available
    history_text = ""
    if history:
        history_parts = []
        for msg in history:
            if msg["sender"] == "user":
                history_parts.append(f"User: {msg.get('text', '')}")
            else:
                res = msg.get("result") or {}
                verdict = res.get("verdict", "")
                reasoning = res.get("reasoning", "")
                history_parts.append(f"AI: Verdict: {verdict}. Reasoning: {reasoning}")
        history_text = "\n".join(history_parts)

    prompt = f"""You are DryvSquad AI, a highly knowledgeable and expert automotive advisor for Indian car buyers.
Your goal is to answer the user's question accurately, with deep understanding, using ONLY the provided context. Make the response highly engaging to read and keep the user's attention.

CONTEXT FROM DRYVSQUAD KNOWLEDGE BASE:
{context}"""

    if history_text:
        prompt += f"""

CONVERSATION HISTORY (Use this to resolve pronouns like 'it', 'they', or follow-up references to previous questions):
{history_text}"""

    prompt += f"""

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

2. STABILITY & TRUTH (CRITICAL BOUNDARIES):
   - You must act strictly as a RAG (Retrieval-Augmented) system. Answer ONLY using the provided DRYVSQUAD context. Do NOT make up facts, and do NOT use your general pre-trained knowledge to answer questions that are not present in the provided context.
   - Use the CONVERSATION HISTORY to resolve follow-up context.
   - If the user query is completely irrelevant to automotive topics (e.g., asking about cricketers, actors, movies, general history, geography, science) or if the provided context does not contain the answer:
     - You MUST refuse to answer using general knowledge.
     - Set "verdict" to "I couldn't find relevant information in DryvSquad's knowledge base."
     - Set "has_answer" to false.
     - Set "reasoning" to a brief statement explaining that the topic (e.g. "Sachin") is outside the scope of DryvSquad's automotive database.
     - Do NOT provide any factual answer from your general pre-trained knowledge (e.g. do NOT say who Sachin is or describe his career).
     - Set "pros" and "cons" to [].

Respond STRICTLY in JSON format (do not wrap in markdown or backticks, do not include any text before or after the JSON):
{{
  "reasoning": "Explanation matching the query type or why the topic is out of scope (4-5 sentences)",
  "pros": ["pro 1", "pro 2"] or [],
  "cons": ["con 1", "con 2"] or [],
  "verdict": "One-line recommendation, definition, or 'I couldn't find relevant information in DryvSquad's knowledge base.'",
  "sources": {sources_json},
  "has_answer": true or false
}}"""

    return prompt


def build_rewrite_prompt(query: str, history: list) -> str:
    """
    Build the prompt to rewrite a follow-up query into a standalone search query.
    """
    history_parts = []
    for msg in history:
        if msg["sender"] == "user":
            history_parts.append(f"User: {msg.get('text', '')}")
        else:
            res = msg.get("result") or {}
            verdict = res.get("verdict", "")
            history_parts.append(f"AI: {verdict}")
    history_text = "\n".join(history_parts)

    prompt = f"""You are an expert search query generator.
Given a conversation history between a User and an AI, and a new follow-up question from the User, rewrite the follow-up question to be a standalone, search-friendly query.

RULES:
1. DETECT TOPIC SHIFTS (CRITICAL): If the follow-up question is about a completely different topic than the conversation history (e.g. history is about Spiti tyres, but the new question is "E20", "PHEV", or "what is ADAS"), you MUST recognize this as a topic shift. Do NOT merge them. Output the new follow-up question exactly as-is (e.g. "E20" or "PHEV").
2. CONTEXT RESOLUTION: Only rewrite the query if the follow-up question directly refers to or relies on a topic or pronoun in the history (e.g. "why?", "is it safe?", "in short?", "explain more", "compared to what?", "is it worth it?"). In such cases, rewrite it to be fully self-contained and descriptive (e.g., "why are hydrogen fuel cell trucks not widely adopted?", "is hydrogen fuel cell truck safe?").
3. NO FORCE-MERGING: Never append words or context from the history if the follow-up is already an independent keyword or term.
4. Output ONLY the standalone query. Do not add any introduction, explanations, quotes, markdown formatting, or notes.

CONVERSATION HISTORY:
{history_text}

FOLLOW-UP QUESTION: {query}

STANDALONE QUERY:"""
    return prompt


def check_small_talk(query: str) -> bool:
    """
    Check if the user query is a simple greeting, capability inquiry, or small talk.
    """
    import re
    q = query.lower().strip("?!. \t,")
    
    # Normalize trailing repeated characters (e.g. "hii" -> "hi", "hellooo" -> "hello", "heyyy" -> "hey")
    q_norm = re.sub(r'(.)\1+$', r'\1', q)
    
    greetings = {
        "hi", "hello", "hey", "greetings", "hola", "namaste", "wassup", "what's up",
        "good morning", "good afternoon", "good evening", "how are you", "how's it going",
        "nice to meet you", "hello dryvsquad", "hi dryvsquad", "hey dryvsquad"
    }
    
    capabilities = {
        "who are you", "what is your name", "what is dryvsquad",
        "what are you", "tell me about yourself", "what can you do", "help",
        "help me", "how can you help", "is this working", "are you online", "test",
        "how do i use this", "what is this"
    }
    
    # Check for exact or normalized matches
    if q in greetings or q in capabilities or q_norm in greetings or q_norm in capabilities:
        return True
        
    # Check for common substring matches for greetings
    if any(greet in q or greet in q_norm for greet in ["hello dryvsquad", "hi dryvsquad"]):
        return True
        
    return False


def build_small_talk_prompt(query: str, history: list = None) -> str:
    """
    Build a friendly conversational prompt for small talk or greetings.
    """
    history_text = ""
    if history:
        history_parts = []
        for msg in history:
            if msg["sender"] == "user":
                history_parts.append(f"User: {msg.get('text', '')}")
            else:
                res = msg.get("result") or {}
                verdict = res.get("verdict", "")
                history_parts.append(f"AI: {verdict}")
        history_text = "\n".join(history_parts)

    prompt = f"""You are DryvSquad AI, a highly knowledgeable and friendly automotive assistant for Indian car buyers.
The user is saying a greeting, small talk, or asking about your capabilities (e.g. "hi", "who are you", "what can you do").

Respond in a warm, welcoming, and professional conversational manner. 
Introduce yourself as DryvSquad AI, explain that you are an expert automotive advisor for Indian cars, and briefly describe what you can help them with:
- Comparing features (e.g. AWD vs FWD, ADAS usefulness)
- Tech insights (e.g. LFP vs NMC batteries, E20 ethanol compatibility)
- Purchase advice and service costs

IMPORTANT:
1. Respond with actual conversational text. Do NOT output descriptions of what you should say or placeholder instructions.
2. Keep the greeting friendly, natural, and engaging (e.g., "Hello! I am DryvSquad AI, your automotive assistant...").
3. Set the "is_small_talk" key to true.
4. Set the "verdict" key to your generated friendly paragraph.
5. Set the "reasoning" key to "" (empty string).

CONVERSATION HISTORY:
{history_text}

USER GREETING: {query}

Respond STRICTLY in JSON format (do not wrap in markdown or backticks, do not include any text before or after the JSON):
{{
  "reasoning": "",
  "pros": [],
  "cons": [],
  "verdict": "Hello! I am DryvSquad AI, your automotive knowledge assistant. I am here to help you compare cars, understand specifications, check fuel/battery compatibility, or analyze ownership costs for the Indian car market. How can I help you today?",
  "sources": [],
  "has_answer": true,
  "is_small_talk": true
}}"""
    return prompt