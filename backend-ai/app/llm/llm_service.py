import os
import json
from google import genai
from dotenv import load_dotenv
import time

load_dotenv()

MOCK_MODE = False

gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate(prompt: str, max_tokens: int = 800) -> str:
    if MOCK_MODE:
        return '''{
          "reasoning": "Based on DryvSquad knowledge base analysis of Indian driving conditions.",
          "pros": ["Relevant pro from knowledge base"],
          "cons": ["Relevant con from knowledge base"],
          "verdict": "Mock verdict. Set MOCK_MODE=false for real answers.",
          "sources": [],
          "has_answer": true
        }'''
    try:
        print("[INFO] Attempting answer generation with Groq...")
        return generate_with_groq(prompt, max_tokens)
    except Exception as e_groq:
        print(f"[WARNING] Groq failed: {e_groq}. Trying Gemini...")
        try:
            return generate_with_gemini(prompt, max_tokens)
        except Exception as e:
            print(f"[WARNING] Gemini failed: {e}. Trying OpenAI...")
            try:
                return generate_with_openai(prompt, max_tokens)
            except Exception as e2:
                raise Exception(f"All LLMs failed. Groq: {e_groq}. Gemini: {e}. OpenAI: {e2}")


def generate_with_groq(prompt: str, max_tokens: int = 800) -> str:
    from groq import Groq
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not defined in environment variables.")
        
    client = Groq(api_key=api_key)
    
    # Try [llama-3.3-70b-versatile], fallback to [llama-3.1-8b-instant] 
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=max_tokens
        )
        result = completion.choices[0].message.content
        print("[SUCCESS] Answered using Groq (llama-3.3-70b-versatile) with API key from: GROQ_API_KEY")
        return result
    except Exception as e:
        print(f"[INFO] Groq llama-3.3-70b-versatile failed: {e}. Trying llama-3.1-8b-instant fallback...")
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=max_tokens
        )
        result = completion.choices[0].message.content
        print("[SUCCESS] Answered using Groq (llama-3.1-8b-instant) with API key from: GROQ_API_KEY")
        return result


def generate_with_gemini(prompt: str, max_tokens: int = 800) -> str:
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=max_tokens,
                )
            )
            result = response.text
            print("[SUCCESS] Answered using Gemini (gemini-2.5-flash) with API key from: GEMINI_API_KEY")
            return result
        except Exception as e:
            error_str = str(e)
            if ("503" in error_str or "429" in error_str) and attempt < max_retries - 1:
                wait = (attempt + 1) * 10
                print(f"⏳ Gemini busy, retrying in {wait}s (attempt {attempt + 1}/{max_retries})...")
                time.sleep(wait)
                continue
            raise


def generate_with_openai(prompt: str, max_tokens: int = 800) -> str:
    from openai import OpenAI
    api_key = os.getenv("OPENAI_API_KEY", "")
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens
    )
    result = response.choices[0].message.content
    print("[SUCCESS] Answered using OpenAI (gpt-4.1-mini) with API key from: OPENAI_API_KEY")
    return result
