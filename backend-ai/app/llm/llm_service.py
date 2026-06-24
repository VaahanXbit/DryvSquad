import os
import json
from google import genai
from dotenv import load_dotenv
import time

load_dotenv()

MOCK_MODE = True

# Gemini client
gemini_client = genai.Client(api_key=os.getenv("GROQ_API_KEY"))

def generate(prompt: str) -> str:
    if MOCK_MODE:
        return '''{
          "reasoning": "Based on Vaahan knowledge base analysis of Indian driving conditions.",
          "pros": ["Relevant pro from knowledge base"],
          "cons": ["Relevant con from knowledge base"],
          "verdict": "Mock verdict. Set MOCK MODE=false for real answers.",
          "sources": [],
          "has_answer": true
        }'''
    try:
        return generate_with_gemini(prompt)
    except Exception as e:
        print(f"⚠️ Gemini failed: {e}. Trying OpenAI...")
        try:
            return generate_with_openai(prompt)
        except Exception as e2:
            raise Exception(f"Both LLMs failed. Gemini: {e}. OpenAI: {e2}")


def generate_with_gemini(prompt: str) -> str:
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=1000,
                )
            )
            return response.text
        except Exception as e:
            error_str = str(e)
            if ("503" in error_str or "429" in error_str) and attempt < max_retries - 1:
                wait = (attempt + 1) * 10
                print(f"⏳ Gemini busy, retrying in {wait}s (attempt {attempt + 1}/{max_retries})...")
                time.sleep(wait)
                continue
            raise


def generate_with_openai(prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
