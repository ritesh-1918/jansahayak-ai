from pydantic import BaseModel
from typing import Optional, List


class UserProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    caste: Optional[str] = None
    has_land: Optional[bool] = None
    land_acres: Optional[float] = None
    family_size: Optional[int] = None
    education: Optional[str] = None
    location_type: Optional[str] = None  # rural / urban
    has_girl_child: Optional[bool] = None
    girl_child_age: Optional[int] = None
    is_student: Optional[bool] = None
    is_bpl: Optional[bool] = None


class ChatMessage(BaseModel):
    role: str  # user / assistant
    content: str


class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: str = "en"  # en / hi


class SchemeMatch(BaseModel):
    scheme_id: str
    name: str
    benefit: str
    why_eligible: str
    confidence: float
    documents_needed: List[str]
    apply_url: str


class ChatResponse(BaseModel):
    response: str
    schemes_matched: List[SchemeMatch] = []
    next_question: Optional[str] = None
    language: str = "en"
    provider_used: Optional[str] = None
