from sqlalchemy import Column, String, Integer
from db.base import Base


class Calendar(Base):
    __tablename__ = "calendar"
    service_id = Column(String, primary_key=True, index=True)
    monday = Column(Integer, nullable=False)
    tuesday = Column(Integer, nullable=False)
    wednesday = Column(Integer, nullable=False)
    thursday = Column(Integer, nullable=False)
    friday = Column(Integer, nullable=False)
    saturday = Column(Integer, nullable=False)
    sunday = Column(Integer, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
