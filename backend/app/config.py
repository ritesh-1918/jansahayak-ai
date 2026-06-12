from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "JanSahayak AI"
    DATABASE_URL: str = "sqlite:///./jansahayak.db"

    # Groq API keys (try 1 → 2 → 3)
    GROQ_API_KEY_1: Optional[str] = None
    GROQ_API_KEY_2: Optional[str] = None
    GROQ_API_KEY_3: Optional[str] = None

    # OpenRouter API keys (fallback after Groq)
    OPENROUTER_API_KEY_1: Optional[str] = None
    OPENROUTER_API_KEY_2: Optional[str] = None
    OPENROUTER_API_KEY_3: Optional[str] = None

    # Gemini API keys (final fallback)
    GEMINI_API_KEY_1: Optional[str] = None
    GEMINI_API_KEY_2: Optional[str] = None
    GEMINI_API_KEY_3: Optional[str] = None

    # Twilio
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238871"

    # Bhashini multilingual voice
    BHASHINI_API_KEY: Optional[str] = None

    # Legacy — kept for backward compatibility
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    HUGGINGFACE_API_KEY: Optional[str] = None
    HUGGINGFACE_MODEL: str = "meta-llama/Llama-3.2-1B-Instruct"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
