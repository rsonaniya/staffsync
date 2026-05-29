from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.oauth2 import get_current_user
from db.database import get_db
from db.db_holiday import (
    create_db_holiday,
    get_db_all_holidays,
    get_holiday_by_date,
    get_holiday_by_id,
    get_holiday_by_year_and_name,
    update_db_holiday,
)
from db.db_locations import get_location_by_ids
from db.models import UserRole
from schemas import HolidayCreateRequest, HolidayResponse

router = APIRouter(prefix="/admin/holiday", tags=["Office holidays managed by admin"])


@router.post("/", response_model=HolidayResponse)
def create_holiday(
    request: HolidayCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to create an office holiday",
        )
    current_holiday_by_date = get_holiday_by_date(request.applicable_date, db)
    if current_holiday_by_date:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A holiday already exists on this exact date {request.applicable_date}.",
        )
    current_holiday_by_date_and_name = get_holiday_by_year_and_name(
        request.applicable_date.year, request.name, db
    )
    if current_holiday_by_date_and_name:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A holiday with name {request.name} is already present in year {request.applicable_date.year}",
        )
    current_locations_by_ids = get_location_by_ids(request.locations_ids, db)
    if len(current_locations_by_ids) != len(request.locations_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more of the provided location IDs are invalid.",
        )
    new_holiday = create_db_holiday(request, current_locations_by_ids, db)
    return new_holiday


@router.get("/", response_model=list[HolidayResponse])
def get_all_holidays(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    return get_db_all_holidays(db)


@router.put("/{id}", response_model=HolidayResponse)
def update_holiday(
    id: int,
    request: HolidayCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to modify an office holiday",
        )
    current_holiday_by_id = get_holiday_by_id(id, db)
    if not current_holiday_by_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"no holiday found with the given id {id}",
        )
    current_holiday_by_date = get_holiday_by_date(request.applicable_date, db)
    if current_holiday_by_date and current_holiday_by_date.id != id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A holiday already exists on this exact date {request.applicable_date}.",
        )
    current_holiday_by_date_and_name = get_holiday_by_year_and_name(
        request.applicable_date.year, request.name, db
    )
    if current_holiday_by_date_and_name and current_holiday_by_date_and_name.id != id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A holiday with name {request.name} is already present in year {request.applicable_date.year}",
        )
    current_locations_by_ids = get_location_by_ids(request.locations_ids, db)
    if len(current_locations_by_ids) != len(request.locations_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more of the provided location IDs are invalid.",
        )
    updated_holiday = update_db_holiday(
        current_holiday_by_id, request, current_locations_by_ids, db
    )
    return updated_holiday
