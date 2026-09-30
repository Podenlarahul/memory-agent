from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from models import Customer, CustomerMemoryView, Conversation, MemoryItem, UserProfile
from auth import get_current_user, verify_customer_access
from customer_store import customer_store
from hindsight_service import hindsight_service

router = APIRouter(prefix="/api/customers", tags=["Customers & Memory"])

@router.get("", response_model=List[Customer])
async def list_customers(current_user: UserProfile = Depends(get_current_user)):
    """
    List all customers for Support Agents / Admins.
    Customers cannot view other customers.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only Support Agents can access the customer directory."
        )
    return customer_store.get_all_customers()

@router.get("/admin/conversations")
async def list_all_conversations(current_user: UserProfile = Depends(get_current_user)):
    """
    Admin endpoint to view all active conversations across all customers.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only Support Agents can view all conversations."
        )
    return customer_store.get_all_conversations()

@router.post("/admin/cleanup-test-data")
async def cleanup_test_data(current_user: UserProfile = Depends(get_current_user)):
    """
    Admin endpoint to safely remove any accidental admin-as-customer test records.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only Support Agents can run maintenance cleanup."
        )
    deleted = customer_store.cleanup_admin_customer_records()
    return {"status": "success", "purged_records": deleted}

@router.post("/seed-demo")
async def seed_demo_customer(current_user: UserProfile = Depends(get_current_user)):
    """
    Optional helper endpoint: Manually create a sample test customer on demand.
    Starts empty by default; this endpoint is only called if requested explicitly.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only Support Agents can seed demo customers."
        )
    existing = customer_store.get_customer_by_email("rahul@example.com")
    if existing:
        return existing
    cust = customer_store.register_customer(
        name="Rahul Sharma",
        email="rahul@example.com",
        password="password123",
        device="Dell XPS 15",
        company="TechCorp India",
        location="Hyderabad, India",
        plan="Premium Support"
    )
    return cust


@router.get("/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, current_user: UserProfile = Depends(get_current_user)):
    """
    Get customer profile.
    Privacy enforcement: Customers can only fetch their own profile.
    """
    verify_customer_access(current_user, customer_id)
    customer = customer_store.get_customer(customer_id)
    if not customer:
        if current_user.role == "customer" and (current_user.customer_id == customer_id or not current_user.customer_id):
            customer = customer_store.restore_customer(customer_id, current_user.name, current_user.email)
        else:
            raise HTTPException(status_code=404, detail="Customer not found.")
    return customer

@router.get("/{customer_id}/memories", response_model=CustomerMemoryView)
async def get_customer_memories(customer_id: str, current_user: UserProfile = Depends(get_current_user)):
    """
    Fetch all persistent memories for this customer directly from Hindsight Cloud.
    Visualized on Support Agent memory panel.
    """
    verify_customer_access(current_user, customer_id)
    customer = customer_store.get_customer(customer_id)
    customer_name = customer.name if customer else customer_id
    
    # Query Hindsight Cloud for real memories asynchronously
    hindsight_memories = await hindsight_service.list_customer_memories(customer_id)
    
    memory_items: List[MemoryItem] = []
    for m in hindsight_memories:
        memory_items.append(
            MemoryItem(
                id=m.get("id", ""),
                text=m.get("text", ""),
                type=m.get("type", "observation"),
                entities=m.get("entities", ""),
                tags=m.get("tags", []),
                timestamp=m.get("timestamp")
            )
        )

    # Compile structured summary
    known_issues = [f"{i.title} ({i.context})" for i in customer.known_issues] if customer else []
    successful = [f"{s.title}: {s.note}" for s in customer.solutions_worked] if customer else []
    failed = [f"{s.title}: {s.note}" for s in customer.solutions_failed] if customer else []
    preferences = customer.preferences if customer else []

    bank_id = hindsight_service.get_bank_id_for_customer(customer_id)

    return CustomerMemoryView(
        customer_id=customer_id,
        customer_name=customer_name,
        bank_id=bank_id,
        total_memories=len(memory_items),
        memories=memory_items,
        known_issues=known_issues,
        successful_solutions=successful,
        failed_solutions=failed,
        preferences=preferences
    )

@router.get("/{customer_id}/conversations", response_model=List[Conversation])
async def get_customer_conversations(customer_id: str, current_user: UserProfile = Depends(get_current_user)):
    """
    Retrieve conversation history for a customer.
    """
    verify_customer_access(current_user, customer_id)
    return customer_store.get_conversations(customer_id)

@router.post("/{customer_id}/conversations/new", response_model=Conversation)
async def create_new_conversation(customer_id: str, current_user: UserProfile = Depends(get_current_user)):
    """
    Start a fresh support conversation session.
    """
    verify_customer_access(current_user, customer_id)
    return customer_store.create_new_conversation(customer_id)
