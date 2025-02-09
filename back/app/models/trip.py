from sqlalchemy import Column, String
from db.base import Base


class Trip(Base):
    __tablename__ = "trips"
    trip_id = Column(String, primary_key=True, index=True)
    route_id = Column(String, nullable=False)
    service_id = Column(String, nullable=False)
    trip_headsign = Column(String, nullable=True)
    direction_id = Column(String, nullable=True)
