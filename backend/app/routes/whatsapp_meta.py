"""
Meta WhatsApp Cloud API webhook handler — free tier (1000 conv/month).

Setup:
1. Create Meta Developer App at developers.facebook.com
2. Add WhatsApp product → get Phone Number ID + Access Token
3. Set webhook URL: https://ritesh19180-janshayak-ai-backend.hf.space/meta/webhook
4. Set VERIFY_TOKEN to any string you choose (same in HF Secrets + Meta console)
5. Subscribe to "messages" field

HF Space secrets needed:
  META_ACCESS_TOKEN   — from Meta Developer console (temporary or permanent token)
  META_PHONE_NUMBER_ID — numeric ID of your WhatsApp phone number
  META_VERIFY_TOKEN   — any string you set (e.g. "jansahayak2024")
"""

import logging
import os

import httpx
from fastapi import APIRouter, Request, Response
from fastapi.responses import PlainTextResponse

from app.agents.janshayak import janshayak_agent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/meta")

META_API_URL = "https://graph.facebook.com/v19.0"


def _detect_language(text: str) -> str:
    for ch in text:
        if "ऀ" <= ch <= "ॿ":
            return "hi"
    hindi_hints = {"mai", "mera", "mere", "mujhe", "kisan", "gaon", "hai", "hoon", "kya", "nahi", "mein", "se"}
    if any(w in text.lower().split() for w in hindi_hints):
        return "hi"
    return "en"


async def _send_whatsapp_message(to: str, text: str) -> bool:
    """Call Meta Graph API to send a reply message."""
    access_token = os.environ.get("META_ACCESS_TOKEN", "")
    phone_number_id = os.environ.get("META_PHONE_NUMBER_ID", "")

    if not access_token or not phone_number_id:
        logger.error("META_ACCESS_TOKEN or META_PHONE_NUMBER_ID not set")
        return False

    url = f"{META_API_URL}/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text[:4096]},
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code != 200:
            logger.error("Meta send failed: %s %s", resp.status_code, resp.text[:200])
            return False
        return True


@router.get("/webhook")
async def meta_verify(request: Request):
    """Meta webhook verification challenge."""
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    expected = os.environ.get("META_VERIFY_TOKEN", "jansahayak2024")

    if mode == "subscribe" and token == expected:
        logger.info("Meta webhook verified")
        return PlainTextResponse(content=challenge)

    logger.warning("Meta webhook verification failed — token mismatch")
    return Response(status_code=403)


@router.post("/webhook")
async def meta_webhook(request: Request):
    """Receive incoming WhatsApp messages from Meta Cloud API."""
    try:
        data = await request.json()
    except Exception:
        return Response(status_code=400)

    # Parse the nested Meta payload
    try:
        entry = data.get("entry", [{}])[0]
        change = entry.get("changes", [{}])[0]
        value = change.get("value", {})
        messages = value.get("messages", [])

        if not messages:
            # Delivery status or other event — acknowledge and ignore
            return Response(status_code=200)

        msg = messages[0]
        if msg.get("type") != "text":
            # Voice/image etc — skip for now
            return Response(status_code=200)

        from_number = msg["from"]          # e.g. "919876543210"
        body = msg["text"]["body"].strip()

        logger.info("Meta WA from=%s body=%s", from_number, body[:80])

    except (KeyError, IndexError) as e:
        logger.warning("Could not parse Meta payload: %s", e)
        return Response(status_code=200)

    # Run through JanSahayak agentic loop
    session_id = f"meta_{from_number}"
    language = _detect_language(body)

    try:
        result = await janshayak_agent.chat(
            session_id=session_id,
            message=body,
            language=language,
        )

        # Format reply for WhatsApp readability
        reply_parts = [result.response]

        if result.schemes_matched:
            top = result.schemes_matched[:3]
            reply_parts.append(f"\n\n🏛 *{len(result.schemes_matched)} schemes found. Top {len(top)}:*")
            for s in top:
                docs = ", ".join(s.documents_needed[:3]) if s.documents_needed else "Aadhaar, Bank passbook"
                reply_parts.append(
                    f"\n✅ *{s.name}*\n"
                    f"   💰 {s.benefit}\n"
                    f"   📄 Docs: {docs}"
                )
            reply_parts.append("\n\nReply with a scheme name for full details and apply link.")

        if result.next_question:
            reply_parts.append(f"\n\n❓ {result.next_question}")

        reply = "".join(reply_parts)[:4000]

    except Exception:
        logger.exception("Agentic loop failed for %s", from_number)
        reply = (
            "Sorry, I ran into an issue. Please try again.\n"
            "क्षमा करें, कोई समस्या हुई। कृपया फिर कोशिश करें।"
        )

    await _send_whatsapp_message(from_number, reply)

    # Meta requires 200 OK quickly — reply is sent async above
    return Response(status_code=200)
