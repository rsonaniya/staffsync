from sqlalchemy.orm import Session

from db.models import ShiftModel
from schemas import ShiftCreateRequest


def get_shift_by_name(
    name: str, db: Session
):  # utility fn that we will user later for checming when edit as well
    return db.query(ShiftModel).filter(ShiftModel.name == name).first()


def get_shift_by_id(id: int, db: Session):
    return db.query(ShiftModel).filter(ShiftModel.id == id).first()


def create_db_shift(request: ShiftCreateRequest, db: Session):
    new_shift = ShiftModel(
        name=request.name,
        start_time=request.start_time,
        end_time=request.end_time,
        grace_period_minutes=request.grace_period_minutes,
        is_active=request.is_active,
        working_days=request.working_days,
    )
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return new_shift


def db_get_shifts(db: Session):
    return db.query(ShiftModel).all()


def update_db_shift(shift: ShiftModel, request: ShiftCreateRequest, db: Session):
    shift.name = request.name
    shift.start_time = request.start_time
    shift.end_time = request.end_time
    shift.grace_period_minutes = request.grace_period_minutes
    shift.is_active = request.is_active
    shift.working_days = request.working_days
    db.commit()
    return shift
