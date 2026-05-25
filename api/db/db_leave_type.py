from sqlalchemy import or_
from sqlalchemy.orm import Session

from db.models import LeaveTypeModel
from schemas import LeaveTypeCreateRequest


def get_leave_type_by_name_or_code(request: LeaveTypeCreateRequest, db: Session):
    return (
        db.query(LeaveTypeModel)
        .filter(
            or_(
                LeaveTypeModel.code == request.code, LeaveTypeModel.name == request.name
            )
        )
        .first()
    )


def get_leave_type_by_id(id: int, db: Session):
    return db.query(LeaveTypeModel).filter(LeaveTypeModel.id == id).first()


def create_db_leave_type(request: LeaveTypeCreateRequest, db: Session):
    new_leave_type = LeaveTypeModel(
        code=request.code,
        description=request.description,
        is_active=request.is_active,
        name=request.name,
    )
    db.add(new_leave_type)
    db.commit()
    db.refresh(new_leave_type)
    return new_leave_type


def get_all_db_leave_types(db: Session):
    return db.query(LeaveTypeModel).all()


def update_db_leave_type(
    leave_type: LeaveTypeModel, request: LeaveTypeCreateRequest, db: Session
):
    leave_type.code = request.code
    leave_type.description = request.description
    leave_type.name = request.name
    leave_type.is_active = request.is_active
    db.commit()
    db.refresh(leave_type)
    return leave_type
