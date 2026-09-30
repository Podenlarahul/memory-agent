from fastapi import APIRouter, HTTPException, status, Depends
from models import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserProfile,
    UpdateProfileRequest,
    AuthUser,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from auth import authenticate_user, create_access_token, get_current_user, is_admin_email
from customer_store import customer_store

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials or sign up."
        )
    
    # Strictly ensure admin NEVER has a customer_id
    effective_customer_id = user.customer_id if user.role == "customer" else None

    token = create_access_token({
        "sub": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "customer_id": effective_customer_id
    })

    auth_user = AuthUser(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        customer_id=effective_customer_id,
        device=user.device if user.role == "customer" else None,
        company=user.company if user.role == "customer" else None
    )
    
    return TokenResponse(
        access_token=token,
        token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        name=user.name,
        email=user.email,
        customer_id=effective_customer_id,
        user=auth_user
    )

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest):
    if is_admin_email(req.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot register a customer account with an admin email. Please use Admin Sign In."
        )

    if req.name.strip().lower() == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer name cannot be 'Admin'. Please provide your real name."
        )

    existing = customer_store.get_customer_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in."
        )
    
    try:
        new_customer = customer_store.register_customer(
            name=req.name,
            email=req.email,
            password=req.password,
            device=req.device if req.device and req.device.strip() else "Device not specified",
            company=req.company or "Personal"
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    token = create_access_token({
        "sub": f"user_{new_customer.id}",
        "name": new_customer.name,
        "email": new_customer.email,
        "role": "customer",
        "customer_id": new_customer.id
    })

    auth_user = AuthUser(
        id=f"user_{new_customer.id}",
        email=new_customer.email,
        name=new_customer.name,
        role="customer",
        customer_id=new_customer.id,
        device=new_customer.device,
        company=new_customer.company
    )

    return TokenResponse(
        access_token=token,
        token=token,
        token_type="bearer",
        role="customer",
        user_id=f"user_{new_customer.id}",
        name=new_customer.name,
        email=new_customer.email,
        customer_id=new_customer.id,
        user=auth_user
    )


@router.get("/me", response_model=UserProfile)
async def get_profile(current_user: UserProfile = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserProfile)
async def update_profile(req: UpdateProfileRequest, current_user: UserProfile = Depends(get_current_user)):
    if current_user.role == "customer" and current_user.customer_id:
        cust = customer_store.get_customer(current_user.customer_id)
        if cust:
            if req.name:
                cust.name = req.name
                current_user.name = req.name
            if req.phone:
                cust.phone = req.phone
                current_user.phone = req.phone
            if req.company:
                cust.company = req.company
                current_user.company = req.company
            if req.device:
                cust.device = req.device
                current_user.device = req.device
    return current_user


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    email = req.email.strip().lower()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required."
        )
    customer = customer_store.get_customer_by_email(email)
    is_admin = is_admin_email(email)
    return {
        "status": "success",
        "message": f"Password reset instructions have been prepared for {email}.",
        "email": email,
        "exists": bool(customer or is_admin)
    }


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    email = req.email.strip().lower()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required."
        )
    if not req.new_password or len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # Check if admin
    if is_admin_email(email):
        customer_store.reset_password(email, req.new_password)
        return {
            "status": "success",
            "message": "Admin password updated successfully. You can now log in with your new password."
        }

    customer = customer_store.get_customer_by_email(email)
    if not customer:
        # Check by name/username match
        for c in customer_store.get_all_customers():
            if email == c.email.lower() or email == c.name.lower():
                customer = c
                break

    # Store reset password for customer
    customer_store.reset_password(email, req.new_password)
    if customer:
        customer_store.reset_password(customer.email, req.new_password)

    return {
        "status": "success",
        "message": "Password updated successfully. You can now log in with your new password."
    }
