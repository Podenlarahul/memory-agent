from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AuthUser(BaseModel):
    id: str
    email: str
    name: str
    role: str # "admin" or "customer"
    customer_id: Optional[str] = None
    device: Optional[str] = None
    company: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token: Optional[str] = None # Convenient alias for client compatibility
    token_type: str = "bearer"
    role: str # "admin" or "customer"
    user_id: str
    name: str
    email: str
    customer_id: Optional[str] = None
    user: Optional[AuthUser] = None


class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    device: Optional[str] = "Laptop"
    company: Optional[str] = "Personal"

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str # "admin" or "customer"
    customer_id: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    device: Optional[str] = None

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    device: Optional[str] = None

class KnownIssue(BaseModel):
    id: Optional[str] = None
    title: str
    context: Optional[str] = None
    status: str = "open" # "open", "in_progress", "resolved"
    severity: str = "medium" # "low", "medium", "high"
    reported_at: Optional[str] = None

class SolutionRecord(BaseModel):
    title: str
    note: str
    date: str
    successful: bool = True

class Customer(BaseModel):
    id: str
    name: str
    email: str
    company: str = "Personal"
    device: str = "Laptop"
    location: str = "Remote"
    phone: str = "+91 98765-43210"
    plan: str = "Standard Support"
    total_tickets: int = 0
    open_tickets: int = 0
    status: str = "active" # "active", "waiting", "resolved"
    avatar: str = "CU"
    member_since: str = "September 2024"
    last_active: str = "Just now"
    known_issues: List[KnownIssue] = []
    solutions_worked: List[SolutionRecord] = []
    solutions_failed: List[SolutionRecord] = []
    preferences: List[str] = []

class MemoryItem(BaseModel):
    id: str
    text: str
    type: str = "observation" # "observation", "world", "directive"
    entities: Optional[str] = None
    tags: List[str] = []
    timestamp: Optional[str] = None
    relevance_score: Optional[float] = None

class CustomerMemoryView(BaseModel):
    customer_id: str
    customer_name: str
    bank_id: str
    total_memories: int
    memories: List[MemoryItem]
    known_issues: List[str]
    successful_solutions: List[str]
    failed_solutions: List[str]
    preferences: List[str]

class ChatMessage(BaseModel):
    id: str
    sender: str # "customer", "agent", "ai"
    sender_name: str
    message: str
    timestamp: str
    memories_used: Optional[List[str]] = None

class Conversation(BaseModel):
    id: str
    customer_id: str
    title: str
    status: str = "open" # "open", "closed"
    updated_at: str
    messages: List[ChatMessage] = []

class CreateConversationRequest(BaseModel):
    customer_id: Optional[str] = None
    title: Optional[str] = None

class CreateConversationResponse(BaseModel):
    conversation_id: str
    customer_id: str
    created_at: str
    title: str
    status: str = "open"

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    customer_id: Optional[str] = None
    message: str

class ChatResponse(BaseModel):
    response: str
    memories_used: List[str] = []
    customer_id: str
    conversation_id: str
    timestamp: str
    retained_info: Optional[str] = None

class TicketItem(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    subject: str
    status: str = "Open" # "Open", "In Progress", "Resolved"
    priority: str = "Medium" # "Low", "Medium", "High"
    created_at: str
    context: Optional[str] = None

class CreateTicketRequest(BaseModel):
    subject: str
    context: Optional[str] = None
    priority: Optional[str] = "Medium"

class UpdateStatusRequest(BaseModel):
    status: str # "open" or "resolved"

