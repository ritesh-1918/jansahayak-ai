import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.database import init_db
from app.routes import health, chat, whatsapp

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="JanSahayak AI Backend",
    description="Autonomous welfare scheme navigator for rural India",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router)
app.include_router(whatsapp.router)


@app.on_event("startup")
async def startup():
    init_db()
    logging.getLogger(__name__).info("JanSahayak AI backend started — DB initialised")


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "janshayak-ai",
        "version": "2.0.0",
        "endpoints": ["/chat", "/whatsapp/webhook", "/health"],
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
