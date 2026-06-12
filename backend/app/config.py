from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "JanSahayak AI"
    
    class Config:
        env_file = ".env"

settings = Settings()
