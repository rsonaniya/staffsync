from fastapi import APIRouter, Depends, HTTPException, status

from auth.oauth2 import get_current_user
from db.database import get_db
from db.db_leave_type import (
    create_db_leave_type,
    get_all_db_leave_types,
    get_leave_type_by_id,
    get_leave_type_by_name_or_code,
    update_db_leave_type,
)
from db.models import UserRole
from schemas import LeaveTypeCreateRequest, LeaveTypeResponse

router = APIRouter(prefix="/admin/leave-type", tags=["Admin Leave Type Management"])


@router.post("/", response_model=LeaveTypeResponse)
def create_leave_type(
    request: LeaveTypeCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to create leave type",
        )
    current_leave_type = get_leave_type_by_name_or_code(request, db)
    if current_leave_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A leave type with give leave request already present",
        )
    return create_db_leave_type(request, db)


@router.get("/", response_model=list[LeaveTypeResponse])
def get_all_leave_types(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted",
        )

    return get_all_db_leave_types(db)


@router.put("/{id}", response_model=LeaveTypeResponse)
def update_leave_type(
    id: int,
    request: LeaveTypeCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to update leave type",
        )
    current_leave_by_id = get_leave_type_by_id(id, db)
    if not current_leave_by_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No leave type found with given id",
        )
    current_leave_type = get_leave_type_by_name_or_code(request, db)
    if current_leave_type and current_leave_type.id != id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A leave type with given leave type name already present",
        )
    return update_db_leave_type(current_leave_by_id, request, db)
