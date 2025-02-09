from sqlalchemy import Column, String, Float
from db.base import Base


class Stop(Base):
    __tablename__ = "stops"
    stop_id = Column(String, primary_key=True, index=True)
    stop_name = Column(String, nullable=False)
    stop_lat = Column(Float, nullable=False)
    stop_lon = Column(Float, nullable=False)
