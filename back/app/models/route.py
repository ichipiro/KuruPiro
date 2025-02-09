from sqlalchemy import Column, String, Integer
from db.base import Base


class Route(Base):
    __tablename__ = "routes"
    route_id = Column(String, primary_key=True, index=True)
    route_short_name = Column(String, nullable=False)
    route_long_name = Column(String, nullable=True)
    route_type = Column(Integer, nullable=False)
