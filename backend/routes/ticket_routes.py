import re
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from models import TicketItem, CreateTicketRequest, KnownIssue, UserProfile, UpdateStatusRequest
from auth import get_current_user
from customer_store import customer_store

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])

@router.get("", response_model=List[TicketItem])
async def list_tickets(current_user: UserProfile = Depends(get_current_user)):
    """
    List tickets.
    Customer sees only their own tickets.
    Admin sees all tickets.
    """
    ticket_items = []
    if current_user.role == "customer":
        cid = current_user.customer_id
        if not cid:
            name_slug = re.sub(r'[^a-zA-Z0-9]', '_', (current_user.name or 'customer').lower())
            cid = f"cust_{name_slug}_001"
        cust = customer_store.get_customer(cid)
        if not cust:
            cust = customer_store.restore_customer(cid, current_user.name, current_user.email)
        
        if cust:
            for idx, issue in enumerate(cust.known_issues, 1):
                ticket_items.append(
                    TicketItem(
                        id=f"TKT-2026-{idx:03d}",
                        customer_id=cust.id,
                        customer_name=cust.name,
                        subject=issue.title,
                        status=issue.status.capitalize(),
                        priority=issue.severity.capitalize(),
                        created_at=issue.reported_at or "Recently",
                        context=issue.context
                    )
                )
    else:
        # Admin: collect from all customers with unique sequential ticket IDs
        global_idx = 1
        for cust in customer_store.get_all_customers():
            for issue in cust.known_issues:
                ticket_items.append(
                    TicketItem(
                        id=f"TKT-2026-{global_idx:03d}",
                        customer_id=cust.id,
                        customer_name=cust.name,
                        subject=issue.title,
                        status=issue.status.capitalize(),
                        priority=issue.severity.capitalize(),
                        created_at=issue.reported_at or "Recently",
                        context=issue.context
                    )
                )
                global_idx += 1

    return ticket_items

@router.post("", response_model=TicketItem)
async def create_ticket(req: CreateTicketRequest, current_user: UserProfile = Depends(get_current_user)):
    if current_user.role != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only authenticated customers can create tickets.")

    cid = current_user.customer_id
    if not cid:
        name_slug = re.sub(r'[^a-zA-Z0-9]', '_', (current_user.name or 'customer').lower())
        cid = f"cust_{name_slug}_001"

    cust = customer_store.get_customer(cid)
    if not cust:
        cust = customer_store.restore_customer(cid, current_user.name, current_user.email)

    cust.open_tickets += 1
    cust.total_tickets += 1

    issue = KnownIssue(
        id=f"iss_{int(datetime.now().timestamp())}",
        title=req.subject,
        context=req.context or req.subject,
        status="open",
        severity=req.priority.lower() if req.priority else "medium",
        reported_at="Just now"
    )
    cust.known_issues.insert(0, issue)
    customer_store.save()

    return TicketItem(
        id=f"TKT-2026-{len(cust.known_issues):03d}",
        customer_id=cust.id,
        customer_name=cust.name,
        subject=issue.title,
        status="Open",
        priority=issue.severity.capitalize(),
        created_at=issue.reported_at or "Just now",
        context=issue.context
    )


@router.patch("/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: str,
    req: UpdateStatusRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Update ticket status (e.g. 'resolved' or 'open') and synchronize customer open_tickets.
    """
    clean_status = req.status.lower().strip()
    if clean_status not in ["open", "resolved", "closed"]:
        raise HTTPException(status_code=400, detail="Status must be 'open' or 'resolved'.")

    clean_id = ticket_id.lstrip("#").strip().lower()

    if current_user.role == "customer":
        cid = current_user.customer_id
        if not cid:
            name_slug = re.sub(r'[^a-zA-Z0-9]', '_', (current_user.name or 'customer').lower())
            cid = f"cust_{name_slug}_001"
        cust = customer_store.get_customer(cid)
        if not cust:
            cust = customer_store.restore_customer(cid, current_user.name, current_user.email)

        # Search within current customer's tickets
        for idx, issue in enumerate(cust.known_issues, 1):
            cur_id = f"tkt-2026-{idx:03d}"
            if cur_id == clean_id or issue.id.lower() == clean_id or issue.title.lower() == clean_id:
                issue.status = clean_status
                cust.open_tickets = sum(1 for i in cust.known_issues if i.status.lower() == "open")
                
                # Also synchronize any conversation with matching keywords
                for conv in customer_store._conversations.get(cust.id, []):
                    if any(w in conv.title.lower() for w in issue.title.lower().split() if len(w) > 3):
                        conv.status = clean_status

                customer_store.save()
                return {
                    "id": f"TKT-2026-{idx:03d}",
                    "customer_id": cust.id,
                    "subject": issue.title,
                    "status": issue.status.capitalize(),
                    "priority": issue.severity.capitalize()
                }

        # If not found yet, create or update as needed
        new_issue = KnownIssue(
            id=f"iss_{int(datetime.now().timestamp())}",
            title=ticket_id,
            context=f"Ticket {ticket_id}",
            status=clean_status,
            severity="medium",
            reported_at="Just now"
        )
        cust.known_issues.append(new_issue)
        cust.open_tickets = sum(1 for i in cust.known_issues if i.status.lower() == "open")
        customer_store.save()
        return {
            "id": ticket_id,
            "customer_id": cust.id,
            "subject": new_issue.title,
            "status": new_issue.status.capitalize(),
            "priority": "Medium"
        }

    # Admin: search all customers across unique sequential ticket IDs
    global_idx = 1
    for cust in customer_store.get_all_customers():
        for idx, issue in enumerate(cust.known_issues, 1):
            admin_cur_id = f"tkt-2026-{global_idx:03d}"
            cust_cur_id = f"tkt-2026-{idx:03d}"
            if (
                admin_cur_id == clean_id 
                or issue.id.lower() == clean_id 
                or issue.title.lower() == clean_id
                or (cust_cur_id == clean_id and cust.id == clean_id)
            ):
                issue.status = clean_status
                cust.open_tickets = sum(1 for i in cust.known_issues if i.status.lower() == "open")
                customer_store.save()
                return {
                    "id": f"TKT-2026-{global_idx:03d}",
                    "customer_id": cust.id,
                    "subject": issue.title,
                    "status": issue.status.capitalize(),
                    "priority": issue.severity.capitalize()
                }
            global_idx += 1

    raise HTTPException(status_code=404, detail="Ticket not found.")


