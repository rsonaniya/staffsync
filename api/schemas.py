from datetime import date
from typing import Optional
from zoneinfo import available_timezones

from pydantic import BaseModel, EmailStr, Field, field_validator

from db.models import Gender, UserRole


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
