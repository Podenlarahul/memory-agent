import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from fastapi.testclient import TestClient
from main import app
from customer_store import customer_store

client = TestClient(app)

def test_role_separation_suite():
    # 0. Clean store
    customer_store.cleanup_admin_customer_records()

    # TEST 1 — ADMIN LOGIN
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@supportmind.ai",
        "password": "admin123"
    })
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_data = admin_login.json()
    assert admin_data["role"] == "admin"
    assert admin_data["customer_id"] is None
    assert admin_data["user"]["role"] == "admin"
    assert admin_data["user"]["customer_id"] is None
    admin_token = admin_data["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] Test 1: Admin login returns role='admin' and customer_id=None")

    # TEST 2 — CANNOT REGISTER ADMIN AS CUSTOMER
    bad_reg = client.post("/api/auth/register", json={
        "name": "Admin",
        "email": "admin@supportmind.ai",
        "password": "password123"
    })
    assert bad_reg.status_code == 400
    print("[PASS] Test 2: Admin cannot be registered as a customer")

    # TEST 2B — CUSTOMER REGISTRATION & LOGIN
    cust_reg = client.post("/api/auth/register", json={
        "name": "Kiran Kumar",
        "email": "kiran.kumar@vertex.com",
        "password": "Password123!",
        "device": "Asus Vivobook 15",
        "company": "Vertex Systems"
    })
    assert cust_reg.status_code == 200, f"Customer register failed: {cust_reg.text}"
    cust_data = cust_reg.json()
    assert cust_data["role"] == "customer"
    assert cust_data["customer_id"] is not None
    assert cust_data["customer_id"].startswith("cust_")
    assert "admin" not in cust_data["customer_id"]
    cust_token = cust_data["access_token"]
    cust_id = cust_data["customer_id"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}
    print(f"[PASS] Test 2B: Customer registered with customer_id={cust_id}, device='Asus Vivobook 15'")

    # TEST 3 & 6 — ADMIN START CONVERSATION MUST RETURN 403 FORBIDDEN
    admin_start = client.post("/api/conversations", headers=admin_headers, json={
        "title": "Admin Attempt"
    })
    assert admin_start.status_code == 403, f"Expected 403, got {admin_start.status_code}: {admin_start.text}"
    assert "Admin accounts cannot create customer conversations" in admin_start.text
    print("[PASS] Test 3 & 6: Admin calling POST /api/conversations returns 403 Forbidden")

    # TEST 3B — ADMIN CALLING /api/chat MUST RETURN 403 FORBIDDEN
    admin_chat = client.post("/api/chat", headers=admin_headers, json={
        "message": "Hello from admin"
    })
    assert admin_chat.status_code == 403, f"Expected 403, got {admin_chat.status_code}"
    print("[PASS] Test 3B: Admin calling POST /api/chat returns 403 Forbidden")

    # TEST 4 — CUSTOMER ATTEMPTS TO ACCESS ADMIN CUSTOMER DIRECTORY MUST RETURN 403
    cust_dir = client.get("/api/customers", headers=cust_headers)
    assert cust_dir.status_code == 403, f"Expected 403, got {cust_dir.status_code}"
    print("[PASS] Test 4: Customer calling GET /api/customers returns 403 Forbidden")

    # TEST 5 — CUSTOMER START CONVERSATION SUCCEEDS
    cust_conv = client.post("/api/conversations", headers=cust_headers, json={
        "title": "My Wi-Fi issue session"
    })
    assert cust_conv.status_code == 200, f"Customer conversation creation failed: {cust_conv.text}"
    conv_res = cust_conv.json()
    assert conv_res["customer_id"] == cust_id
    assert "conversation_id" in conv_res
    conv_id = conv_res["conversation_id"]
    print(f"[PASS] Test 5: Customer created conversation {conv_id} successfully")

    # TEST 7 — CUSTOMER SENDS CHAT MESSAGE
    chat_res = client.post("/api/chat", headers=cust_headers, json={
        "message": "My Asus Vivobook 15 Wi-Fi keeps disconnecting after sleep mode.",
        "conversation_id": conv_id
    })
    assert chat_res.status_code == 200, f"Customer chat failed: {chat_res.text}"
    chat_data = chat_res.json()
    assert "response" in chat_data
    assert chat_data["customer_id"] == cust_id
    print("[PASS] Test 7: Customer sent chat message; AI responded and scoped to customer")

    # TEST 8 — ADMIN CAN INSPECT THIS CUSTOMER'S PROFILE & MEMORIES
    admin_inspect_cust = client.get(f"/api/customers/{cust_id}", headers=admin_headers)
    assert admin_inspect_cust.status_code == 200
    assert admin_inspect_cust.json()["device"] == "Asus Vivobook 15"

    admin_inspect_mems = client.get(f"/api/customers/{cust_id}/memories", headers=admin_headers)
    assert admin_inspect_mems.status_code == 200
    assert admin_inspect_mems.json()["customer_id"] == cust_id
    print("[PASS] Test 8: Admin can inspect customer profile and memories for", cust_id)

    # TEST 9 — CROSS-CUSTOMER PRIVACY ISOLATION
    # Register customer B
    cust_b_reg = client.post("/api/auth/register", json={
        "name": "Priya Sharma",
        "email": "priya.sharma@domain.com",
        "password": "Password123!"
    })
    assert cust_b_reg.status_code == 200
    cust_b_token = cust_b_reg.json()["access_token"]
    cust_b_headers = {"Authorization": f"Bearer {cust_b_token}"}

    # Customer B attempts to access Customer A's profile
    cross_cust = client.get(f"/api/customers/{cust_id}", headers=cust_b_headers)
    assert cross_cust.status_code == 403, f"Expected 403, got {cross_cust.status_code}"

    # Customer B attempts to access Customer A's memories
    cross_mem = client.get(f"/api/customers/{cust_id}/memories", headers=cust_b_headers)
    assert cross_mem.status_code == 403, f"Expected 403, got {cross_mem.status_code}"

    # Customer B attempts to access Customer A's conversation
    cross_conv = client.get(f"/api/conversations/{conv_id}", headers=cust_b_headers)
    assert cross_conv.status_code == 403, f"Expected 403, got {cross_conv.status_code}"
    print("[PASS] Test 9: Cross-customer access to profile, memories, and conversations strictly returns 403")

    # TEST 10 — REFRESH / TOKEN VERIFICATION
    admin_me = client.get("/api/auth/me", headers=admin_headers)
    assert admin_me.status_code == 200
    assert admin_me.json()["role"] == "admin"
    assert admin_me.json()["customer_id"] is None

    cust_me = client.get("/api/auth/me", headers=cust_headers)
    assert cust_me.status_code == 200
    assert cust_me.json()["role"] == "customer"
    assert cust_me.json()["customer_id"] == cust_id
    print("[PASS] Test 10: /api/auth/me verifies admin has no customer_id and customer has correct customer_id")

if __name__ == "__main__":
    test_role_separation_suite()
    print("\nALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY!")
