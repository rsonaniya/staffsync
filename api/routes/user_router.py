from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.oauth2 import get_current_user
from auth.security import verify_onboarding_permissions
from db.database import get_db
from db.db_leave_policy import get_db_leave_policy_by_id
from db.db_user import (
    create_db_user,
    create_db_user_emp_details,
    create_db_user_payroll_bank_details,
    get_db_user_by_userid,
    get_db_user_emp_details_by_userid,
    get_db_user_payroll_bank_by_userid,
)
from db.hash_password import HashPassword
from db.models import AccountStatus, UserModel, UserRole
from schemas import (
    UserCreateRequest,
    UserEmploymentDetailsCreateRequest,
    UserEmploymentDetailsResponse,
    UserPayrollAndBankCreateRequest,
    UserPayrollAndBankCreateResponse,
)

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


# Step 1 data creation for user
@router.post("/")
def create_user(
    request: UserCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    verify_onboarding_permissions(current_user.role, request.role)
    user = create_db_user(request, db)
    return user  # i will define a reponse model in a moment


# Step 2 data creation for user


@router.post("/employment-details/{id}", response_model=UserEmploymentDetailsResponse)
def create_user_emp_details(
    id: int,
    request: UserEmploymentDetailsCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    existing_user = get_db_user_by_userid(id, db)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid User Id",
        )
    verify_onboarding_permissions(current_user.role, existing_user.role)

    existing_emp_details = get_db_user_emp_details_by_userid(id, db)
    if existing_emp_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employment Details for the same user already present",
        )
    if request.reporting_manager_id:
        if request.reporting_manager_id == id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user can not be the self manager",
            )
        existing_manager = get_db_user_by_userid(request.reporting_manager_id, db)
        if not existing_manager or existing_manager.role == UserRole.EMPLOYEE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No Reporting Manager found with given reporting manager id",
            )

    current_leave_policy = get_db_leave_policy_by_id(request.leave_policy_id, db)
    if not current_leave_policy or not current_leave_policy.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active leave policy found with given leave policy id",
        )
    existing_user.onboarding_step = 2
    return create_db_user_emp_details(id, request, db)


@router.post(
    "/payroll-bank-details/{id}", response_model=UserPayrollAndBankCreateResponse
)
def create_user_payroll_bank_details(
    id: int,
    request: UserPayrollAndBankCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    existing_user = get_db_user_by_userid(id, db)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid User Id",
        )
    verify_onboarding_permissions(current_user.role, existing_user.role)
    existing_payroll_bank_details = get_db_user_payroll_bank_by_userid(id, db)
    if existing_payroll_bank_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payroll and Bank Details for the same user already present",
        )
    existing_user.onboarding_step = 3
    return create_db_user_payroll_bank_details(id, request, db)
