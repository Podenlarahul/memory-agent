"""
Test LLM connectivity (Groq / xAI fallback)
"""
import os
from dotenv import load_dotenv

load_dotenv()

def test_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("[FAIL] GROQ_API_KEY is not set.")
        return False

    masked = f"{api_key[:4]}...{api_key[-4:]}"
    print(f"[INFO] Testing key {masked}...")

    # If key starts with xai-, try xAI endpoint first
    if api_key.startswith("xai-"):
        print("[INFO] Key starts with 'xai-'. Testing via xAI OpenAI-compatible endpoint...")
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key, base_url="https://api.x.ai/v1")
            completion = client.chat.completions.create(
                model="grok-2-latest", # or grok-beta
                messages=[{"role": "user", "content": "Respond with 'SupportMind LLM Active'"}],
                max_tokens=20
            )
            print("[SUCCESS] xAI Response:", completion.choices[0].message.content)
            return True, "xai", "grok-2-latest", "https://api.x.ai/v1"
        except Exception as e:
            print(f"[WARN] xAI call failed: {e}. Trying grok-beta...")
            try:
                client = OpenAI(api_key=api_key, base_url="https://api.x.ai/v1")
                completion = client.chat.completions.create(
                    model="grok-beta",
                    messages=[{"role": "user", "content": "Respond with 'SupportMind LLM Active'"}],
                    max_tokens=20
                )
                print("[SUCCESS] xAI grok-beta Response:", completion.choices[0].message.content)
                return True, "xai", "grok-beta", "https://api.x.ai/v1"
            except Exception as e2:
                print(f"[WARN] xAI grok-beta failed: {e2}")

    # Try Groq API
    print("[INFO] Testing with Groq SDK...")
    try:
        from groq import Groq
        groq_client = Groq(api_key=api_key)
        resp = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Respond with 'SupportMind LLM Active'"}],
            max_tokens=20
        )
        print("[SUCCESS] Groq Response:", resp.choices[0].message.content)
        return True, "groq", "llama-3.3-70b-versatile", None
    except Exception as e:
        print(f"[WARN] Groq SDK call failed: {e}")

    return False, None, None, None

if __name__ == "__main__":
    success, provider, model, base_url = test_llm()
    print("Result:", success, provider, model)
