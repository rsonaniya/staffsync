from datetime import date, datetime, timedelta, timezone
import secrets

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.oauth2 import get_current_user
from auth.security import verify_onboarding_permissions
from db.database import get_db
from db.db_leave_policy import get_db_leave_policy_by_id
from db.db_user import (
    create_db_user,
    create_db_user_document_staged,
    create_db_user_emp_details,
    create_db_user_payroll_bank_details,
    get_db_user_by_email,
    get_db_user_by_userid,
    get_db_user_emp_details_by_userid,
    get_db_user_payroll_bank_by_userid,
    initialize_employee_leaves,
)
from db.hash_password import HashPassword
from db.models import AccountStatus, UserModel, UserRole
from schemas import (
    UserCreateRequest,
    UserDocumentCreateRequest,
    UserDocumentInternal,
    UserEmploymentDetailsCreateRequest,
    UserEmploymentDetailsResponse,
    UserPasswordSetRequest,
    UserPayrollAndBankCreateRequest,
    UserPayrollAndBankCreateResponse,
)
import cloudinary.uploader

from utils.email import send_account_activation_email

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


@router.post("/documents/{id}")
def create_user_documents(
    id: int,
    bg_tasks: BackgroundTasks,
    formdata: UserDocumentCreateRequest = Depends(),
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
    if not (
        len(formdata.categories) == len(formdata.files) == len(formdata.display_names)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mismatched array",
        )
    accepted_file_types = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    for i, file in enumerate(formdata.files):
        file_size = file.size
        is_size_correct = file_size >= 102400 and file_size <= 5242880
        if not is_size_correct:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="a valid image file between 100 KB and 5 MB is allowed",
            )
        if not file.content_type in accepted_file_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only JPEG, PNG,PDF and WEBP images are allowed",
            )
        result = cloudinary.uploader.upload(
            file.file, folder=f"staffsync/users-docs/{id}"
        )
        document_data = UserDocumentInternal(
            category=formdata.categories[i],
            file_name=file.filename,
            file_url=result.get("secure_url"),
            file_public_id=result.get("public_id"),
            display_name=formdata.display_names[i],
        )
        create_db_user_document_staged(id, document_data, db)
    password_set_token = secrets.token_urlsafe(16)
    existing_user.password_token = HashPassword.bcrypt(password_set_token)
    existing_user.password_token_expiry = datetime.now(timezone.utc) + timedelta(
        hours=24
    )
    existing_user.onboarding_step = 4
    existing_user.account_status = AccountStatus.INVITED
    db.commit()
    bg_tasks.add_task(
        send_account_activation_email,
        existing_user.email,
        f"{existing_user.first_name} {existing_user.last_name}",
        password_set_token,
    )
    return {
        "message": "Documents uploaded successfully",
        "Password_set_token": password_set_token,
    }  # placeholder response, will be replaced by a proper response


@router.post("/set-password")
def create_user_password(request: UserPasswordSetRequest, db=Depends(get_db)):
    current_user = get_db_user_by_email(request.email, db)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wrong Email or token provided",
        )
    if not current_user.password_token or not current_user.password_token_expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wrong Email or token provided",
        )
    if not HashPassword.verify(request.token, current_user.password_token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wrong Email or token provided",
        )
    if datetime.now(timezone.utc) > current_user.password_token_expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Link Expired, Please ask you HR to send a new link",
        )
    current_user.password = HashPassword.bcrypt(request.password)
    current_user.is_email_verified = True
    current_user.account_status = AccountStatus.ACTIVE
    current_user.password_token = None
    current_user.password_token_expiry = None
    current_user_emp_details = get_db_user_emp_details_by_userid(current_user.id, db)
    if not current_user_emp_details:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something ent wrong, Please ask you HR to send a new link",
        )
    initialize_employee_leaves(
        db, current_user.id, current_user_emp_details.leave_policy_id
    )
    db.commit()
    return {"message": "Password has been set successfully and Account Activated"}
    # TODO: Create Leave Balance data in LeaveBalance model once Model is created
