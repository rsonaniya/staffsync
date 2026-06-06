from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from auth.oauth2 import get_current_user
from db.database import get_db
from db.db_attendance import (
    get_db_attendance_by_date,
    get_db_open_session_for_attendance,
)
from db.db_shift import get_shift_by_id
from db.db_user import get_db_user_emp_details_by_userid
from db.models import AttendanceModel, AttendanceSessionModel, AttendanceStatusEnum
from schemas import AttendanceDayResponse, AttendanceToggleRequest

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/toggle", response_model=AttendanceDayResponse)
def toggle_attendance(
    request: Request,
    payload: AttendanceToggleRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    client_ip = request.headers.get("X-Forwarded-For")
    if not client_ip:
        client_ip = request.client.host
    device = payload.device_info or request.headers.get("User-Agent")
    user_tz_str = current_user.timezone or "UTC"
    user_zone = ZoneInfo(user_tz_str)
    now_utc = datetime.now(timezone.utc)
    now_local = now_utc.astimezone(user_zone)
    today_local = now_local.date()
    attendance = get_db_attendance_by_date(current_user.id, today_local, db)
    if not attendance:
        emp_details = get_db_user_emp_details_by_userid(current_user.id, db)
        if not emp_details or not emp_details.shift_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No shift assigned to this user.",
            )
        shift = get_shift_by_id(emp_details.shift_id, db)
        shift_start_local = datetime.combine(today_local, shift.start_time).replace(
            tzinfo=user_zone
        )
        grace_delta = timedelta(minutes=shift.grace_period_minutes)
        cut_off_time_local = shift_start_local + grace_delta
        is_late = now_local > cut_off_time_local
        attendance = AttendanceModel(
            user_id=current_user.id,
            applicable_date=today_local,
            status=AttendanceStatusEnum.PRESENT,
            is_late=is_late,
            total_working_hours=0.0,
        )
        db.add(attendance)
        db.commit()
        db.refresh(attendance)
        new_session = AttendanceSessionModel(
            attendance_id=attendance.id,
            clock_in=now_utc,
            ip_address=client_ip,
            device_info=device,
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return attendance
    open_session = get_db_open_session_for_attendance(attendance.id, db)
    if open_session:
        open_session.clock_out = now_utc
        duration = now_utc - open_session.clock_in
        hours_worked = duration.total_seconds() / 3600
        attendance.total_working_hours += hours_worked
        emp_details = get_db_user_emp_details_by_userid(current_user.id, db)
        shift = get_shift_by_id(emp_details.shift_id, db)
        shift_duration_hours = (
            datetime.combine(today_local, shift.end_time)
            - datetime.combine(today_local, shift.start_time)
        ).total_seconds() / 3600
        if attendance.total_working_hours >= (shift_duration_hours - 1):
            attendance.status = AttendanceStatusEnum.PRESENT
        else:
            attendance.status = AttendanceStatusEnum.HALF_DAY

        db.commit()
        db.refresh(attendance)
        return attendance
    else:
        attendance.status = AttendanceStatusEnum.PRESENT
        new_session = AttendanceSessionModel(
            attendance_id=attendance.id,
            clock_in=now_utc,
            ip_address=client_ip,
            device_info=device,
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return attendance
