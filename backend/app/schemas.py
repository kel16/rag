from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="The question to ask about the loaded document.",
        examples=["What is the main topic of this document?"],
    )
    top_k: int = Field(
        default=3,
        ge=1,
        le=10,
        description="How many source chunks to retrieve and use as context.",
    )


class SourceChunk(BaseModel):
    text: str = Field(description="The retrieved text passage.")
    source: str = Field(description="Filename of the document this passage came from.")


class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: list[SourceChunk] = Field(
        description="The retrieved passages the answer was grounded in, with their source document."
    )
    timings_ms: dict[str, float] = Field(
        description="Per-stage latency in milliseconds: retrieval, generation, total."
    )


class HealthResponse(BaseModel):
    status: str
    chunks_loaded: int
    documents: list[str]
