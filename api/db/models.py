from datetime import date, datetime
import enum
from typing import Optional

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

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
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
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
