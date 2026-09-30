import logging
from typing import List, Dict, Any, Optional
from hindsight_client import Hindsight
from config import settings, get_masked_key

logger = logging.getLogger("supportmind.hindsight")
logger.setLevel(logging.INFO)

class HindsightService:
    def __init__(self):
        self._client: Optional[Hindsight] = None
        self._initialized = False
        self._init_client()

    def _init_client(self):
        if not settings.HINDSIGHT_API_KEY:
            logger.warning("[HindsightService] HINDSIGHT_API_KEY is not set. Memory service will operate in fallback mode.")
            return

        try:
            self._client = Hindsight(
                base_url=settings.HINDSIGHT_BASE_URL,
                api_key=settings.HINDSIGHT_API_KEY,
                timeout=60.0
            )
            self._initialized = True
            logger.info(f"[HindsightService] Initialized Hindsight client at {settings.HINDSIGHT_BASE_URL} (Key: {get_masked_key(settings.HINDSIGHT_API_KEY)})")
        except Exception as e:
            logger.error(f"[HindsightService] Failed to initialize Hindsight client: {e}")
            self._initialized = False

    def is_available(self) -> bool:
        return self._initialized and self._client is not None

    def get_bank_id_for_customer(self, customer_id: str) -> str:
        """
        Enforce strict customer isolation by assigning a dedicated bank_id per customer.
        Example: 'SupportMind-cust_rahul_sharma'
        """
        clean_id = customer_id.replace(" ", "_").lower()
        return f"{settings.HINDSIGHT_BANK_ID}-{clean_id}"

    async def retain_memory(
        self,
        customer_id: str,
        content: str,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Retain important new customer support context into Hindsight asynchronously.
        """
        if not self.is_available():
            logger.warning(f"[HindsightService] Retain skipped (service unavailable) for customer {customer_id}")
            return False

        bank_id = self.get_bank_id_for_customer(customer_id)
        combined_tags = [f"customer:{customer_id}"]
        if tags:
            combined_tags.extend(tags)

        clean_metadata = metadata or {}
        clean_metadata["customer_id"] = customer_id

        try:
            response = await self._client.aretain(
                bank_id=bank_id,
                content=content,
                tags=combined_tags,
                metadata=clean_metadata
            )
            logger.info(f"[HindsightService] Successfully retained memory for {customer_id} in bank {bank_id}")
            return getattr(response, "success", True)
        except Exception as e:
            logger.error(f"[HindsightService] Error retaining memory for customer {customer_id}: {e}")
            return False

    async def recall_memories(
        self,
        customer_id: str,
        query: str,
        max_tokens: int = 4096
    ) -> List[Dict[str, Any]]:
        """
        Recall relevant memories for a specific customer from their isolated Hindsight bank asynchronously.
        """
        if not self.is_available():
            logger.warning(f"[HindsightService] Recall skipped (service unavailable) for customer {customer_id}")
            return []

        bank_id = self.get_bank_id_for_customer(customer_id)
        try:
            response = await self._client.arecall(
                bank_id=bank_id,
                query=query,
                tags=[f"customer:{customer_id}"],
                tags_match="any",
                max_tokens=max_tokens
            )

            results: List[Dict[str, Any]] = []
            if hasattr(response, "results") and response.results:
                for item in response.results:
                    text = getattr(item, "content", None) or getattr(item, "text", None) or str(item)
                    results.append({
                        "id": getattr(item, "id", ""),
                        "text": text,
                        "type": getattr(item, "type", "observation"),
                        "entities": getattr(item, "entities", ""),
                        "tags": getattr(item, "tags", []),
                        "score": getattr(item, "score", None)
                    })
            elif hasattr(response, "memories") and response.memories:
                for item in response.memories:
                    results.append({
                        "id": getattr(item, "id", ""),
                        "text": str(item),
                        "type": "observation",
                        "entities": "",
                        "tags": [],
                        "score": None
                    })
            
            logger.info(f"[HindsightService] Recalled {len(results)} memory items for {customer_id}")
            return results
        except Exception as e:
            logger.error(f"[HindsightService] Error recalling memories for customer {customer_id}: {e}")
            return []

    async def list_customer_memories(self, customer_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve all stored memories for a customer from Hindsight for Support Agent visualization asynchronously.
        """
        if not self.is_available():
            return []

        bank_id = self.get_bank_id_for_customer(customer_id)
        try:
            res = await self._client.alist_memories(bank_id=bank_id)
            items = getattr(res, "items", [])
            output = []
            for item in items:
                output.append({
                    "id": getattr(item, "id", ""),
                    "text": getattr(item, "text", ""),
                    "type": getattr(item, "fact_type", "observation"),
                    "entities": getattr(item, "entities", ""),
                    "tags": getattr(item, "tags", []),
                    "timestamp": getattr(item, "mentioned_at", None) or getattr(item, "occurred_start", None)
                })
            return output
        except Exception as e:
            logger.error(f"[HindsightService] Error listing memories for customer {customer_id}: {e}")
            return []

    async def reflect_memories(self, customer_id: str, query: str) -> Optional[str]:
        """
        Synthesize an answer directly using Hindsight's reflect capability asynchronously.
        """
        if not self.is_available():
            return None

        bank_id = self.get_bank_id_for_customer(customer_id)
        try:
            res = await self._client.areflect(bank_id=bank_id, query=query)
            return getattr(res, "text", None)
        except Exception as e:
            logger.error(f"[HindsightService] Error reflecting for customer {customer_id}: {e}")
            return None

    async def aclose(self):
        if self._client and hasattr(self._client, "aclose"):
            try:
                await self._client.aclose()
            except Exception:
                pass

hindsight_service = HindsightService()
