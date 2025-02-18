from sqlalchemy import Column, String, Integer
from db.base import Base


class CalendarDate(Base):
    __tablename__ = "calendar_dates"
    service_id = Column(String, primary_key=True)
    date = Column(String, primary_key=True)
    exception_type = Column(Integer, nullable=False)
