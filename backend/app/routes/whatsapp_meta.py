"""
Meta WhatsApp Cloud API webhook handler — free tier (1000 conv/month).

Webhook URL:  https://ritesh19180-janshayak-ai-backend.hf.space/meta/webhook
Verify Token: jansahayak2024

HF Space secrets required:
  META_ACCESS_TOKEN      — from Meta Developer console
  META_PHONE_NUMBER_ID   — numeric ID shown in console (1182653424928689)
  META_VERIFY_TOKEN      — jansahayak2024
"""

import logging
import os

import httpx
from fastapi import APIRouter, BackgroundTasks, Request, Response
from fastapi.responses import PlainTextResponse

from app.agents.janshayak import janshayak_agent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/meta")

META_API_URL = "https://graph.facebook.com/v19.0"


# ── helpers ──────────────────────────────────────────────────────────────────

def _detect_language(text: str) -> str:
    for ch in text:
        if "ऀ" <= ch <= "ॿ":
            return "hi"
    hindi_hints = {"mai", "mera", "mere", "mujhe", "kisan", "gaon",
                   "hai", "hoon", "kya", "nahi", "mein", "se", "ka", "ki"}
    if any(w in text.lower().split() for w in hindi_hints):
        return "hi"
    return "en"


async def _send_reply(to: str, text: str) -> None:
    token = os.environ.get("META_ACCESS_TOKEN", "")
    phone_id = os.environ.get("META_PHONE_NUMBER_ID", "")
    if not token or not phone_id:
        logger.error("META credentials not set in env — cannot send reply")
        return
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{META_API_URL}/{phone_id}/messages",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={
                    "messaging_product": "whatsapp",
                    "to": to,
                    "type": "text",
                    "text": {"body": text[:4096]},
                },
            )
            if resp.status_code != 200:
                logger.error("Meta send failed %s: %s", resp.status_code, resp.text[:300])
    except Exception:
        logger.exception("_send_reply HTTP error to %s", to)


async def _process_message(from_number: str, body: str) -> None:
    """Run agentic loop and send reply — called from background task."""
    try:
        language = _detect_language(body)
        session_id = f"meta_{from_number}"

        result = await janshayak_agent.chat(
            session_id=session_id,
            message=body,
            language=language,
        )

        parts = [result.response]

        if result.schemes_matched:
            top = result.schemes_matched[:3]
            parts.append(f"\n\n🏛 *{len(result.schemes_matched)} schemes found. Top {len(top)}:*")
            for s in top:
                docs = ", ".join(s.documents_needed[:3]) if s.documents_needed else "Aadhaar, Bank passbook"
                parts.append(
                    f"\n\n✅ *{s.name}*\n"
                    f"   💰 {s.benefit}\n"
                    f"   📄 Docs: {docs}"
                )
            parts.append("\n\nReply with a scheme name for full details & apply link.")

        if result.next_question:
            parts.append(f"\n\n❓ {result.next_question}")

        reply = "".join(parts)[:4000]

    except Exception:
        logger.exception("Agent error for %s", from_number)
        reply = (
            "Sorry, I ran into a problem. Please try again in a moment.\n"
            "क्षमा करें, कोई समस्या हुई। थोड़ी देर बाद कोशिश करें।"
        )

    await _send_reply(from_number, reply)


# ── routes ────────────────────────────────────────────────────────────────────

@router.get("/debug")
async def debug():
    """Health check — shows which env vars are set and tests the agent."""
    token = os.environ.get("META_ACCESS_TOKEN", "")
    phone_id = os.environ.get("META_PHONE_NUMBER_ID", "")
    verify_token = os.environ.get("META_VERIFY_TOKEN", "")
    groq_key = os.environ.get("GROQ_API_KEY_1", "") or os.environ.get("GROQ_API_KEY", "")

    checks = {
        "META_ACCESS_TOKEN": f"set ({len(token)} chars)" if token else "MISSING",
        "META_PHONE_NUMBER_ID": phone_id if phone_id else "MISSING",
        "META_VERIFY_TOKEN": verify_token if verify_token else "MISSING",
        "GROQ_API_KEY": f"set ({len(groq_key)} chars)" if groq_key else "MISSING",
    }

    # Test outbound connectivity first
    outbound_ok = False
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get("https://graph.facebook.com/")
            outbound_ok = r.status_code in (200, 400, 404)  # any response = internet works
    except Exception:
        outbound_ok = False

    # Test Meta API connectivity
    meta_ok = False
    meta_status = None
    meta_error = ""
    if token and phone_id:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    f"{META_API_URL}/{phone_id}?fields=display_phone_number,verified_name",
                    headers={"Authorization": f"Bearer {token}"},
                )
                meta_status = resp.status_code
                meta_ok = resp.status_code == 200
                meta_error = resp.text[:400]
        except Exception as e:
            meta_error = str(e)

    # Test agent
    agent_ok = False
    agent_error = ""
    try:
        result = await janshayak_agent.chat(
            session_id="debug_test",
            message="hello",
            language="en",
        )
        agent_ok = bool(result.response)
    except Exception as e:
        agent_error = str(e)[:300]

    return {
        "env": checks,
        "outbound_internet": outbound_ok,
        "meta_api_reachable": meta_ok,
        "meta_api_http_status": meta_status,
        "meta_api_response": meta_error,
        "agent_ok": agent_ok,
        "agent_error": agent_error,
        "diagnosis": (
            "TOKEN_EXPIRED — regenerate META_ACCESS_TOKEN in HF Spaces secrets"
            if meta_status in (400, 401, 403) else
            "NETWORK_BLOCKED — HF Spaces cannot reach graph.facebook.com"
            if outbound_ok and not meta_ok else
            "ALL_OK" if meta_ok else
            "UNKNOWN"
        ),
    }


@router.get("/webhook")
async def verify(request: Request):
    """Meta webhook verification challenge (called once during setup)."""
    p = request.query_params
    if p.get("hub.mode") == "subscribe" and \
       p.get("hub.verify_token") == os.environ.get("META_VERIFY_TOKEN", "jansahayak2024"):
        logger.info("Meta webhook verified OK")
        return PlainTextResponse(p.get("hub.challenge", ""))
    return Response(status_code=403)


@router.post("/webhook")
async def webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Receive WhatsApp messages from Meta.
    Returns 200 immediately — agent runs in background to avoid Meta timeout.
    """
    try:
        data = await request.json()
    except Exception:
        return Response(status_code=200)   # malformed body — ack and ignore

    try:
        value = data["entry"][0]["changes"][0]["value"]
        messages = value.get("messages", [])

        if not messages:
            return Response(status_code=200)  # delivery receipt / status update

        msg = messages[0]
        if msg.get("type") != "text":
            return Response(status_code=200)  # image / audio / etc — skip

        from_number: str = msg["from"]
        body: str = msg["text"]["body"].strip()
        logger.info("WhatsApp in from=%s: %s", from_number, body[:80])

    except Exception as exc:
        logger.warning("Payload parse error: %s", exc)
        return Response(status_code=200)

    # ← return 200 to Meta RIGHT NOW, then process asynchronously
    background_tasks.add_task(_process_message, from_number, body)
    return Response(status_code=200)
