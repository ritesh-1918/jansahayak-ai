import logging

from fastapi import APIRouter, HTTPException

from app.agents.janshayak import janshayak_agent
from app.models.schemas import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main chat endpoint.

    Body: { session_id, message, language }
    Returns: { response, schemes_matched, next_question, language, provider_used }
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    language = request.language if request.language in ("en", "hi") else "en"

    try:
        result = await janshayak_agent.chat(
            session_id=request.session_id,
            message=request.message,
            language=language,
        )
        return result
    except Exception as exc:
        logger.exception("Chat endpoint error for session %s", request.session_id)
        raise HTTPException(status_code=500, detail=str(exc))
