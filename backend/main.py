import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings, get_masked_key
from hindsight_service import hindsight_service
from routes.auth_routes import router as auth_router
from routes.customer_routes import router as customer_router
from routes.chat_routes import router as chat_router
from routes.conversation_routes import router as conversation_router
from routes.ticket_routes import router as ticket_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("supportmind.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    logger.info("==================================================")
    logger.info("SupportMind AI Customer Support Agent starting...")
    logger.info(f"Hindsight Endpoint: {settings.HINDSIGHT_BASE_URL}")
    logger.info(f"Hindsight Bank ID: {settings.HINDSIGHT_BANK_ID}")
    logger.info(f"Hindsight Key: {get_masked_key(settings.HINDSIGHT_API_KEY)}")
    logger.info(f"Groq Key: {get_masked_key(settings.GROQ_API_KEY)}")
    logger.info("==================================================")

    logger.info("[Startup] SupportMind memory engine ready. Memories will be dynamically retained per customer.")
    yield

    # Shutdown sequence
    logger.info("[Shutdown] Closing Hindsight client connections...")
    await hindsight_service.aclose()

app = FastAPI(
    title="SupportMind API",
    description="AI-Powered Customer Support Agent with Hindsight Long-Term Memory",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Frontend Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(conversation_router)
app.include_router(ticket_router)
app.include_router(chat_router)

@app.get("/api/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint reporting Hindsight and service status.
    Security: Never returns raw API keys.
    """
    return {
        "status": "healthy",
        "service": "SupportMind AI Customer Support Agent",
        "hindsight": {
            "connected": hindsight_service.is_available(),
            "base_url": settings.HINDSIGHT_BASE_URL,
            "bank_id": settings.HINDSIGHT_BANK_ID,
            "key_configured": bool(settings.HINDSIGHT_API_KEY)
        },
        "llm": {
            "model": settings.GROQ_MODEL,
            "key_configured": bool(settings.GROQ_API_KEY)
        },
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
