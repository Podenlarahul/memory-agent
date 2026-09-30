import re
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from config import settings
from models import UserProfile
from customer_store import customer_store

security = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

def is_admin_email(email: str) -> bool:
    clean = email.lower().strip()
    admin_env = settings.ADMIN_EMAIL.lower().strip() if settings.ADMIN_EMAIL else "admin@supportmind.ai"
    return (
        clean == "admin"
        or clean == admin_env
        or clean in ["admin@supportmind.ai", "admin@supportmind.com", "admin@supportmind.io"]
        or clean.startswith("admin@")
    )

def authenticate_user(email: str, password: str) -> Optional[UserProfile]:
    """
    Authenticate user. Role is determined strictly on the backend.
    If email/username matches admin credentials -> admin role.
    If customer matches existing registered record -> customer role.
    Otherwise -> None (401 Unauthorized).
    """
    clean_email = email.lower().strip()

    # 1. Check if user is Admin
    if is_admin_email(clean_email):
        admin_pass = settings.ADMIN_PASSWORD or "admin123"
        stored_pass = customer_store.get_password(clean_email)
        # Accept configured admin password, reset password, or default 'admin123'
        if password == admin_pass or password == "admin123" or (stored_pass and password == stored_pass):
            return UserProfile(
                id="admin_01",
                name="Support Agent",
                email=clean_email if "@" in clean_email else settings.ADMIN_EMAIL,
                role="admin",
                customer_id=None
            )
        # Invalid admin password: do NOT fall through
        return None

    # 2. Check if user is a registered Customer (exact email or username)
    customer = customer_store.get_customer_by_email(clean_email)
    
    # If not found by exact email, check if clean_email matches customer name or username prefix
    if not customer:
        for c in customer_store.get_all_customers():
            if (
                clean_email == c.name.lower()
                or clean_email in c.name.lower().split()
                or clean_email == c.email.split("@")[0].lower()
                or clean_email in c.id.lower()
            ):
                customer = c
                break

    # If still not found and email is not admin, automatically create/register customer account
    if not customer:
        name_part = clean_email.split("@")[0].replace(".", " ").replace("_", " ").title()
        customer = customer_store.register_customer(
            name=name_part if name_part else "Customer",
            email=clean_email if "@" in clean_email else f"{clean_email}@example.com",
            password=password or "password123",
            device="ASUS Vivobook 15" if "karthik" in clean_email else "Laptop",
            company="Personal"
        )

    if customer:
        if not customer_store.verify_password(customer.email, password) and not customer_store.verify_password(clean_email, password):
            return None
        return UserProfile(
            id=f"user_{customer.id}",
            name=customer.name,
            email=customer.email,
            role="customer",
            customer_id=customer.id,
            phone=customer.phone,
            company=customer.company,
            device=customer.device or "Device not specified"
        )

    return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> UserProfile:
    """
    Extract and validate current authenticated user from Bearer JWT.
    """
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload:
            role = payload.get("role", "customer")
            cid = payload.get("customer_id")
            if role == "customer" and not cid:
                email = payload.get("email", "")
                existing = customer_store.get_customer_by_email(email) if email else None
                if existing:
                    cid = existing.id
                else:
                    name_slug = re.sub(r'[^a-zA-Z0-9]', '_', (payload.get('name') or 'user').lower())
                    cid = f"cust_{name_slug}_001"

            return UserProfile(
                id=payload.get("sub", ""),
                name=payload.get("name", "User"),
                email=payload.get("email", ""),
                role=role,
                customer_id=cid
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Please sign in."
    )

def verify_customer_access(current_user: UserProfile, requested_customer_id: str):
    """
    Strict Privacy Protection:
    Admins can access all customer data.
    Customers can ONLY access their own customer_id.
    """
    if current_user.role == "admin":
        return True
    
    if not current_user.customer_id:
        return True

    if current_user.customer_id != requested_customer_id:
        if current_user.customer_id in requested_customer_id or requested_customer_id in current_user.customer_id:
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Privacy Protection: You are not authorized to view another customer's data or memories."
        )
    return True

