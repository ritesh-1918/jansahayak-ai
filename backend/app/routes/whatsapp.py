"""
Twilio WhatsApp Sandbox webhook handler.

Configure the Twilio sandbox webhook URL as:
  https://<your-host>/whatsapp/webhook

Twilio sends POST with form fields: From, Body, MessageSid, etc.
We reply with TwiML XML.
"""

import logging
import uuid

from fastapi import APIRouter, Form, Request, Response

from app.agents.janshayak import janshayak_agent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/whatsapp")


def _twiml_reply(message: str) -> Response:
    body = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{message}</Message>
</Response>"""
    return Response(content=body, media_type="application/xml")


def _detect_language(text: str) -> str:
    """Detect Hindi vs English by checking for Devanagari script."""
    for ch in text:
        if "ऀ" <= ch <= "ॿ":
            return "hi"
    hindi_words = {"mai", "mera", "mere", "mujhe", "kisan", "gaon", "hai", "hoon", "kya", "nahi"}
    if any(w in text.lower().split() for w in hindi_words):
        return "hi"
    return "en"


@router.post("/webhook")
async def whatsapp_webhook(
    request: Request,
    From: str = Form(default=""),
    Body: str = Form(default=""),
    MessageSid: str = Form(default=""),
):
    """Receive incoming WhatsApp messages and reply via TwiML."""
    logger.info("WhatsApp message from=%s sid=%s body=%s", From, MessageSid, Body[:80])

    if not Body.strip():
        return _twiml_reply("Hello! I am JanSahayak AI. How can I help you find government schemes?")

    # Use phone number as session ID for WhatsApp (stable across turns)
    session_id = f"wa_{From.replace('+', '').replace(':', '_')}"
    language = _detect_language(Body)

    try:
        result = await janshayak_agent.chat(
            session_id=session_id,
            message=Body,
            language=language,
        )

        # Build reply — trim to 1600 chars (WhatsApp limit)
        reply = result.response
        if result.schemes_matched:
            scheme_lines = []
            for s in result.schemes_matched[:2]:
                scheme_lines.append(f"\n✅ *{s.name}*\n  Benefit: {s.benefit}\n  Docs: {', '.join(s.documents_needed[:2])}")
            reply += "\n\n*Schemes found for you:*" + "".join(scheme_lines)

        if result.next_question:
            reply += f"\n\n❓ {result.next_question}"

        reply = reply[:1580]
        return _twiml_reply(reply)

    except Exception as exc:
        logger.exception("WhatsApp webhook error for %s", From)
        return _twiml_reply(
            "Sorry, I encountered an issue. Please try again. | "
            "क्षमा करें, कोई समस्या हुई। कृपया फिर कोशिश करें।"
        )
