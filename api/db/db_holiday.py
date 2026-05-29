from datetime import date

from sqlalchemy import and_, extract
from sqlalchemy.orm import Session

from db.models import HolidayModel, LocationModel
from schemas import HolidayCreateRequest


def get_holiday_by_date(date: date, db: Session):
    return db.query(HolidayModel).filter(HolidayModel.applicable_date == date).first()


def get_holiday_by_id(id: int, db: Session):
    return db.query(HolidayModel).filter(HolidayModel.id == id).first()


def get_holiday_by_year_and_name(year: int, name: str, db: Session):
    return (
        db.query(HolidayModel)
        .filter(
            and_(
                extract("year", HolidayModel.applicable_date) == year,
                HolidayModel.name == name,
            )
        )
        .first()
    )


def create_db_holiday(
    request: HolidayCreateRequest, locations: list[LocationModel], db: Session
):
    new_holiday = HolidayModel(
        name=request.name,
        applicable_date=request.applicable_date,
        is_active=request.is_active,
        locations=locations,
    )
    db.add(new_holiday)
    db.commit()
    db.refresh(new_holiday)
    return new_holiday


def get_db_all_holidays(db: Session):
    return db.query(HolidayModel).all()


def update_db_holiday(
    holiday: HolidayModel,
    request: HolidayCreateRequest,
    locations: list[LocationModel],
    db: Session,
):
    holiday.name = request.name
    holiday.applicable_date = request.applicable_date
    holiday.is_active = request.is_active
    holiday.locations = locations

    db.commit()
    db.refresh(holiday)
    return holiday
