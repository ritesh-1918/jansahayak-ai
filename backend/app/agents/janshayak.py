"""
JanSahayak Agentic Loop using LangGraph

OBSERVE → REASON → ACT → VERIFY

Each turn goes through all 4 nodes. Across turns, profile accumulates in SQLite.
LLM provider fallback: Groq (1→2→3) → OpenRouter (1→2→3) → Gemini (1→2→3)
"""

import json
import logging
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Optional, TypedDict

from langgraph.graph import END, StateGraph

from app.agents.eligibility import eligibility_engine
from app.config import settings
from app.models.schemas import ChatResponse, SchemeMatch, UserProfile

logger = logging.getLogger(__name__)

SESSIONS_DB = str(Path(__file__).parent.parent.parent / "sessions.db")

# ---------------------------------------------------------------------------
# Session persistence (lightweight SQLite — no ORM)
# ---------------------------------------------------------------------------

def _init_sessions_db():
    conn = sqlite3.connect(SESSIONS_DB)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            profile    TEXT DEFAULT '{}',
            history    TEXT DEFAULT '[]',
            updated_at TEXT
        )
    """)
    conn.commit()
    conn.close()


def _get_session(session_id: str) -> dict:
    conn = sqlite3.connect(SESSIONS_DB)
    row = conn.execute(
        "SELECT profile, history FROM sessions WHERE session_id = ?", (session_id,)
    ).fetchone()
    conn.close()
    if row:
        return {"profile": json.loads(row[0]), "history": json.loads(row[1])}
    return {"profile": {}, "history": []}


def _save_session(session_id: str, profile: dict, history: list):
    conn = sqlite3.connect(SESSIONS_DB)
    conn.execute(
        "INSERT OR REPLACE INTO sessions (session_id, profile, history, updated_at) VALUES (?,?,?,?)",
        (session_id, json.dumps(profile), json.dumps(history[-20:]), datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# LLM provider fallback chain
# ---------------------------------------------------------------------------

GROQ_MODEL = "llama-3.1-8b-instant"
OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct:free"
GEMINI_MODEL = "gemini-1.5-flash"

PROFILE_EXTRACT_KEYS = [
    "age", "gender", "occupation", "annual_income", "state", "district",
    "caste", "has_land", "land_acres", "family_size", "education",
    "location_type", "has_girl_child", "girl_child_age", "is_student", "is_bpl",
]

REQUIRED_FOR_MATCHING = ["occupation", "annual_income", "age"]


async def _call_llm(messages: list, session_id: str = "") -> tuple[Optional[str], str]:
    """Try every available API key in order. Returns (text, provider_label)."""

    # --- Groq ---
    for i, key in enumerate(
        [settings.GROQ_API_KEY_1, settings.GROQ_API_KEY_2, settings.GROQ_API_KEY_3], start=1
    ):
        if not key:
            continue
        try:
            from langchain_groq import ChatGroq
            llm = ChatGroq(api_key=key, model=GROQ_MODEL, temperature=0, max_tokens=512)
            resp = await llm.ainvoke(messages)
            label = f"groq_key_{i}"
            logger.info("[%s] provider=%s", session_id, label)
            return resp.content, label
        except Exception as exc:
            logger.warning("Groq key %d failed: %s", i, exc)

    # --- OpenRouter ---
    for i, key in enumerate(
        [settings.OPENROUTER_API_KEY_1, settings.OPENROUTER_API_KEY_2, settings.OPENROUTER_API_KEY_3], start=1
    ):
        if not key:
            continue
        try:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(
                api_key=key,
                base_url="https://openrouter.ai/api/v1",
                model=OPENROUTER_MODEL,
                temperature=0,
                max_tokens=512,
            )
            resp = await llm.ainvoke(messages)
            label = f"openrouter_key_{i}"
            logger.info("[%s] provider=%s", session_id, label)
            return resp.content, label
        except Exception as exc:
            logger.warning("OpenRouter key %d failed: %s", i, exc)

    # --- Gemini ---
    for i, key in enumerate(
        [settings.GEMINI_API_KEY_1, settings.GEMINI_API_KEY_2, settings.GEMINI_API_KEY_3], start=1
    ):
        if not key:
            continue
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(
                google_api_key=key, model=GEMINI_MODEL, temperature=0
            )
            resp = await llm.ainvoke(messages)
            label = f"gemini_key_{i}"
            logger.info("[%s] provider=%s", session_id, label)
            return resp.content, label
        except Exception as exc:
            logger.warning("Gemini key %d failed: %s", i, exc)

    logger.error("[%s] All LLM providers exhausted", session_id)
    return None, "none"


# ---------------------------------------------------------------------------
# LangGraph state
# ---------------------------------------------------------------------------

class AgentState(TypedDict):
    session_id: str
    user_message: str
    language: str
    profile: dict
    history: list
    schemes_matched: list
    next_question: Optional[str]
    response: str
    provider_used: str


# ---------------------------------------------------------------------------
# Graph nodes
# ---------------------------------------------------------------------------

async def observe(state: AgentState) -> AgentState:
    """Extract / update user profile fields from the latest message."""
    msg = state["user_message"]
    profile = dict(state["profile"])

    extract_prompt = f"""You are extracting structured profile data from a user message.

Message: "{msg}"

Extract any of these fields if mentioned (return ONLY valid JSON, no explanation):
age (integer), gender (male/female/other), occupation (farmer/student/worker/self-employed/unemployed/other),
annual_income (number in rupees), state (Indian state name), district, caste (SC/ST/OBC/General/EWS),
has_land (true/false), land_acres (number), family_size (integer), education,
location_type (rural/urban), has_girl_child (true/false), girl_child_age (integer),
is_student (true/false), is_bpl (true/false).

Return only the fields that are clearly mentioned. Return {{}} if nothing found.
JSON only:"""

    messages = [{"role": "user", "content": extract_prompt}]
    text, provider = await _call_llm(messages, state["session_id"])

    if text:
        try:
            # Strip markdown code fences if present
            cleaned = text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
            extracted = json.loads(cleaned)
            if isinstance(extracted, dict):
                for k in PROFILE_EXTRACT_KEYS:
                    if k in extracted and extracted[k] is not None:
                        profile[k] = extracted[k]
        except json.JSONDecodeError:
            # LLM returned something non-JSON — skip extraction
            logger.debug("Profile extraction parse error; raw=%s", text[:200])
    else:
        # Rule-based fallback extraction for key demo case
        msg_lower = msg.lower()
        if "farmer" in msg_lower or "kisan" in msg_lower:
            profile.setdefault("occupation", "farmer")
        if "bihar" in msg_lower:
            profile.setdefault("state", "Bihar")
            profile.setdefault("location_type", "rural")
        if "acres" in msg_lower or "acre" in msg_lower:
            profile.setdefault("has_land", True)
            import re
            m = re.search(r"(\d+(?:\.\d+)?)\s*acres?", msg_lower)
            if m:
                profile.setdefault("land_acres", float(m.group(1)))
        income_patterns = [r"income\s+(?:of\s+)?(?:rs\.?\s*)?(\d+)", r"(\d+)\s*(?:per\s+year|annual|pa)"]
        import re
        for pat in income_patterns:
            m = re.search(pat, msg_lower)
            if m:
                profile.setdefault("annual_income", float(m.group(1)))
                break

    return {**state, "profile": profile, "provider_used": provider}


async def reason(state: AgentState) -> AgentState:
    """Run eligibility engine against all schemes."""
    try:
        user_profile = UserProfile(**{k: state["profile"].get(k) for k in UserProfile.model_fields})
        matches = eligibility_engine.match_schemes(user_profile)
        schemes_data = [m.model_dump() for m in matches]
    except Exception as e:
        logger.error("Eligibility engine error: %s", e)
        schemes_data = []
    return {**state, "schemes_matched": schemes_data}


async def act(state: AgentState) -> AgentState:
    """Generate a natural language response using matched schemes."""
    lang = state["language"]
    matches = state["schemes_matched"]
    profile = state["profile"]
    history = state["history"]

    if matches:
        top_matches = matches[:3]
        scheme_summary = "\n".join(
            f"- {m['name']}: {m['benefit']} (why: {m['why_eligible']})"
            for m in top_matches
        )
    else:
        scheme_summary = "No schemes found yet with the provided information."

    profile_summary = ", ".join(f"{k}={v}" for k, v in profile.items() if v is not None)

    if lang == "hi":
        system = (
            "आप JanSahayak AI हैं — भारत के गरीब नागरिकों को सरकारी योजनाएं खोजने में मदद करने वाले एक AI एजेंट।\n"
            "हिंदी में सरल और स्पष्ट भाषा में जवाब दें।\n"
            "यदि योजनाएं मिली हैं, तो उन्हें स्पष्ट रूप से बताएं और दस्तावेज़ों की सूची दें।"
        )
        user_content = (
            f"उपयोगकर्ता प्रोफ़ाइल: {profile_summary or 'अभी तक पूरी नहीं'}\n\n"
            f"मिली योजनाएं:\n{scheme_summary}\n\n"
            f"उपयोगकर्ता का संदेश: {state['user_message']}\n\n"
            "उपयोगकर्ता को हिंदी में जवाब दें। योजनाओं के बारे में बताएं और अगला कदम समझाएं।"
        )
    else:
        system = (
            "You are JanSahayak AI — an autonomous welfare navigator for rural India.\n"
            "You help citizens discover and apply for government schemes they are eligible for.\n"
            "Be warm, clear, and practical. Always mention scheme benefits and required documents."
        )
        user_content = (
            f"User profile: {profile_summary or 'incomplete so far'}\n\n"
            f"Matched schemes:\n{scheme_summary}\n\n"
            f"User message: {state['user_message']}\n\n"
            "Respond helpfully. If schemes were found, explain each clearly with benefits and docs needed."
        )

    history_msgs = [{"role": m["role"], "content": m["content"]} for m in history[-6:]]
    messages = [{"role": "system", "content": system}] + history_msgs + [{"role": "user", "content": user_content}]

    text, provider = await _call_llm(messages, state["session_id"])

    if not text:
        if lang == "hi":
            text = "क्षमा करें, अभी AI सेवा उपलब्ध नहीं है। आपकी प्रोफ़ाइल सहेज ली गई है।"
        else:
            text = "Sorry, the AI service is temporarily unavailable. Your profile has been saved — please try again shortly."

    provider_used = provider if provider != "none" else state.get("provider_used", "none")
    return {**state, "response": text, "provider_used": provider_used}


async def verify(state: AgentState) -> AgentState:
    """Check profile completeness and set next_question if critical fields are missing."""
    profile = state["profile"]
    lang = state["language"]

    missing = [f for f in REQUIRED_FOR_MATCHING if not profile.get(f)]
    next_q = None

    if missing:
        field = missing[0]
        questions = {
            "occupation": {
                "en": "Could you tell me your occupation? (e.g., farmer, student, worker, self-employed)",
                "hi": "आप क्या काम करते हैं? (जैसे किसान, छात्र, मजदूर, व्यापारी)",
            },
            "annual_income": {
                "en": "What is your approximate annual household income in rupees?",
                "hi": "आपकी सालाना आमदनी कितनी है? (रुपये में बताएं)",
            },
            "age": {
                "en": "How old are you?",
                "hi": "आपकी उम्र कितनी है?",
            },
        }
        next_q = questions.get(field, {}).get(lang, questions.get(field, {}).get("en"))

    return {**state, "next_question": next_q}


# ---------------------------------------------------------------------------
# Build the graph
# ---------------------------------------------------------------------------

_graph_builder = StateGraph(AgentState)
_graph_builder.add_node("observe", observe)
_graph_builder.add_node("reason", reason)
_graph_builder.add_node("act", act)
_graph_builder.add_node("verify", verify)

_graph_builder.set_entry_point("observe")
_graph_builder.add_edge("observe", "reason")
_graph_builder.add_edge("reason", "act")
_graph_builder.add_edge("act", "verify")
_graph_builder.add_edge("verify", END)

_agent_graph = _graph_builder.compile()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

class JanshayakAgent:
    def __init__(self):
        _init_sessions_db()

    async def chat(self, session_id: str, message: str, language: str = "en") -> ChatResponse:
        session = _get_session(session_id)
        profile = session["profile"]
        history = session["history"]

        initial_state: AgentState = {
            "session_id": session_id,
            "user_message": message,
            "language": language,
            "profile": profile,
            "history": history,
            "schemes_matched": [],
            "next_question": None,
            "response": "",
            "provider_used": "none",
        }

        final_state: AgentState = await _agent_graph.ainvoke(initial_state)

        # Persist updated session
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": final_state["response"]})
        _save_session(session_id, final_state["profile"], history)

        schemes = [SchemeMatch(**s) for s in final_state["schemes_matched"]]

        return ChatResponse(
            response=final_state["response"],
            schemes_matched=schemes,
            next_question=final_state["next_question"],
            language=language,
            provider_used=final_state["provider_used"],
        )


# Singleton
janshayak_agent = JanshayakAgent()
