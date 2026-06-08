from sqlalchemy import and_, extract, or_
from sqlalchemy.orm import Session
from datetime import date

from db.models import AttendanceModel, AttendanceSessionModel, HolidayModel


def get_db_attendance_by_date(user_id: int, target_date: date, db: Session):
    return (
        db.query(AttendanceModel)
        .filter(
            and_(
                AttendanceModel.applicable_date == target_date,
                AttendanceModel.user_id == user_id,
            )
        )
        .first()
    )


def get_db_open_session_for_attendance(attendance_id: int, db: Session):
    return (
        db.query(AttendanceSessionModel)
        .filter(
            and_(
                AttendanceSessionModel.attendance_id == attendance_id,
                AttendanceSessionModel.clock_out == None,
            )
        )
        .first()
    )


def is_db_user_holiday(db: Session, target_date: date, location_id: int):
    return (
        db.query(HolidayModel)
        .filter(
            HolidayModel.applicable_date == target_date,
            or_(
                HolidayModel.locations.any(id=location_id),
                ~HolidayModel.locations.any(),
            ),
        )
        .first()
    )


def get_db_monthly_attendance_status(
    db: Session, target_user_id: int, year: int, month: int
):
    return (
        db.query(AttendanceModel)
        .filter(
            AttendanceModel.user_id == target_user_id,
            extract("month", AttendanceModel.applicable_date) == month,
            extract("year", AttendanceModel.applicable_date) == year,
        )
        .all()
    )


def get_db_all_session_for_attendance(attendance_id: int, db: Session):
    return (
        db.query(AttendanceSessionModel)
        .filter(AttendanceSessionModel.attendance_id == attendance_id)
        .all()
    )
