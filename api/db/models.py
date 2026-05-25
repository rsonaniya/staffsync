from datetime import date, datetime
import enum
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base


class AccountStatus(str, enum.Enum):
    INVITED = "INVITED"
    PENDING_ACTIVATION = "PENDING_ACTIVATION"
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
        Enum(AccountStatus), default=AccountStatus.INVITED, nullable=False
    )
    onboarding_step: Mapped[int] = mapped_column(default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
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
