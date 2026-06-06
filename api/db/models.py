from datetime import date, datetime, time
import enum
from typing import List, Optional

from pydantic import BaseModel
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base


class AccountStatus(str, enum.Enum):
    INVITED = "INVITED"
    CREATED = "CREATED"
    ACTIVE = "ACTIVE"
    TERMINATED = "TERMINATED"
    RESIGNED = "RESIGNED"


class UserRole(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"
    HR = "HR"
    HR_MANAGER = "HR_MANAGER"
    ADMIN = "ADMIN"


class Gender(str, enum.Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"


class CreditFrequency(str, enum.Enum):
    YEARLY_UPFRONT = "YEARLY_UPFRONT"
    MONTHLY_ACCRUAL = "MONTHLY_ACCRUAL"


class EmploymentType(str, enum.Enum):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACT = "CONTRACT"
    INTERN = "INTERN"
    PROBATION = "PROBATION"


class DocumentCategory(str, enum.Enum):
    IDENTITY = "IDENTITY"
    ADDRESS = "ADDRESS"
    EDUCATION = "EDUCATION"
    EMPLOYMENT = "EMPLOYMENT"
    FINANCIAL = "FINANCIAL"
    OTHER = "OTHER"


class AttendanceStatusEnum(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    ON_LEAVE = "ON_LEAVE"
    HOLIDAY = "HOLIDAY"
    WEEK_OFF = "WEEK_OFF"
    HALF_DAY = "HALF_DAY"
    REGULARIZATION_PENDING = "REGULARIZATION_PENDING"


class UserModel(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    password: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_email_verified: Mapped[bool] = mapped_column(default=False)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    personal_email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(nullable=False)
    gender: Mapped[Gender] = mapped_column(Enum(Gender), nullable=False)
    residential_address: Mapped[str] = mapped_column(String(500), nullable=False)
    current_address: Mapped[str] = mapped_column(String(500), nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)
    profile_image_url: Mapped[Optional[str]] = mapped_column(
        String(1024), nullable=True
    )
    profile_image_public_id: Mapped[Optional[str]] = mapped_column(
        String(1024), nullable=True
    )
    emergency_contact_name: Mapped[str] = mapped_column(String(100))
    emergency_contact_relationship: Mapped[str] = mapped_column(String(50))
    emergency_contact_phone: Mapped[str] = mapped_column(String(20))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    account_status: Mapped[AccountStatus] = mapped_column(
        Enum(AccountStatus), default=AccountStatus.CREATED, nullable=False
    )
    onboarding_step: Mapped[int] = mapped_column(default=1, nullable=False)
    password_token: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    password_token_expiry: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    employment_details: Mapped[Optional["UserEmploymentDetailsModel"]] = relationship(
        back_populates="user",
        foreign_keys="UserEmploymentDetailsModel.user_id",
        cascade="all, delete-orphan",
    )
    payroll_details: Mapped[Optional["UserPayrollAndBankModel"]] = relationship(
        back_populates="user",
        foreign_keys="UserPayrollAndBankModel.user_id",
        cascade="all, delete-orphan",
    )
    documents: Mapped[list["UserDocumentsModel"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    leave_balances: Mapped[list["UserLeaveBalanceModel"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class LeaveTypeModel(Base):
    __tablename__ = "leave_types"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    code: Mapped[str] = mapped_column(
        String(5), unique=True, index=True, nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(default=True)


class LeavePolicyModel(Base):
    __tablename__ = "leave_policies"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(default=True)
    rules: Mapped[list["LeavePolicyRuleModel"]] = relationship(
        back_populates="policy", cascade="all,delete-orphan"
    )
    employees: Mapped[list["UserEmploymentDetailsModel"]] = relationship(
        back_populates="leave_policy"
    )


class LeavePolicyRuleModel(Base):
    __tablename__ = "leave_policy_rules"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    leave_policy_id: Mapped[int] = mapped_column(
        ForeignKey("leave_policies.id", ondelete="CASCADE"), nullable=False
    )
    leave_type_id: Mapped[int] = mapped_column(
        ForeignKey("leave_types.id", ondelete="CASCADE"), nullable=False
    )
    allowance: Mapped[float] = mapped_column(nullable=False)
    credit_frequency: Mapped[CreditFrequency] = mapped_column(
        Enum(CreditFrequency),
        nullable=False,
        default=CreditFrequency.MONTHLY_ACCRUAL,
    )
    is_paid: Mapped[bool] = mapped_column(default=True, nullable=False)
    __table_args__ = (
        UniqueConstraint(
            "leave_policy_id", "leave_type_id", name="_policy_leave_type_uc"
        ),
    )
    policy: Mapped["LeavePolicyModel"] = relationship(back_populates="rules")
    leave_type: Mapped["LeaveTypeModel"] = relationship()


class UserEmploymentDetailsModel(Base):
    __tablename__ = "user_employment_details"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    department: Mapped[str]
    designation: Mapped[str]
    employment_type: Mapped[EmploymentType] = mapped_column(
        Enum(EmploymentType), nullable=False
    )
    reporting_manager_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    joining_date: Mapped[date]
    probation_period_months: Mapped[int] = mapped_column(default=0)
    leave_policy_id: Mapped[int] = mapped_column(ForeignKey("leave_policies.id"))
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    location: Mapped["LocationModel"] = relationship()
    user: Mapped["UserModel"] = relationship(
        back_populates="employment_details", foreign_keys=[user_id]
    )
    leave_policy: Mapped["LeavePolicyModel"] = relationship(back_populates="employees")
    shift_id: Mapped[int] = mapped_column(ForeignKey("shifts.id"))
    shift: Mapped["ShiftModel"] = relationship()


class UserPayrollAndBankModel(Base):
    __tablename__ = "user_payroll_and_bank"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    annual_ctc: Mapped[float]
    basic_salary: Mapped[float]
    hra: Mapped[float]
    special_allowance: Mapped[float]
    currency: Mapped[str] = mapped_column(default="INR")
    bank_name: Mapped[str]
    account_number: Mapped[str]
    ifsc: Mapped[str]
    account_holder_name: Mapped[Optional[str]] = mapped_column(nullable=True)
    pan_number: Mapped[Optional[str]] = mapped_column(nullable=True)
    aadhaar_number: Mapped[Optional[str]] = mapped_column(nullable=True)
    uan_number: Mapped[Optional[str]] = mapped_column(nullable=True)
    user: Mapped["UserModel"] = relationship(
        back_populates="payroll_details", foreign_keys=[user_id]
    )


class UserDocumentsModel(Base):
    __tablename__ = "user_documents"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    category: Mapped[DocumentCategory] = mapped_column(
        Enum(DocumentCategory), nullable=False
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    file_public_id: Mapped[str] = mapped_column(String(1024), nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )
    user: Mapped["UserModel"] = relationship(back_populates="documents")


class UserLeaveBalanceModel(Base):
    __tablename__ = "user_leave_balances"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    leave_type_id: Mapped[int] = mapped_column(
        ForeignKey("leave_types.id", ondelete="CASCADE"), index=True
    )
    allocated_days: Mapped[float] = mapped_column(default=0)
    used_days: Mapped[float] = mapped_column(default=0)
    available_balance: Mapped[float] = mapped_column(default=0)
    calendar_year: Mapped[int] = mapped_column(
        Integer, default=lambda: datetime.now().year
    )
    user: Mapped["UserModel"] = relationship(back_populates="leave_balances")


class ShiftModel(Base):
    __tablename__ = "shifts"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    start_time: Mapped[time] = mapped_column(nullable=False)
    end_time: Mapped[time] = mapped_column(nullable=False)
    grace_period_minutes: Mapped[int] = mapped_column(default=15)
    is_active: Mapped[bool] = mapped_column(default=True)


# holiday junction table
holiday_location_association = Table(
    "holiday_location",
    Base.metadata,
    Column(
        "holiday_id", ForeignKey("holidays.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "location_id", ForeignKey("locations.id", ondelete="CASCADE"), primary_key=True
    ),
)


class LocationModel(Base):
    __tablename__ = "locations"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(250), nullable=False)
    city: Mapped[str] = mapped_column(String(250), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    timezone: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    holidays: Mapped[List["HolidayModel"]] = relationship(
        secondary=holiday_location_association, back_populates="locations"
    )


class HolidayModel(Base):
    __tablename__ = "holidays"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(250), nullable=False)
    applicable_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    locations: Mapped[List["LocationModel"]] = relationship(
        secondary=holiday_location_association, back_populates="holidays"
    )


class AttendanceModel(Base):
    __tablename__ = "attendance"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    applicable_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[AttendanceStatusEnum] = mapped_column(
        Enum(AttendanceStatusEnum), default=AttendanceStatusEnum.ABSENT, nullable=False
    )
    is_late: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    total_working_hours: Mapped[float] = mapped_column(default=0.0)
    last_change_request_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    __table_args__ = (
        UniqueConstraint("user_id", "applicable_date", name="_user_date_uc"),
    )
    user: Mapped["UserModel"] = relationship(foreign_keys=[user_id])
    sessions: Mapped[list["AttendanceSessionModel"]] = relationship(
        back_populates="attendance", cascade="all, delete-orphan"
    )


class AttendanceSessionModel(Base):
    __tablename__ = "attendance_sessions"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    attendance_id: Mapped[int] = mapped_column(
        ForeignKey("attendance.id", ondelete="CASCADE"), index=True
    )
    clock_in: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    clock_out: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    device_info: Mapped[Optional[str]] = mapped_column(String(250), nullable=True)
    attendance: Mapped["AttendanceModel"] = relationship(back_populates="sessions")
