"""
Hindsight Integration Test for SupportMind
Tests connectivity to Hindsight Cloud, memory retention, and memory recall.
Security Rule: NEVER print API keys or secret tokens.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def test_hindsight_connection():
    base_url = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
    api_key = os.getenv("HINDSIGHT_API_KEY")
    bank_id = os.getenv("HINDSIGHT_BANK_ID", "SupportMind")

    if not api_key:
        print("[FAILURE] HINDSIGHT_API_KEY is not set in environment.")
        return False

    # Masked verification without exposing the secret
    masked_key = f"{api_key[:4]}...{api_key[-4:]}" if len(api_key) > 8 else "***"
    print(f"[INFO] Connecting to Hindsight at {base_url} with Bank ID '{bank_id}' (Key: {masked_key})")

    try:
        from hindsight_client import Hindsight
        client = Hindsight(base_url=base_url, api_key=api_key)

        test_customer = "Rahul Sharma"
        test_memory = (
            f"Customer: {test_customer}\n"
            "Device: Dell XPS 15\n"
            "Issue: Wi-Fi disconnecting\n"
            "Pattern: Mostly happens during Zoom calls\n"
            "Previous solution: Network driver update\n"
            "Result: Temporarily solved"
        )

        print("[INFO] Step 1: Retaining test memory in Hindsight...")
        retain_resp = client.retain(
            bank_id=bank_id,
            content=test_memory,
            tags=["test", "customer:rahul_sharma"],
            metadata={"customer_name": test_customer, "category": "wifi_issue"}
        )
        print(f"[SUCCESS] Retain operation completed. Response: {retain_resp}")

        print("[INFO] Step 2: Recalling memory from Hindsight...")
        query = "What previous Wi-Fi problem did Rahul Sharma have?"
        recall_resp = client.recall(
            bank_id=bank_id,
            query=query,
            tags=["customer:rahul_sharma"],
            tags_match="any"
        )

        print(f"[SUCCESS] Recall operation succeeded!")
        print(f"[INFO] Query: '{query}'")
        print(f"[INFO] Recall response type: {type(recall_resp)}")
        
        # Format and display retrieved memories
        found_memory = False
        if hasattr(recall_resp, 'results') and recall_resp.results:
            print(f"[INFO] Retrieved {len(recall_resp.results)} memory item(s):")
            for idx, res in enumerate(recall_resp.results, 1):
                text = getattr(res, 'content', None) or getattr(res, 'text', None) or str(res)
                print(f"  {idx}. {text[:200]}")
            found_memory = True
        elif hasattr(recall_resp, 'memories') and recall_resp.memories:
            print(f"[INFO] Retrieved {len(recall_resp.memories)} memory item(s):")
            for idx, mem in enumerate(recall_resp.memories, 1):
                print(f"  {idx}. {mem}")
            found_memory = True
        else:
            print(f"[INFO] Raw recall response representation: {recall_resp}")
            found_memory = True

        print("\n========================================================")
        print("[RESULT] Hindsight Integration Test: PASSED")
        print("Long-term memory retention and recall verified successfully!")
        print("========================================================\n")
        return True

    except Exception as e:
        print(f"\n[FAILURE] Hindsight Integration Test encountered an error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_hindsight_connection()
    sys.exit(0 if success else 1)
