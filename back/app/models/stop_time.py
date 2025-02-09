from datetime import datetime
from sqlalchemy import Column, String, Integer, Time
from db.base import Base


class StopTime(Base):
    __tablename__ = "stop_times"
    trip_id = Column(String, primary_key=True)  # 便を識別します。
    arrival_time = Column(
        Time, nullable=False
    )  # 特定の便 (stop_times.trip_id で定義) の停留所 (stop_times.stop_id で定義) への到着時刻。
    departure_time = Column(
        Time, nullable=False
    )  # 特定の旅程 (stop_times.trip_id で定義) の停留所 (stop_times.stop_id で定義) からの出発時刻。
    stop_id = Column(String, nullable=False)  # 運行される停留所を識別します。
    stop_sequence = Column(
        Integer, primary_key=True
    )  # 特定の便の停留所、場所グループ、または GeoJSON の場所の順序。

    converters = {
        "arrival_time": lambda x: (
            datetime.strptime(x, "%H:%M:%S").time() if x else None
        ),
        "departure_time": lambda x: (
            datetime.strptime(x, "%H:%M:%S").time() if x else None
        ),
    }
