from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from auth.oauth2 import create_access_token, get_current_user
from db.database import get_db
from db.hash_password import HashPassword
from db.models import AccountStatus, UserModel
from schemas import UserResponse, UserResponseVerifyToken

router = APIRouter(tags=["Authentication"])


@router.post("/login")
def get_token(
    request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(UserModel).filter(UserModel.email == request.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="invalid credentials"
        )
    if not HashPassword.verify(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="invalid credentials"
        )
    if user.account_status != AccountStatus.ACTIVE:
        if user.account_status == AccountStatus.CREATED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been created but not activated. Please check your personal email for the onboarding activation link or ask you HR to send the link",
            )
        elif user.account_status == AccountStatus.INVITED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account profile setup is incomplete. Please use the activation link sent to your email to finalize your account.",
            )
        elif user.account_status in (AccountStatus.TERMINATED, AccountStatus.RESIGNED):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account is no longer active. Please contact the HR department for assistance.",
            )
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }  # returning as of now, will return relevant user details later


@router.get("/auth/me", response_model=UserResponseVerifyToken)
def verify_token_and_get_user(current_user=Depends(get_current_user)):
    if current_user.account_status != AccountStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is no longer active.",
        )
    return current_user
