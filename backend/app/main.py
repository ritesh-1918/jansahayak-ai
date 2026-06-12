from fastapi import FastAPI
from app.routes.health import router as health_router

app = FastAPI(title="JanSahayak AI Backend")

app.include_router(health_router)

@app.get("/")
async def root():
    return {"message": "Welcome to JanSahayak AI API"}
