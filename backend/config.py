import os

class Settings:
    APP_NAME = "GuardGen MVP"
    VERSION = "0.1.0"

    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./guardgen.db")

    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral:latest")

    CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")

    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

settings = Settings()

