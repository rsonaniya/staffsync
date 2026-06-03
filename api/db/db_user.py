from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from db.db_leave_policy_rule import get_db_leave_policy_rules_by_policy_id
from db.hash_password import HashPassword
from db.models import (
    AccountStatus,
    UserDocumentsModel,
    UserEmploymentDetailsModel,
    UserLeaveBalanceModel,
    UserModel,
    UserPayrollAndBankModel,
    UserRole,
)
from schemas import (
    UserCreateRequest,
    UserDocumentInternal,
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


def update_db_user(user: UserModel, request: UserCreateRequest, db: Session):
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
    if existing_user and existing_user.id != user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists with given emails or Phone",
        )

    user.first_name = request.first_name
    user.last_name = request.last_name
    user.email = request.email
    user.personal_email = request.personal_email
    user.role = request.role
    user.phone = request.phone
    user.date_of_birth = request.date_of_birth
    user.gender = request.gender
    user.residential_address = request.residential_address
    user.current_address = request.current_address
    user.timezone = request.timezone
    user.emergency_contact_name = request.emergency_contact_name
    user.emergency_contact_relationship = request.emergency_contact_relationship
    user.emergency_contact_phone = request.emergency_contact_phone
    db.commit()
    db.refresh(user)
    return user


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
        shift_id=request.shift_id,
        location_id=request.location_id,
    )
    db.add(new_user_emp_details)
    db.commit()
    db.refresh(new_user_emp_details)
    return new_user_emp_details


def update_db_user_emp_details(
    user_emp_details: UserEmploymentDetailsModel,
    request: UserEmploymentDetailsCreateRequest,
    db: Session,
):
    user_emp_details.department = request.department
    user_emp_details.designation = request.designation
    user_emp_details.employment_type = request.employment_type
    user_emp_details.reporting_manager_id = request.reporting_manager_id
    user_emp_details.joining_date = request.joining_date
    user_emp_details.probation_period_months = request.probation_period_months
    user_emp_details.leave_policy_id = request.leave_policy_id
    user_emp_details.shift_id = request.shift_id
    user_emp_details.location_id = request.location_id
    db.commit()
    db.refresh(user_emp_details)
    return user_emp_details


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


def update_db_user_payroll_bank_details(
    payroll_bank_details: UserPayrollAndBankModel,
    request: UserPayrollAndBankCreateRequest,
    db: Session,
):

    payroll_bank_details.annual_ctc = request.annual_ctc
    payroll_bank_details.basic_salary = request.basic_salary
    payroll_bank_details.hra = request.hra
    payroll_bank_details.special_allowance = request.special_allowance
    payroll_bank_details.currency = request.currency
    payroll_bank_details.bank_name = request.bank_name
    payroll_bank_details.account_number = request.account_number
    payroll_bank_details.ifsc = request.ifsc
    payroll_bank_details.account_holder_name = request.account_holder_name
    payroll_bank_details.pan_number = request.pan_number
    payroll_bank_details.aadhaar_number = request.aadhaar_number
    payroll_bank_details.uan_number = request.uan_number
    db.commit()
    db.refresh(payroll_bank_details)
    return payroll_bank_details


def create_db_user_document_staged(id: int, request: UserDocumentInternal, db: Session):
    new_db_user_document = UserDocumentsModel(
        user_id=id,
        category=request.category,
        file_name=request.file_name,
        file_url=request.file_url,
        file_public_id=request.file_public_id,
        display_name=request.display_name,
    )
    db.add(new_db_user_document)
    return new_db_user_document


def initialize_employee_leaves(db: Session, user_id: int, policy_id: int):
    policy_rules = get_db_leave_policy_rules_by_policy_id(policy_id, db)
    if not policy_rules:
        return
    current_date = datetime.now(timezone.utc)
    current_day = current_date.day
    current_month = current_date.month
    current_year = current_date.year
    for rule in policy_rules:
        if not rule.leave_type.is_active:
            continue
        calculated_allowance = 0.0
        if rule.credit_frequency == "MONTHLY_ACCRUAL":
            monthly_quota = float(rule.allowance) / 12.0
            if current_day <= 15:
                calculated_allowance = monthly_quota
            else:
                calculated_allowance = monthly_quota / 2.0
        elif rule.credit_frequency == "YEARLY_UPFRONT":
            month_remaining = 12 - current_month + 1
            prorated_yearly = (float(rule.allowance) / 12) * month_remaining
            calculated_allowance = round(prorated_yearly * 2) / 2
        new_balance = UserLeaveBalanceModel(
            user_id=user_id,
            leave_type_id=rule.leave_type_id,
            allocated_days=calculated_allowance,
            available_balance=calculated_allowance,
            used_days=0.0,
            calendar_year=current_year,
        )
        db.add(new_balance)


def get_db_active_managers(db: Session):
    return (
        db.query(UserModel)
        .filter(
            UserModel.role != UserRole.EMPLOYEE,
            UserModel.account_status == AccountStatus.ACTIVE,
        )
        .all()
    )


def get_db_user_docs(id: int, db: Session):
    return db.query(UserDocumentsModel).filter(UserDocumentsModel.user_id == id).all()


def delete_db_docs(document: UserDocumentsModel, db: Session):
    db.delete(document)
    db.commit()


def get_db_all_users(visible_roles: list[UserRole], db: Session):
    return db.query(UserModel).filter(UserModel.role.in_(visible_roles)).all()


def get_db_user_docs_by_document_id(document_id: int, db: Session):
    return (
        db.query(UserDocumentsModel)
        .filter(UserDocumentsModel.id == document_id)
        .first()
    )
