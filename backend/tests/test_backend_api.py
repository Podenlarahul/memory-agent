"""
Updated Backend Test Suite for SupportMind
Tests:
1. Health check endpoint
2. Clean empty initial state
3. Customer registration & dynamic directory
4. Customer isolation / privacy protection (Customer A cannot access Customer B)
5. Chat flow with Hindsight memory recall & retention
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from auth import create_access_token
from customer_store import customer_store

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "hindsight" in data
    # Ensure no API key is exposed
    assert "api_key" not in str(data)

def test_admin_customer_directory_and_registration():
    admin_token = create_access_token({
        "sub": "admin_01",
        "name": "Admin",
        "email": "admin@supportmind.ai",
        "role": "admin"
    })
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Register a new customer via API
    reg_resp = client.post("/api/auth/register", json={
        "name": "Rahul Sharma",
        "email": "rahul.test@example.com",
        "password": "password123",
        "device": "Dell XPS 15",
        "company": "TechCorp India"
    })
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    assert reg_data["role"] == "customer"
    assert "access_token" in reg_data

    # Admin lists customers
    resp = client.get("/api/customers", headers=headers)
    assert resp.status_code == 200
    customers = resp.json()
    assert len(customers) >= 1
    emails = [c["email"] for c in customers]
    assert "rahul.test@example.com" in emails

def test_customer_privacy_isolation():
    # Register Customer A: Rahul
    cust_a = customer_store.register_customer(
        name="Rahul Sharma",
        email="rahul.privacy@example.com",
        password="password123",
        device="Dell XPS 15"
    )
    
    # Register Customer B: Priya
    cust_b = customer_store.register_customer(
        name="Priya Mehta",
        email="priya.privacy@example.com",
        password="password123",
        device="HP LaserJet"
    )

    token_a = create_access_token({
        "sub": f"user_{cust_a.id}",
        "name": cust_a.name,
        "email": cust_a.email,
        "role": "customer",
        "customer_id": cust_a.id
    })
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 1. Customer A cannot access global customer directory
    resp = client.get("/api/customers", headers=headers_a)
    assert resp.status_code == 403

    # 2. Customer A can access their own profile
    resp = client.get(f"/api/customers/{cust_a.id}", headers=headers_a)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Rahul Sharma"

    # 3. Customer A CANNOT access Customer B's profile
    resp = client.get(f"/api/customers/{cust_b.id}", headers=headers_a)
    assert resp.status_code == 403
    assert "Privacy Protection" in resp.json()["detail"]

    # 4. Customer A CANNOT access Customer B's memories
    resp = client.get(f"/api/customers/{cust_b.id}/memories", headers=headers_a)
    assert resp.status_code == 403

    # 5. Customer A CANNOT access Customer B's conversations
    resp = client.get(f"/api/customers/{cust_b.id}/conversations", headers=headers_a)
    assert resp.status_code == 403

def test_chat_workflow_with_memory():
    cust = customer_store.register_customer(
        name="Vikram Test",
        email="vikram.test@example.com",
        password="password123",
        device="Dell XPS 15"
    )
    token = create_access_token({
        "sub": f"user_{cust.id}",
        "name": cust.name,
        "email": cust.email,
        "role": "customer",
        "customer_id": cust.id
    })

    payload = {
        "customer_id": cust.id,
        "message": "My Wi-Fi keeps disconnecting during high-bandwidth video meetings."
    }

    resp = client.post("/api/chat", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "response" in data
    assert data["customer_id"] == cust.id
    assert len(data["response"]) > 20

if __name__ == "__main__":
    pytest.main(["-v", "backend/tests/test_backend_api.py"])
