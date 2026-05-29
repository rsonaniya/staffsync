from sqlalchemy.orm import Session

from db.models import LocationModel
from schemas import LocationCreateRequest


def get_db_location_by_name(name: str, db: Session):
    return db.query(LocationModel).filter(LocationModel.name == name).first()


def get_db_location_by_id(id: int, db: Session):
    return db.query(LocationModel).filter(LocationModel.id == id).first()


def create_db_location(request: LocationCreateRequest, db: Session):
    new_location = LocationModel(
        name=request.name,
        city=request.city,
        address=request.address,
        state=request.state,
        country=request.country,
        timezone=request.timezone,
        is_active=request.is_active,
    )
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location


def update_db_location(
    location: LocationModel, request: LocationCreateRequest, db: Session
):
    location.name = request.name
    location.city = request.city
    location.address = request.address
    location.state = request.state
    location.country = request.country
    location.timezone = request.timezone
    location.is_active = request.is_active
    db.commit()
    db.refresh(location)
    return location


def get_all_db_locations(db: Session):
    return db.query(LocationModel).all()


def get_location_by_ids(ids: list[int], db: Session) -> list[LocationModel]:
    return db.query(LocationModel).filter(LocationModel.id.in_(ids)).all()
