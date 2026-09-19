from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Documents / indexing --------------------------------------------
    docs_path: str
    persist_dir: str
    collection_name: str

    # --- Embeddings ---------------------------------------------------------
    embedding_model: str

    # --- Chunking -------------------------------------------------------
    chunk_size: int
    chunk_overlap: int

    # --- Retrieval ------------------------------------------------------
    default_top_k: int

    # --- LLM (via LiteLLM / Ollama) --------------------------------------
    llm_model: str
    ollama_api_base: str
    llm_timeout_seconds: int

    # --- API --------------------------------------------------------------
    cors_origins: list[str]
    log_level: str


settings = Settings()
print(settings)
