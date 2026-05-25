from datetime import date
import enum
from typing import Optional
from zoneinfo import available_timezones

from pydantic import BaseModel, EmailStr, Field, field_validator

from db.models import CreditFrequency, Gender, UserRole


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
