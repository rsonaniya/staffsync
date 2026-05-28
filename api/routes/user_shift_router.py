from fastapi import APIRouter, Depends, HTTPException, status

from auth.oauth2 import get_current_user
from db.database import get_db
from db.db_shift import (
    create_db_shift,
    db_get_shifts,
    get_shift_by_id,
    get_shift_by_name,
    update_db_shift,
)
from db.models import UserRole
from schemas import ShiftCreateRequest, ShiftResponse

router = APIRouter(prefix="/admin/shift", tags=["Shifts managed by Admin"])


@router.post("/", response_model=ShiftResponse)
def create_shift(
    request: ShiftCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to create a shift",
        )
    current_shift = get_shift_by_name(request.name, db)
    if current_shift:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A shift with the given name {request.name} already present",
        )
    new_shift = create_db_shift(request, db)
    return new_shift


@router.get("/", response_model=list[ShiftResponse])
def get_shifts(db=Depends(get_db), current_user=Depends(get_current_user)):
    return db_get_shifts(db)


@router.put("/{id}", response_model=ShiftResponse)
def update_shift(
    id: int,
    request: ShiftCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to update a shift",
        )
    current_shift_by_id = get_shift_by_id(id, db)
    if not current_shift_by_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No shift found with the provied shift id {id}",
        )
    current_shift_by_name = get_shift_by_name(request.name, db)
    if current_shift_by_name and current_shift_by_name.id != id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A shift with the given name: {request.name} already present",
        )
    return update_db_shift(current_shift_by_id, request, db)
