from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from models import CreateConversationRequest, CreateConversationResponse, Conversation, UserProfile, UpdateStatusRequest, SolutionRecord, KnownIssue
from auth import get_current_user, verify_customer_access
from customer_store import customer_store

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])

@router.post("", response_model=CreateConversationResponse)
async def create_conversation(
    req: Optional[CreateConversationRequest] = None,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Start a fresh conversation session.
    Only authenticated customers can create conversations.
    Admins are strictly rejected with 403 Forbidden.
    """
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot create customer conversations."
        )

    customer_id = current_user.customer_id
    if not customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer ID missing from authenticated session."
        )

    # Ensure customer exists in store
    cust = customer_store.get_customer(customer_id)
    if not cust:
        cust = customer_store.restore_customer(customer_id, current_user.name, current_user.email)

    title = req.title if req and req.title else "New Support Session"
    new_conv = customer_store.create_new_conversation(customer_id, title=title)

    return CreateConversationResponse(
        conversation_id=new_conv.id,
        customer_id=customer_id,
        created_at=new_conv.updated_at,
        title=new_conv.title,
        status=new_conv.status
    )


@router.get("", response_model=List[Conversation])
async def list_conversations(current_user: UserProfile = Depends(get_current_user)):
    """
    Get conversations for current user.
    Customer only sees their own; Admin sees all.
    """
    if current_user.role == "customer":
        cid = current_user.customer_id
        if not cid:
            import re
            name_slug = re.sub(r'[^a-zA-Z0-9]', '_', (current_user.name or 'customer').lower())
            cid = f"cust_{name_slug}_001"
        cust = customer_store.get_customer(cid)
        if not cust:
            cust = customer_store.restore_customer(cid, current_user.name, current_user.email)
        return customer_store.get_conversations(cid)
    else:
        # Admin: collect all conversations
        all_convs = []
        for cust_id in customer_store._conversations:
            all_convs.extend(customer_store.get_conversations(cust_id))
        return all_convs

@router.get("/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Get a single conversation by ID with privacy verification.
    """
    # Search across customers
    for cust_id, conv_list in customer_store._conversations.items():
        for conv in conv_list:
            if conv.id == conversation_id:
                # Privacy check: Customer can only access their own
                verify_customer_access(current_user, cust_id)
                return conv

    # If requested by an authenticated customer, auto-provision session to prevent 404 errors
    if current_user.role == "customer":
        cid = current_user.customer_id
        if not cid:
            import re
            name_slug = re.sub(r'[^a-zA-Z0-9]', '_', (current_user.name or 'customer').lower())
            cid = f"cust_{name_slug}_001"
        cust = customer_store.get_customer(cid)
        if not cust:
            cust = customer_store.restore_customer(cid, current_user.name, current_user.email)

        title = conversation_id.replace("conv_", "").replace("_", " ").title()
        new_conv = Conversation(
            id=conversation_id,
            customer_id=cid,
            title=title if title else "Support Session",
            status="open",
            updated_at="Just now",
            messages=[]
        )
        customer_store._conversations.setdefault(cid, []).append(new_conv)
        return new_conv

    raise HTTPException(status_code=404, detail="Conversation not found.")


@router.patch("/{conversation_id}/status")
async def update_conversation_status(
    conversation_id: str,
    req: UpdateStatusRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Update status of a conversation (e.g. 'resolved' or 'open') and synchronize
    the associated ticket so it moves to the Resolved or Open section.
    """
    clean_status = req.status.lower().strip()
    if clean_status not in ["open", "resolved", "closed"]:
        raise HTTPException(status_code=400, detail="Status must be 'open' or 'resolved'.")

    # Locate conversation
    target_conv = None
    target_cust_id = None
    for cust_id, conv_list in customer_store._conversations.items():
        for conv in conv_list:
            if conv.id == conversation_id:
                verify_customer_access(current_user, cust_id)
                target_conv = conv
                target_cust_id = cust_id
                break
        if target_conv:
            break

    if not target_conv:
        # If customer session, auto-provision and set status
        if current_user.role == "customer":
            cid = current_user.customer_id or "cust_001"
            title = conversation_id.replace("conv_", "").replace("_", " ").title()
            target_conv = Conversation(
                id=conversation_id,
                customer_id=cid,
                title=title if title else "Support Session",
                status=clean_status,
                updated_at="Just now",
                messages=[]
            )
            customer_store._conversations.setdefault(cid, []).append(target_conv)
            target_cust_id = cid
        else:
            raise HTTPException(status_code=404, detail="Conversation not found.")

    target_conv.status = clean_status
    target_conv.updated_at = "Just now"

    # Synchronize customer's ticket / known issues
    cust = customer_store.get_customer(target_cust_id)
    if cust:
        # Find matching known issue by keywords in conversation title or use the most relevant issue
        matching_issue = None
        conv_title_words = set(target_conv.title.lower().split())
        for issue in cust.known_issues:
            issue_words = set(issue.title.lower().split())
            if conv_title_words.intersection(issue_words):
                matching_issue = issue
                break
        
        # If no direct title match, find first open issue (if resolving) or first resolved issue (if reopening)
        if not matching_issue:
            for issue in cust.known_issues:
                if clean_status == "resolved" and issue.status == "open":
                    matching_issue = issue
                    break
                elif clean_status == "open" and issue.status == "resolved":
                    matching_issue = issue
                    break

        if matching_issue:
            matching_issue.status = clean_status
        else:
            # If no known issue existed, create one to reflect this ticket!
            new_issue = KnownIssue(
                id=f"iss_{int(datetime.now().timestamp())}",
                title=target_conv.title,
                context=f"Support session {conversation_id}",
                status=clean_status,
                severity="medium",
                reported_at="Just now"
            )
            cust.known_issues.insert(0, new_issue)
            matching_issue = new_issue

        # Update open_tickets count
        cust.open_tickets = sum(1 for i in cust.known_issues if i.status.lower() == "open")

        # If marking resolved, record in solutions_worked
        if clean_status == "resolved":
            sol_note = f"Resolved via Support Session: {target_conv.title}"
            if not any(s.note == sol_note for s in cust.solutions_worked):
                cust.solutions_worked.append(
                    SolutionRecord(
                        title=target_conv.title,
                        note=sol_note,
                        date=datetime.now().strftime("%b %d, %Y"),
                        successful=True
                    )
                )

    customer_store.save()

    return {
        "status": "success",
        "conversation_id": target_conv.id,
        "conversation_status": target_conv.status,
        "open_tickets": cust.open_tickets if cust else 0
    }
