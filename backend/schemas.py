from pydantic import BaseModel
from typing import List

class SessionCreate(BaseModel):
    topic: str


class ResearchSearchRequest(BaseModel):
    session_id: int
    query: str


class DraftGenerateRequest(BaseModel):
    session_id: int
    research_question: str


class StylizeRequest(BaseModel):
    session_id: int
    text: str