from fastapi import APIRouter, Depends, HTTPException, status

from auth.oauth2 import get_current_user
from db.database import get_db
from db.db_leave_policy import get_db_leave_policy_by_id
from db.db_leave_policy_rule import (
    create_db_leave_policy_rule,
    delete_db_leave_policy_rule,
    get_db_all_leave_policy_rules,
    get_db_leave_policy_rule,
    update_db_leave_policy_rule,
)
from db.db_leave_type import get_leave_type_by_id
from db.models import UserRole
from schemas import LeavePolicyRuleCreateRequest, LeavePolicyRuleResponse

router = APIRouter(
    prefix="/admin/leave-policy-rules", tags=["Admin Leave Policy Rules Management"]
)


@router.post("/", response_model=LeavePolicyRuleResponse)
def create_leave_policy_rule(
    request: LeavePolicyRuleCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to create leave policy rule",
        )
    current_leave_type_by_id = get_leave_type_by_id(request.leave_type_id, db)
    if not current_leave_type_by_id or not current_leave_type_by_id.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"invalid leave type id {request.leave_type_id}",
        )
    current_leave_policy_by_id = get_db_leave_policy_by_id(request.leave_policy_id, db)
    if not current_leave_policy_by_id or not current_leave_policy_by_id.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"invalid leave policy id {request.leave_policy_id}",
        )
    new_leave_policy_rule = create_db_leave_policy_rule(request, db)
    return new_leave_policy_rule


@router.get("/", response_model=list[LeavePolicyRuleResponse])
def get_all_leave_policy_rules(
    db=Depends(get_db), current_user=Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to see internal policies",
        )
    return get_db_all_leave_policy_rules(db)


@router.get("/{id}", response_model=LeavePolicyRuleResponse)
def get_leave_policy_rules(
    id: int, db=Depends(get_db), current_user=Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to see internal policies",
        )
    return get_db_leave_policy_rule(id, db)


@router.put("/{id}", response_model=LeavePolicyRuleResponse)
def update_leave_policy_rule(
    id: int,
    request: LeavePolicyRuleCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to update leave policy rule",
        )
    current_leave_policy_rule = get_db_leave_policy_rule(id, db)
    current_leave_type_by_id = get_leave_type_by_id(request.leave_type_id, db)
    if not current_leave_type_by_id or not current_leave_type_by_id.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"invalid leave type id {request.leave_type_id}",
        )
    current_leave_policy_by_id = get_db_leave_policy_by_id(request.leave_policy_id, db)
    if not current_leave_policy_by_id or not current_leave_policy_by_id.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"invalid leave policy id {request.leave_policy_id}",
        )
    return update_db_leave_policy_rule(current_leave_policy_rule, request, db)


@router.delete("/{id}")
def delete_leave_rule_policy(
    id: int, db=Depends(get_db), current_user=Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"A user with Role {current_user.role.value} is not permitted to delete leave policy rule",
        )
    current_leave_policy_rule = get_db_leave_policy_rule(id, db)

    return delete_db_leave_policy_rule(current_leave_policy_rule, db)
