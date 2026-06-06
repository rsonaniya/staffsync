from sqlalchemy import and_
from sqlalchemy.orm import Session
from datetime import date

from db.models import AttendanceModel, AttendanceSessionModel


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
