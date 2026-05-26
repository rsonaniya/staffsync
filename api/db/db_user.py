from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from db.hash_password import HashPassword
from db.models import UserEmploymentDetailsModel, UserModel, UserPayrollAndBankModel
from schemas import (
    UserCreateRequest,
    UserEmploymentDetailsCreateRequest,
    UserPayrollAndBankCreateRequest,
)


def create_db_user(request: UserCreateRequest, db: Session):
    new_user_email = request.email
    new_user_personal_email = request.personal_email
    new_user_phone = request.phone
    existing_user = (
        db.query(UserModel)
        .filter(
            or_(
                UserModel.email == new_user_email,
                UserModel.email == new_user_personal_email,
                UserModel.personal_email == new_user_email,
                UserModel.personal_email == new_user_personal_email,
                UserModel.phone == new_user_phone,
            )
        )
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists with given emails or Phone",
        )
    new_user = UserModel(
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        personal_email=request.personal_email,
        # password=HashPassword.bcrypt(
        #     "Rajat@123"
        # ),  # Sets password immediately for testing
        role=request.role,
        # account_status=AccountStatus.ACTIVE,  # Keeps them fully active so they can log in immediately
        # is_email_verified=True,
        onboarding_step=1,
        # New Step 1 Mandatory Data Fields
        phone=request.phone,
        date_of_birth=request.date_of_birth,
        gender=request.gender,
        residential_address=request.residential_address,
        current_address=request.current_address,
        timezone=request.timezone,
        # Cloud Storage Placeholders
        profile_image_url="",
        profile_image_public_id="",
        # Emergency Contacts
        emergency_contact_name=request.emergency_contact_name,
        emergency_contact_relationship=request.emergency_contact_relationship,
        emergency_contact_phone=request.emergency_contact_phone,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def get_db_user_by_email(email: str, db: Session) -> UserModel | None:
    return db.query(UserModel).filter(UserModel.email == email).first()


def get_db_user_by_userid(id: int, db: Session) -> UserModel | None:
    return db.query(UserModel).filter(UserModel.id == id).first()


def get_db_user_emp_details_by_userid(user_id: int, db: Session):
    return (
        db.query(UserEmploymentDetailsModel)
        .filter(UserEmploymentDetailsModel.user_id == user_id)
        .first()
    )


def create_db_user_emp_details(
    id: int, request: UserEmploymentDetailsCreateRequest, db: Session
):
    new_user_emp_details = UserEmploymentDetailsModel(
        department=request.department,
        designation=request.designation,
        employment_type=request.employment_type,
        reporting_manager_id=request.reporting_manager_id,
        joining_date=request.joining_date,
        probation_period_months=request.probation_period_months,
        leave_policy_id=request.leave_policy_id,
        user_id=id,
    )
    db.add(new_user_emp_details)
    db.commit()
    db.refresh(new_user_emp_details)
    return new_user_emp_details


def get_db_user_payroll_bank_by_userid(user_id: int, db: Session):
    return (
        db.query(UserPayrollAndBankModel)
        .filter(UserPayrollAndBankModel.user_id == user_id)
        .first()
    )


def create_db_user_payroll_bank_details(
    id: int, request: UserPayrollAndBankCreateRequest, db: Session
):
    new_user_payroll_bank_details = UserPayrollAndBankModel(
        annual_ctc=request.annual_ctc,
        basic_salary=request.basic_salary,
        hra=request.hra,
        special_allowance=request.special_allowance,
        currency=request.currency,
        bank_name=request.bank_name,
        account_number=request.account_number,
        ifsc=request.ifsc,
        account_holder_name=request.account_holder_name,
        pan_number=request.pan_number,
        aadhaar_number=request.aadhaar_number,
        uan_number=request.uan_number,
        user_id=id,
    )
    db.add(new_user_payroll_bank_details)
    db.commit()
    db.refresh(new_user_payroll_bank_details)
    return new_user_payroll_bank_details
