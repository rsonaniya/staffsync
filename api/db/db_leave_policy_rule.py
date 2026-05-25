from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db.models import LeavePolicyRuleModel
from schemas import LeavePolicyRuleCreateRequest


def create_db_leave_policy_rule(request: LeavePolicyRuleCreateRequest, db: Session):
    new_leave_policy_rule = LeavePolicyRuleModel(
        leave_policy_id=request.leave_policy_id,
        leave_type_id=request.leave_type_id,
        allowance=request.allowance,
        credit_frequency=request.credit_frequency,
        is_paid=request.is_paid,
    )
    try:
        db.add(new_leave_policy_rule)
        db.commit()
        db.refresh(new_leave_policy_rule)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A leave policy with the exact same leave type and policy exists",
        )
    return new_leave_policy_rule


def get_db_all_leave_policy_rules(db: Session):
    return db.query(LeavePolicyRuleModel).all()


def get_db_leave_policy_rule(id: int, db: Session):
    leave_policy_rule = (
        db.query(LeavePolicyRuleModel).filter(LeavePolicyRuleModel.id == id).first()
    )
    if not leave_policy_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"no leave policy rule found with id {id}",
        )

    return leave_policy_rule


def update_db_leave_policy_rule(
    leave_policy_rule: LeavePolicyRuleModel,
    request: LeavePolicyRuleCreateRequest,
    db: Session,
):
    try:
        leave_policy_rule.leave_policy_id = request.leave_policy_id
        leave_policy_rule.leave_type_id = request.leave_type_id
        leave_policy_rule.allowance = request.allowance
        leave_policy_rule.credit_frequency = request.credit_frequency
        leave_policy_rule.is_paid = request.is_paid
        db.commit()
        db.refresh(leave_policy_rule)
        return leave_policy_rule
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A leave policy with the exact same leave type and policy exists",
        )


def delete_db_leave_policy_rule(leave_policy_rule: LeavePolicyRuleModel, db: Session):
    db.delete(leave_policy_rule)
    db.commit()
    return {"message": "Leave policy rule deleted successfully"}
