import time
from fastapi import APIRouter, Depends, HTTPException, Query
import jpholiday
from sqlalchemy.orm import Session, aliased
from datetime import datetime
from models.route_jp import RouteJP
from models.stop import Stop
from models.route import Route
from models.trip import Trip
from db.session import SessionLocal
from models.stop_time import StopTime
from sqlalchemy import func
from zoneinfo import ZoneInfo
from models.calendar import Calendar
from realtime import gtfs_realtime_cache

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def normalize_stop_id(stop_id: str) -> str:
    return stop_id.split("_")[0]


WEEKDAY_COLUMN = {
    0: "monday",
    1: "tuesday",
    2: "wednesday",
    3: "thursday",
    4: "friday",
    5: "saturday",
    6: "sunday",
}


@router.get("/next-buses", tags=["Next Buses"])
def get_next_buses(
    from_stop_id: str,
    to_stop_id: str,
    normalized: bool = Query(
        True, description="Trueの場合、stop_idのアンダースコア前の部分だけで比較する"
    ),
    db: Session = Depends(get_db),
):

    from_stop_id = from_stop_id.replace(
        "_", " "
    )  # DB上ではstop_idの区切りはアンダースコアではなく空白なので置換

    now = datetime.now(ZoneInfo("Asia/Tokyo"))
    weekday = now.weekday()
    current_time = now.time()

    # 日本で休みなのに曜日が土日じゃない場合、祝日と判定して日曜日に置換
    if jpholiday.is_holiday(now.date()) and weekday < 5:
        weekday = 6

    weekday_column = WEEKDAY_COLUMN.get(weekday)

    if normalized:
        normalized_to = normalize_stop_id(to_stop_id)

        # 出発点を通過し、その到着時刻が現在時刻より後のStopTime
        origin_subq = (
            db.query(StopTime)
            .filter(StopTime.stop_id == from_stop_id)
            .filter(StopTime.departure_time >= current_time)
            .subquery()
        )

        origin_alias = aliased(StopTime, origin_subq)

        # 曜日的に今日運行しているTrip
        trip_calendar_subq = (
            db.query(Trip.trip_id)
            .join(Calendar, Trip.service_id == Calendar.service_id)
            .filter(getattr(Calendar, weekday_column) == 1)
            .subquery()
        )

        query = (
            db.query(StopTime, origin_alias, Route)
            .join(origin_subq, StopTime.trip_id == origin_alias.trip_id)
            .join(trip_calendar_subq, StopTime.trip_id == trip_calendar_subq.c.trip_id)
            .join(Trip, StopTime.trip_id == Trip.trip_id)
            .join(Route, Trip.route_id == Route.route_id)
            .filter(func.split_part(StopTime.stop_id, " ", 1) == normalized_to)
            .filter(StopTime.stop_sequence > origin_alias.stop_sequence)
            .order_by(origin_alias.departure_time.asc())
            .limit(5)
        )
    else:
        origin_subq = (
            db.query(StopTime)
            .filter(StopTime.stop_id == from_stop_id)
            .filter(StopTime.departure_time >= current_time)
            .subquery()
        )

        origin_alias = aliased(StopTime, origin_subq)

        trip_calendar_subq = (
            db.query(Trip.trip_id)
            .join(Calendar, Trip.service_id == Calendar.service_id)
            .filter(getattr(Calendar, weekday_column) == 1)
            .subquery()
        )

        query = (
            db.query(StopTime, origin_alias, Route)
            .join(origin_subq, StopTime.trip_id == origin_alias.trip_id)
            .join(trip_calendar_subq, StopTime.trip_id == trip_calendar_subq.c.trip_id)
            .join(Trip, StopTime.trip_id == Trip.trip_id)
            .join(Route, Trip.route_id == Route.route_id)
            .filter(StopTime.stop_id == to_stop_id)
            .filter(StopTime.stop_sequence > origin_alias.stop_sequence)
            .order_by(origin_alias.departure_time.asc())
            .limit(5)
        )

    results = query.all()

    if not results:
        raise HTTPException(status_code=404, detail="バス無し")

    response = []
    for stop_time, origin_stop_time, route in results:
        realtime = gtfs_realtime_cache.get_data_by_trip_id(
            origin_stop_time.trip_id
        )  # 現在のtrip_idでのリアルタイムデータ
        realtime_stop_time = None  # origin_stop_timeのバス停のリアルタイム情報
        passed_latest_stop = None  # 通過した最新のバス停

        if len(realtime.trip_updates) > 0:
            realtime_stop_time = next(
                (
                    st
                    for st in realtime.trip_updates[0].stop_times
                    if st.stop_sequence == origin_stop_time.stop_sequence
                ),
                None,
            )

            # リアルタイム情報の中で一番stop_sequenceが小さいものを取得
            # GTFSRealtimeでは通過したデータは来ない -> 直近消えてるデータを求めることで通過した場所が分かる
            candidate = None
            for st in realtime.trip_updates[0].stop_times:
                if st.time and st.stop_sequence:
                    if candidate is None or st.stop_sequence < candidate.stop_sequence:
                        candidate = st

            if candidate:
                if candidate.stop_sequence <= origin_stop_time.stop_sequence:
                    # stop_sequenceとtrip_idをもとにバス停のオブジェクトを取得
                    passed_latest_stop = (
                        db.query(Stop)
                        .join(StopTime, StopTime.stop_id == Stop.stop_id)
                        .filter(StopTime.trip_id == origin_stop_time.trip_id)
                        .filter(StopTime.stop_sequence == candidate.stop_sequence - 1)
                        .first()
                    )

        # ルート番号の整形
        route_number = ""
        if route.route_short_name:
            route_number += str(route.route_short_name)
        if route.route_type:
            route_number += "-" + str(route.route_type)

        # スケジュール通りのバス到着時間
        static_time = None
        if origin_stop_time.arrival_time:
            static_time = origin_stop_time.arrival_time
        elif origin_stop_time.departure_time:
            static_time = origin_stop_time.departure_time

        # 遅延情報
        delay = ""
        if realtime_stop_time:
            if realtime_stop_time.delay > 0:
                delay = str((realtime_stop_time.delay // 60) + 1) + "分遅れ"

        # 現在位置
        current_locate = ""
        if passed_latest_stop:
            current_locate = passed_latest_stop.stop_name

        # 目的地
        trip_dest = ""
        route_info = ""
        route_jp = db.query(RouteJP).filter(RouteJP.route_id == route.route_id).first()
        if route_jp:
            trip_dest = route_jp.destination_stop
            route_info = route_jp.jp_parent_route_id

        response.append(
            {
                "trip_id": route_number,
                "trip_dest": trip_dest,
                "arrival_time": static_time,
                "delay": delay,
                "current_locate": current_locate,
                "route_info": route_info,
            }
        )

    return {"next_buses": response}
