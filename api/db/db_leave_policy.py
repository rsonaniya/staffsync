from sqlalchemy.orm import Session

from db.models import LeavePolicyModel
from schemas import LeavePolicyCreateRequest


def get_current_leave_policy_by_name(request: LeavePolicyCreateRequest, db: Session):
    return (
        db.query(LeavePolicyModel).filter(LeavePolicyModel.name == request.name).first()
    )


def create_db_leave_policy(request: LeavePolicyCreateRequest, db: Session):
    new_leave_policy = LeavePolicyModel(
        name=request.name, description=request.description, is_active=request.is_active
    )
    db.add(new_leave_policy)
    db.commit()
    db.refresh(new_leave_policy)
    return new_leave_policy


def get_all_db_leave_policies(db: Session):
    return db.query(LeavePolicyModel).all()


def get_db_leave_policy_by_id(id: int, db: Session):
    return db.query(LeavePolicyModel).filter(LeavePolicyModel.id == id).first()


def update_db_leave_policy(
    leave_policy: LeavePolicyModel, request: LeavePolicyCreateRequest, db: Session
):
    leave_policy.description = request.description
    leave_policy.name = request.name
    leave_policy.is_active = request.is_active
    db.commit()
    db.refresh(leave_policy)
    return leave_policy
