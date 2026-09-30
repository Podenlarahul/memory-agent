import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from models import ChatResponse, ChatMessage, Customer
from customer_store import customer_store
from hindsight_service import hindsight_service
from llm_service import llm_service

logger = logging.getLogger("supportmind.agent")
logger.setLevel(logging.INFO)

class SupportMindAgent:
    def __init__(self):
        pass

    async def handle_customer_message(
        self,
        customer_id: str,
        message: str,
        conversation_id: Optional[str] = None
    ) -> ChatResponse:
        """
        Full SupportMind AI Customer Support Agent workflow with Hindsight Long-Term Memory.
        
        Workflow:
        1. Identify Customer & load profile
        2. Recall relevant memories from customer's isolated Hindsight bank
        3. Combine message + recalled memories + profile + support knowledge
        4. Generate personalized LLM response
        5. Extract useful new facts/context
        6. Retain useful new memory in Hindsight
        7. Persist to conversation store & return response
        """
        # Step 1: Identify Customer
        customer: Optional[Customer] = customer_store.get_customer(customer_id)
        customer_name = customer.name if customer else "Valued Customer"
        customer_profile = customer.model_dump() if customer else {"device": "Unknown", "company": "General"}

        # Step 2: Recall relevant memories from Hindsight
        logger.info(f"[SupportMindAgent] Recalling Hindsight memories for customer {customer_id} on query '{message}'")
        recalled_memories = await hindsight_service.recall_memories(
            customer_id=customer_id,
            query=message,
            max_tokens=4096
        )

        # Format memories for transparency and tracking (strictly genuine recalled memories)
        memories_used_strings: List[str] = []
        for mem in recalled_memories:
            text = mem.get("text", "")
            if text and text not in memories_used_strings:
                memories_used_strings.append(text)


        # Step 3 & 4: Get conversation history and generate LLM response
        conv = (
            customer_store.get_or_create_active_conversation(customer_id)
            if not conversation_id
            else next((c for c in customer_store.get_conversations(customer_id) if c.id == conversation_id),
                      customer_store.get_or_create_active_conversation(customer_id))
        )
        
        history_msgs = [m.model_dump() for m in conv.messages]

        ai_response_text = llm_service.generate_response(
            customer_name=customer_name,
            customer_profile=customer_profile,
            memories=recalled_memories,
            conversation_history=history_msgs,
            current_message=message
        )

        # Step 5 & 6: Extract useful new facts and retain in Hindsight
        retained_info_text: Optional[str] = None
        extracted_facts = llm_service.extract_memorable_facts(
            customer_name=customer_name,
            message=message,
            current_profile=customer_profile
        )

        if extracted_facts:
            retained_info_text = extracted_facts["content"]
            logger.info(f"[SupportMindAgent] Retaining extracted facts into Hindsight: {retained_info_text}")
            await hindsight_service.retain_memory(
                customer_id=customer_id,
                content=extracted_facts["content"],
                tags=extracted_facts.get("tags", []),
                metadata={"category": extracted_facts.get("category", "general")}
            )
            # Update customer store model
            customer_store.update_customer_from_memory(customer_id, extracted_facts)

        # Step 7: Check if issue is resolved and record messages in conversation
        msg_lower = message.lower()
        if any(w in msg_lower for w in ["solved", "resolved", "fixed now", "is fixed", "was fixed", "worked perfectly", "working fine now", "issue was solved", "problem solved"]):
            conv.status = "resolved"
            if customer:
                for issue in customer.known_issues:
                    if issue.status == "open":
                        issue.status = "resolved"
                        break
                if customer.open_tickets > 0:
                    customer.open_tickets -= 1

        now_time = datetime.now().strftime("%I:%M %p")
        user_msg = ChatMessage(
            id=f"msg_{customer_id}_usr_{int(datetime.now().timestamp() * 1000)}",
            sender="customer",
            sender_name=customer_name,
            message=message,
            timestamp=now_time
        )
        customer_store.add_message_to_conversation(customer_id, conv.id, user_msg)

        ai_msg = ChatMessage(
            id=f"msg_{customer_id}_ai_{int(datetime.now().timestamp() * 1000) + 1}",
            sender="ai",
            sender_name="SupportMind AI",
            message=ai_response_text,
            timestamp=now_time,
            memories_used=memories_used_strings
        )
        customer_store.add_message_to_conversation(customer_id, conv.id, ai_msg)

        return ChatResponse(
            response=ai_response_text,
            memories_used=memories_used_strings,
            customer_id=customer_id,
            conversation_id=conv.id,
            timestamp=now_time,
            retained_info=retained_info_text
        )

support_agent = SupportMindAgent()
