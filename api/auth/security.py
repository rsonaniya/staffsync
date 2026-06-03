from typing import Optional

from fastapi import HTTPException, status

from db.models import UserRole

ALLOWED_CREATION_TARGET = {
    UserRole.EMPLOYEE: [],
    UserRole.MANAGER: [],
    UserRole.HR: [UserRole.EMPLOYEE, UserRole.MANAGER],
    UserRole.HR_MANAGER: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR],
    UserRole.ADMIN: [
        UserRole.EMPLOYEE,
        UserRole.MANAGER,
        UserRole.HR,
        UserRole.HR_MANAGER,
        UserRole.ADMIN,
    ],
}

VISIBLE_USER_ROLES = {
    UserRole.EMPLOYEE: [],
    UserRole.MANAGER: [UserRole.EMPLOYEE],
    UserRole.HR: [UserRole.EMPLOYEE, UserRole.MANAGER],
    UserRole.HR_MANAGER: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR],
    UserRole.ADMIN: [
        UserRole.EMPLOYEE,
        UserRole.MANAGER,
        UserRole.HR,
        UserRole.HR_MANAGER,
        UserRole.ADMIN,
    ],
}


def verify_onboarding_permissions(
    current_user_role: UserRole, target_role: UserRole, is_edit: Optional[bool] = False
):
    allowed_targets = ALLOWED_CREATION_TARGET.get(current_user_role, [])
    if target_role not in allowed_targets:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"access denied: A user with role '{current_user_role.value}' is not allowed to {'modify' if is_edit else 'create'} a '{target_role.value}' account",
        )


def get_visible_roles(current_role: UserRole) -> list[UserRole]:
    return VISIBLE_USER_ROLES.get(current_role, [])
