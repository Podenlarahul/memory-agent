from fastapi import APIRouter, HTTPException, status, Depends
from models import ChatRequest, ChatResponse, UserProfile
from auth import get_current_user, verify_customer_access
from agent import support_agent

router = APIRouter(prefix="/api/chat", tags=["Chat & Agent"])

@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, current_user: UserProfile = Depends(get_current_user)):
    """
    Core SupportMind Chat Endpoint.
    
    1. Validates customer and authorization.
    2. Recalls relevant memories from Hindsight Cloud.
    3. Generates memory-informed support response using LLM.
    4. Retains useful new contextual facts into Hindsight Cloud.
    5. Returns response with transparent memory audit trail.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty."
        )

    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot chat directly as a customer. Please inspect customer profiles from the Admin portal."
        )

    customer_id = current_user.customer_id
    if not customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer ID missing from authenticated session."
        )

    # Privacy verification: Customers cannot access another customer's chat
    verify_customer_access(current_user, customer_id)


    try:
        response = await support_agent.handle_customer_message(
            customer_id=customer_id,
            message=req.message.strip(),
            conversation_id=req.conversation_id
        )
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Support agent encountered an error processing message: {str(e)}"
        )
