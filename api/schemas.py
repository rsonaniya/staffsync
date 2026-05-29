from datetime import date, datetime, time
import enum
from typing import Optional
from zoneinfo import available_timezones

from fastapi import File, Form, UploadFile
from pydantic import BaseModel, EmailStr, Field, field_validator

from db.models import (
    AccountStatus,
    CreditFrequency,
    DocumentCategory,
    EmploymentType,
    Gender,
    UserRole,
)


class UserCreateRequest(BaseModel):
    first_name: str = Field(
        ..., min_length=1, max_length=50, description="Employee's first name"
    )
    last_name: Optional[str] = Field(
        None, max_length=50, description="Employee's last name"
    )
    email: EmailStr = Field(..., description="Unique corporate email")
    personal_email: EmailStr = Field(..., description="Unique personal email")
    phone: str = Field(..., min_length=4, max_length=20, description="Contact Number")
    date_of_birth: date = Field(..., description="Date of birth in YYYY-MM-DD format")
    gender: Gender = Field(None, max_length=20, description="Gender identity")
    residential_address: str = Field(
        ..., min_length=5, max_length=500, description="Permanent home address"
    )
    current_address: str = Field(
        ..., min_length=5, max_length=500, description="Current address"
    )
    timezone: str = Field(
        ...,
        description="Standard IANA timezone string (e.g.,'Asia/Kolkata')",
    )

    @field_validator("timezone")
    @classmethod
    def validate_iana_timezone(cls, v: str) -> str:
        if v not in available_timezones():
            raise ValueError(
                f"'{v}' is not a valid IANA timezone. Please provide a standard value like 'Asia/Kolkata' or 'UTC'."
            )
        return v

    emergency_contact_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Emergency contact person full name",
    )
    emergency_contact_relationship: str = Field(
        ..., min_length=1, max_length=50, description="Relationship to employee"
    )
    emergency_contact_phone: str = Field(
        ..., min_length=4, max_length=20, description="Emergency contact number"
    )
    role: UserRole = Field(
        ..., description="System privileges tier allocated to the employee"
    )


class UserResponse(BaseModel):
    id: int
    is_email_verified: bool
    first_name: str
    last_name: Optional[str]
    email: str
    personal_email: str
    phone: str
    date_of_birth: date
    gender: Gender
    residential_address: str
    current_address: str
    timezone: str
    profile_image_url: Optional[str]
    profile_image_public_id: Optional[str]
    emergency_contact_name: str
    emergency_contact_relationship: str
    emergency_contact_phone: str
    role: UserRole
    account_status: AccountStatus
    onboarding_step: int
    model_config = {"from_attributes": True}

    employment_details: Optional["UserEmploymentDetailsResponse"]
    payroll_details: Optional["UserPayrollAndBankResponse"]
    documents: Optional[list["UserDocumentInternal"]]
    leave_balances: Optional[list["UserLeaveBalanceResponse"]]


class LeaveTypeCreateRequest(BaseModel):
    name: str = Field(
        ..., min_length=5, max_length=50, description="Leave Name (e.g.,'Sick Leave')"
    )
    code: str = Field(
        ...,
        min_length=2,
        max_length=5,
        description="Leave code (e.g.,'SL' for 'Sick Leave')",
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="A short description of leave",
    )
    is_active: Optional[bool] = Field(
        True,
        description="Flag to set a leave active/deactive",
    )

    @field_validator("name")
    @classmethod
    def sanitize_name(cls, v: str):
        return v.strip()

    @field_validator("code")
    @classmethod
    def sanitize_code(cls, v: str):
        return v.strip().upper()

    model_config = {"from_attributes": True}


class LeaveTypeResponse(LeaveTypeCreateRequest):
    id: int


class LeavePolicyCreateRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=5,
        max_length=100,
        description="Leave Policy Name (e.g.,'Contractor Policy - India')",
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="A short description of leave policy",
    )
    is_active: Optional[bool] = Field(
        True,
        description="Flag to set a leave policy active/deactive",
    )

    @field_validator("name")
    @classmethod
    def senitize_name(cls, v: str):
        return v.strip()

    model_config = {"from_attributes": True}


class LeavePolicyResponse(LeavePolicyCreateRequest):
    id: int


class LeavePolicyRuleCreateRequest(BaseModel):
    leave_policy_id: int = Field(
        ..., description="The ID of the parent leave policy bucket"
    )
    leave_type_id: int = Field(
        ..., description="The ID of the target leave type from master dictionary"
    )
    allowance: float = Field(
        ...,
        ge=0,
        description="Total annual leave days allowed (supports half-days, e.g., 14.5)",
    )
    credit_frequency: Optional[CreditFrequency] = Field(
        CreditFrequency.MONTHLY_ACCRUAL, description="Accrual frequency configuration"
    )
    is_paid: Optional[bool] = Field(
        True, description="Flag to set if this rule is for paid or unpaid leave"
    )

    @field_validator("allowance")
    @classmethod
    def check_positive_allowance(cls, v: float):
        if v < 0:
            raise ValueError("Leave allowance cannot be negative.")
        return v

    model_config = {"from_attributes": True}


class LeavePolicyRuleResponse(LeavePolicyRuleCreateRequest):
    id: int


class UserEmploymentDetailsCreateRequest(BaseModel):
    department: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Department Name (e.g.,'Sales')",
    )
    designation: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Designation Name (e.g.,'Frontend Developer')",
    )
    employment_type: EmploymentType = Field(..., description="Employment Type Enum")
    reporting_manager_id: Optional[int] = Field(
        None, description="Reporting manager for the user (Optional)"
    )
    joining_date: date = Field(..., description="joining date in YYYY-MM-DD format")
    probation_period_months: Optional[int] = Field(
        0, ge=0, description="Users probabion period"
    )
    leave_policy_id: int = Field(..., description="A valid Leave policy ID")
    shift_id: int = Field(..., description="A valid Shift ID")
    location_id: int = Field(
        ..., description="A valid Location ID where the employee works"
    )
    model_config = {"from_attributes": True}


class UserEmploymentDetailsResponse(UserEmploymentDetailsCreateRequest):
    id: int
    user_id: int
    shift: Optional["ShiftResponse"] = None
    location: Optional["LocationResponse"] = None


class UserPayrollAndBankCreateRequest(BaseModel):
    annual_ctc: float = Field(..., ge=0, description="Users Total annual CTC")
    basic_salary: float = Field(
        ..., ge=0, description="Users Total annual basic salary"
    )
    hra: float = Field(..., ge=0, description="Users Total annual HRA")
    special_allowance: float = Field(
        ..., ge=0, description="Users Total annual special allowances"
    )
    currency: Optional[str] = Field("INR", description="Users Currency")
    bank_name: str = Field(
        ...,
        min_length=2,
        max_length=250,
        description="Users bank Name (e.g,'SBI')",
    )
    account_number: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Users bank Account number",
    )
    ifsc: str = Field(
        ...,
        min_length=11,
        max_length=11,
        description="Users bank Account IFSC Code",
    )
    account_holder_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=50,
        description="Users bank Account name",
    )
    pan_number: Optional[str] = Field(
        None,
        min_length=10,
        max_length=10,
        description="Users PAN number",
    )
    aadhaar_number: Optional[str] = Field(
        None,
        min_length=12,
        max_length=12,
        description="Users bank Aadhaar Number",
    )
    uan_number: Optional[str] = Field(
        None,
        min_length=12,
        max_length=12,
        description="Users EPFO UAN number",
    )
    model_config = {"from_attributes": True}


class UserPayrollAndBankResponse(UserPayrollAndBankCreateRequest):
    id: int


class UserPayrollAndBankCreateResponse(UserPayrollAndBankCreateRequest):
    id: int
    user_id: int
    currency: str


class UserDocumentCreateRequest:
    def __init__(
        self,
        files: list[UploadFile] = File(..., description="The physical documents"),
        categories: list[DocumentCategory] = Form(
            ..., description="Category for Attached document"
        ),
        display_names: list[str] = Form(
            ...,
            description="A name for the file to show in UI",
        ),
    ):
        self.files = files
        self.categories = categories
        self.display_names = display_names


class UserDocumentInternal(BaseModel):
    category: DocumentCategory
    display_name: str
    file_name: str
    file_url: str
    file_public_id: str


class UserDocumentResponse(UserDocumentInternal):
    id: int
    user_id: int
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class UserLeaveBalanceResponse(BaseModel):
    id: int
    user_id: int
    leave_type_id: int
    allocated_days: float
    used_days: float
    available_balance: float
    calendar_year: int


class UserPasswordSetRequest(BaseModel):
    email: EmailStr = Field(
        ..., description="Email on which the password token is sent"
    )
    token: str = Field(..., description="token received on email")
    password: str = Field(
        ...,
        min_length=8,
        max_length=14,
        description="New password between 8-14 characters",
    )


class ManagerLookUpResponse(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str]
    profile_image_url: Optional[str]
    model_config = {"from_attributes": True}


class ShiftCreateRequest(BaseModel):
    name: str = Field(
        ..., min_length=2, max_length=50, description="Shift name (e,g:'Morning Shift')"
    )
    start_time: time = Field(..., description="Expected start time (HH:MM:SS)")
    end_time: time = Field(..., description="Expected end time (HH:MM:SS)")
    grace_period_minutes: int = Field(
        15, ge=0, description="Allowed late minutes before marking half-day/absent"
    )
    is_active: bool = Field(True, description="Flag for active shifts")

    model_config = {"from_attributes": True}


class ShiftResponse(ShiftCreateRequest):
    id: int


class UserForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Unique corporate email")


class LocationCreateRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=250,
        description="Actual office name (e.g,'Indore Office 1')",
    )
    city: str = Field(
        ...,
        min_length=2,
        max_length=250,
        description="City of the office(e.g,'Indore')",
    )
    address: Optional[str] = Field(
        None,
        max_length=500,
        description="Actual office physical address (e.g,'123,Vijay Nagar Indore')",
    )
    state: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="State for regional holiday mapping",
    )
    country: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Country for national laws and holidays",
    )
    timezone: str = Field(
        ..., description="Standard IANA Timezone (e.g,'Asia/Kolkata')"
    )
    is_active: bool = Field(True, description="Flag for active location")
    model_config = {"from_attributes": True}

    @field_validator("timezone")
    @classmethod
    def validate_iana_timezone(cls, v: str) -> str:
        if v not in available_timezones():
            raise ValueError(
                f"'{v}' is not a valid IANA timezone. Please provide a standard value like 'Asia/Kolkata' or 'UTC'."
            )
        return v


class LocationResponse(LocationCreateRequest):
    id: int


class HolidayCreateRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=250,
        description="name of the holiday (e.g.,'Diwali')",
    )
    applicable_date: date = Field(
        ..., description="The exact date of the holiday in YYYY-MM-DD format"
    )
    locations_ids: list[int] = Field(
        ..., min_length=1, description="List of Location IDs where this holiday applies"
    )
    is_active: bool = Field(True, description="Flag for active holiday")
    model_config = {"from_attributes": True}


class HolidayResponse(BaseModel):
    id: int
    name: str
    applicable_date: date
    is_active: bool
    locations: list[LocationResponse] = []
