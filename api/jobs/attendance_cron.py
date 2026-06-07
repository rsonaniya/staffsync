from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import or_

from db.database import SessionLocal
from db.db_attendance import is_db_user_holiday
from db.models import (
    AccountStatus,
    AttendanceModel,
    AttendanceSessionModel,
    AttendanceStatusEnum,
    HolidayModel,
    ShiftModel,
    UserEmploymentDetailsModel,
    UserModel,
)


def run_nightly_attendance_reconciliation():
    db = SessionLocal()
    try:
        now_utc = datetime.now(timezone.utc)
        print(f"---Starting Nightly Attendance Reconciliation at {now_utc} UTC---")
        open_sesions = (
            db.query(AttendanceSessionModel)
            .filter(AttendanceSessionModel.clock_out == None)
            .all()
        )
        for session in open_sesions:
            session.clock_out = now_utc
            parent_attendance = session.attendance
            parent_attendance.status = AttendanceStatusEnum.ABSENT
        db.commit()
        active_users = (
            db.query(UserModel)
            .filter(UserModel.account_status == AccountStatus.ACTIVE)
            .all()
        )
        for user in active_users:
            user_tz_str = user.timezone or "UTC"
            user_zone = ZoneInfo(user_tz_str)
            now_local = now_utc.astimezone(user_zone)
            target_date = now_local.date()
            target_weekday = now_local.weekday()
            attendance_today = (
                db.query(AttendanceModel)
                .filter(
                    AttendanceModel.user_id == user.id,
                    AttendanceModel.applicable_date == target_date,
                )
                .first()
            )
            if not attendance_today:
                emp_details = (
                    db.query(UserEmploymentDetailsModel)
                    .filter(UserEmploymentDetailsModel.user_id == user.id)
                    .first()
                )
                if not emp_details:
                    continue
                shift = (
                    db.query(ShiftModel)
                    .filter(ShiftModel.id == emp_details.shift_id)
                    .first()
                )
                final_status = AttendanceStatusEnum.ABSENT
                if shift and (target_weekday not in shift.working_days):
                    final_status = AttendanceStatusEnum.WEEK_OFF
                else:
                    is_holiday = is_db_user_holiday(
                        db, target_date, emp_details.location_id
                    )
                    if is_holiday:
                        final_status = AttendanceStatusEnum.HOLIDAY
                missing_attendance = AttendanceModel(
                    user_id=user.id,
                    applicable_date=target_date,
                    status=final_status,
                    is_late=False,
                    total_working_hours=0.0,
                )
                db.add(missing_attendance)
        db.commit()
        print("---Nightly Reconciliation Complete---")

    except Exception as e:
        print(f"CRON ERROR {e}")
        db.rollback()
    finally:
        db.close()
