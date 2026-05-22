from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.oauth2 import get_current_user
from auth.security import verify_onboarding_permissions
from db.database import get_db
from db.db_user import create_db_user
from db.hash_password import HashPassword
from db.models import AccountStatus, UserModel, UserRole
from schemas import UserCreateRequest

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/seed-user")  # temp endpoint for creating an HR in DB
def create_exp_user(
    role: UserRole,
    db: Session = Depends(get_db),
):
    role_lower = role.value.lower()
    new_user = UserModel(
        first_name=f"Test",
        last_name=f"{role.value}",
        email=f"test.{role_lower}@staffsync.com",
        personal_email=f"personal.{role_lower}@gmail.com",
        password=HashPassword.bcrypt(
            "Rajat@123"
        ),  # Sets password immediately for testing
        role=role,
        account_status=AccountStatus.ACTIVE,  # Keeps them fully active so they can log in immediately
        is_email_verified=True,
        onboarding_step=1,
        # New Step 1 Mandatory Data Fields
        phone=f"+9196{role_lower}",
        date_of_birth=date(1995, 5, 3),  # Native Python date object
        gender="Male",
        residential_address="123 Main St, Indore, Madhya Pradesh",
        current_address="123 Main St, Indore, Madhya Pradesh",
        timezone="Asia/Kolkata",
        # Cloud Storage Placeholders
        profile_image_url="",
        profile_image_public_id="",
        # Emergency Contacts
        emergency_contact_name="Rasheshyam Sonaniya",
        emergency_contact_relationship="Parent",
        emergency_contact_phone="+919977583652",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/")
def create_user(
    request: UserCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    verify_onboarding_permissions(current_user.role, request.role)
    user = create_db_user(request, db)
    return user  # i will define a reponse model in a moment
