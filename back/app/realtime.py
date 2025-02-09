import datetime
import time
import requests
from threading import Lock
from google.transit import gtfs_realtime_pb2
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class StopTimeUpdateData:
    stop_id: str
    time: Optional[int]
    delay: Optional[int]
    stop_sequence: int


@dataclass
class TripUpdateData:
    trip_id: Optional[str]
    stop_times: List[StopTimeUpdateData] = field(default_factory=list)


@dataclass
class PositionData:
    latitude: Optional[float]
    longitude: Optional[float]
    bearing: Optional[float]


@dataclass
class VehiclePositionData:
    trip_id: Optional[str]
    vehicle_id: Optional[str]
    position: PositionData


@dataclass
class InformedEntityData:
    trip_id: Optional[str]
    route_id: Optional[str]


@dataclass
class AlertData:
    informed_entities: List[InformedEntityData] = field(default_factory=list)
    header_text: Optional[str] = None


@dataclass
class GTFSRealtimeData:
    trip_updates: List[TripUpdateData] = field(default_factory=list)
    vehicle_positions: List[VehiclePositionData] = field(default_factory=list)
    alerts: List[AlertData] = field(default_factory=list)


class GTFSRealtimeCache:
    def __init__(self, url: str, update_interval: int = 15):
        self.url = url.rstrip("/")
        self.update_interval = update_interval
        self.data: Optional[GTFSRealtimeData] = None
        self.last_update = 0  # 最後に更新した時間
        self.lock = Lock()  # 排他制御

    def _fetch_data(self):
        endpoints = {
            "trip_update": "trip_updates.bin",
            "vehicle_position": "vehicle_position.bin",
            "alert": "alerts.bin",
        }
        raw_feeds = {}
        for key, endpoint in endpoints.items():
            url = f"{self.url}/{endpoint}"
            response = requests.get(url)
            if response.status_code != 200:
                raise Exception(f"Failed to fetch realtime data from {url}")
            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)
            raw_feeds[key] = feed

        self.last_update = time.time()
        self.data = self._format_feeds(raw_feeds)
        print(
            f"GTFS Realtimeデータを{datetime.datetime.fromtimestamp(self.last_update)}に取得しました。"
        )

    def _format_feeds(self, feeds: dict) -> GTFSRealtimeData:
        realtime_data = GTFSRealtimeData()
        for feed in feeds.values():
            if feed is not None:
                for entity in feed.entity:
                    if entity.HasField("trip_update"):
                        tu = entity.trip_update
                        trip_update = TripUpdateData(
                            trip_id=tu.trip.trip_id if tu.trip else None
                        )
                        for st in tu.stop_time_update:
                            delay = None
                            if st.departure.HasField("delay"):
                                delay = st.departure.delay
                            elif st.arrival.HasField("delay"):
                                delay = st.arrival.delay
                            else:
                                delay = None

                            time = None
                            if st.arrival.HasField("time"):
                                time = st.arrival.time
                            elif st.departure.HasField("time"):
                                time = st.departure.time
                            else:
                                time = None

                            stop_time = StopTimeUpdateData(
                                stop_id=st.stop_id,
                                time=time,
                                delay=delay,
                                stop_sequence=st.stop_sequence,
                            )
                            trip_update.stop_times.append(stop_time)
                        realtime_data.trip_updates.append(trip_update)
                    elif entity.HasField("vehicle"):
                        vp = entity.vehicle
                        pos = vp.position
                        position = PositionData(
                            latitude=pos.latitude if pos else None,
                            longitude=pos.longitude if pos else None,
                            bearing=(
                                pos.bearing
                                if (pos and pos.HasField("bearing"))
                                else None
                            ),
                        )
                        vehicle_position = VehiclePositionData(
                            trip_id=(
                                vp.trip.trip_id
                                if (vp.trip and vp.trip.trip_id)
                                else None
                            ),
                            vehicle_id=(
                                vp.vehicle.id
                                if (vp.vehicle and vp.vehicle.id)
                                else None
                            ),
                            position=position,
                        )
                        realtime_data.vehicle_positions.append(vehicle_position)
                    elif entity.HasField("alert"):
                        al = entity.alert
                        alert = AlertData()
                        for ie in al.informed_entity:
                            informed = InformedEntityData(
                                trip_id=(
                                    ie.trip.trip_id
                                    if (ie.trip and ie.trip.trip_id)
                                    else None
                                ),
                                route_id=(
                                    ie.trip.route_id
                                    if (ie.trip and ie.trip.route_id)
                                    else None
                                ),
                            )
                            alert.informed_entities.append(informed)
                        if al.header_text.translation:
                            alert.header_text = al.header_text.translation[0].text
                        realtime_data.alerts.append(alert)
                    else:
                        raise ValueError(
                            "Unexpected entity type encountered. Only TripUpdate, VehiclePosition, and Alert are supported."
                        )
        return realtime_data

    def get_data(self) -> GTFSRealtimeData:
        with self.lock:
            if (
                self.last_update == 0
                or time.time() - self.last_update >= self.update_interval
            ):
                self._fetch_data()
            return self.data

    def get_data_by_trip_id(self, trip_id: str) -> GTFSRealtimeData:
        data = self.get_data()
        filtered = GTFSRealtimeData(
            trip_updates=[tu for tu in data.trip_updates if tu.trip_id == trip_id],
            vehicle_positions=[
                vp for vp in data.vehicle_positions if vp.trip_id == trip_id
            ],
            alerts=[],
        )
        return filtered


URL = "https://ajt-mobusta-gtfs.mcapps.jp/realtime/8"
gtfs_realtime_cache = GTFSRealtimeCache(URL)
