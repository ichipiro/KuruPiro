from sqlalchemy import Column, String, Integer
from db.base import Base


class RouteJP(Base):
    __tablename__ = "routes_jp"
    route_id = Column(String, primary_key=True, index=True)
    route_update_date = Column(String, nullable=True)
    origin_stop = Column(String, nullable=False)
    via_stop = Column(String, nullable=True)
    destination_stop = Column(String, nullable=False)
    jp_parent_route_id = Column(String, nullable=False)
