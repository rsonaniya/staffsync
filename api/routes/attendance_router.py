from calendar import monthrange
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from auth.oauth2 import get_current_user
from db.database import get_db
from db.db_attendance import (
    get_db_all_session_for_attendance,
    get_db_attendance_by_date,
    get_db_monthly_attendance_status,
    get_db_open_session_for_attendance,
    is_db_user_holiday,
)
from db.db_holiday import get_db_holidays_by_year_month_location_id
from db.db_shift import get_shift_by_id
from db.db_user import get_db_user_emp_details_by_userid
from db.models import AttendanceModel, AttendanceSessionModel, AttendanceStatusEnum
from schemas import (
    AttendanceCalendarResponse,
    AttendanceDayResponse,
    AttendanceToggleRequest,
    TodayAttendanceResponse,
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/toggle", response_model=TodayAttendanceResponse)
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
        # return attendance
        return {
            "applicable_date": today_local,
            "day_type": attendance.status,
            "is_clocked_in": True,
            "total_working_hours": attendance.total_working_hours,
            "current_session_start": new_session.clock_in,
        }
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
        # return attendance
        return {
            "applicable_date": today_local,
            "day_type": attendance.status,
            "is_clocked_in": False,  # They just clocked out
            "total_working_hours": attendance.total_working_hours,
            "current_session_start": None,  # Session is closed
        }
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
        # return attendance
        return {
            "applicable_date": today_local,
            "day_type": attendance.status,
            "is_clocked_in": True,
            "total_working_hours": attendance.total_working_hours,
            "current_session_start": new_session.clock_in,
        }


@router.get("/today", response_model=TodayAttendanceResponse)
def get_today_attendance(db=Depends(get_db), current_user=Depends(get_current_user)):
    now_utc = datetime.now(timezone.utc)
    user_tz_str = current_user.timezone or "UTC"
    user_zone = ZoneInfo(user_tz_str)
    now_local = now_utc.astimezone(user_zone)
    date_local = now_local.date()
    target_weekday = now_local.weekday()

    target_user_emp_details = get_db_user_emp_details_by_userid(current_user.id, db)

    if not target_user_emp_details or not target_user_emp_details.shift_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No shift assigned to this user.",
        )
    day_type = AttendanceStatusEnum.PRESENT
    is_holiday = is_db_user_holiday(db, date_local, target_user_emp_details.location_id)

    if is_holiday:
        day_type = AttendanceStatusEnum.HOLIDAY
    shift = get_shift_by_id(target_user_emp_details.shift_id, db)
    is_week_off = target_weekday not in shift.working_days
    if is_week_off:
        day_type = AttendanceStatusEnum.WEEK_OFF
    today_attendance = get_db_attendance_by_date(current_user.id, date_local, db)
    is_clocked_in = False
    total_working_hours = 0.0
    current_session_start = None
    if today_attendance:
        day_type = today_attendance.status
        total_working_hours = today_attendance.total_working_hours
        open_session = get_db_open_session_for_attendance(today_attendance.id, db)
        if open_session:
            is_clocked_in = True
            current_session_start = open_session.clock_in
    return {
        "applicable_date": date_local,
        "day_type": day_type,
        "is_clocked_in": is_clocked_in,
        "total_working_hours": total_working_hours,
        "current_session_start": current_session_start,
    }


@router.get("/calendar", response_model=list[AttendanceCalendarResponse])
def get_monthaly_attendance(
    year: int = Query(..., gt=2000, description="Year to fetch attendance for"),
    month: int = Query(..., ge=1, le=12, description="Month number (1-12)"),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    db_records = get_db_monthly_attendance_status(db, current_user.id, year, month)
    records_dict = {record.applicable_date: record.status for record in db_records}
    emp_details = get_db_user_emp_details_by_userid(current_user.id, db)
    shift = get_shift_by_id(emp_details.shift_id, db)
    holidays = get_db_holidays_by_year_month_location_id(
        year, month, emp_details.location_id, db
    )
    holiday_dict = {h.applicable_date: True for h in holidays}
    _, last_day = monthrange(year, month)
    calender_response = []
    for day in range(1, last_day + 1):
        current_date = date(year, month, day)
        if current_date in records_dict:
            calender_response.append(
                {"applicable_date": current_date, "status": records_dict[current_date]}
            )
        elif current_date in holiday_dict:
            calender_response.append(
                {
                    "applicable_date": current_date,
                    "status": AttendanceStatusEnum.HOLIDAY,
                }
            )
        elif current_date.weekday() not in shift.working_days:
            calender_response.append(
                {
                    "applicable_date": current_date,
                    "status": AttendanceStatusEnum.WEEK_OFF,
                }
            )
    return calender_response


@router.get("/detail/{applicable_date}", response_model=AttendanceDayResponse)
def get_attendance_by_day(
    applicable_date: date, db=Depends(get_db), current_user=Depends(get_current_user)
):
    attendance = get_db_attendance_by_date(current_user.id, applicable_date, db)
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No attendance record exists for this date.",
        )
    sessions = get_db_all_session_for_attendance(attendance.id, db)
    return {
        "id": attendance.id,
        "applicable_date": applicable_date,
        "status": attendance.status,
        "is_late": attendance.is_late,
        "total_working_hours": attendance.total_working_hours,
        "sessions": sessions,
    }
