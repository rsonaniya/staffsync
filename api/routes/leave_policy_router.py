from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.oauth2 import get_current_user
from db.database import get_db
from db.db_leave_policy import (
    create_db_leave_policy,
    get_all_db_leave_policies,
    get_current_leave_policy_by_name,
    get_db_leave_policy_by_id,
    update_db_leave_policy,
)
from db.models import UserRole
from schemas import LeavePolicyCreateRequest, LeavePolicyResponse

router = APIRouter(prefix="/admin/leave-policy", tags=["Admin Leave policy Management"])


@router.post("/", response_model=LeavePolicyResponse)
def create_leave_policy(
    request: LeavePolicyCreateRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to create leave policy",
        )
    current_leave_policy = get_current_leave_policy_by_name(request, db)
    if current_leave_policy:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A leave policy with name {request.name} already present",
        )
    new_leave_policy = create_db_leave_policy(request, db)
    return new_leave_policy


@router.get("/", response_model=list[LeavePolicyResponse])
def get_all_leave_policies(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to see internal policy",
        )
    return get_all_db_leave_policies(db)


@router.put("/{id}", response_model=LeavePolicyResponse)
def update_leave_policy(
    id: int,
    request: LeavePolicyCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to update leave policy",
        )
    existing_leave_policy_by_id = get_db_leave_policy_by_id(id, db)
    if not existing_leave_policy_by_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No leave policy found with given id",
        )
    current_leave_policy = get_current_leave_policy_by_name(request, db)
    if current_leave_policy and current_leave_policy.id != id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A leave policy with given leave policy name already present",
        )
    return update_db_leave_policy(existing_leave_policy_by_id, request, db)
