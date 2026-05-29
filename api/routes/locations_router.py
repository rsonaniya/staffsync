from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.oauth2 import get_current_user
from db.database import get_db
from db.db_locations import (
    create_db_location,
    get_all_db_locations,
    get_db_location_by_id,
    get_db_location_by_name,
    update_db_location,
)
from db.models import UserRole
from schemas import LocationCreateRequest, LocationResponse

router = APIRouter(prefix="/admin/location", tags=["Office locations managed by admin"])


@router.post("/", response_model=LocationResponse)
def create_office_location(
    request: LocationCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to create an office location",
        )
    current_location = get_db_location_by_name(request.name, db)
    if current_location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A location with given name already present",
        )
    return create_db_location(request, db)


@router.put("/{id}", response_model=LocationResponse)
def update_office_location(
    id: int,
    request: LocationCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to update an office location",
        )
    current_location_by_id = get_db_location_by_id(id, db)
    if not current_location_by_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No location found with the given id {id}",
        )
    current_location_by_name = get_db_location_by_name(request.name, db)
    if current_location_by_name and current_location_by_name.id != id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A location with given name already present",
        )
    return update_db_location(current_location_by_id, request, db)


@router.get("/", response_model=list[LocationResponse])
def get_all_locations(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    return get_all_db_locations(db)
