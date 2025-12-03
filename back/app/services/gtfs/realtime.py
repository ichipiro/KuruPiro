import datetime
import time
import requests
from threading import Lock
from google.transit import gtfs_realtime_pb2
from typing import Any, Dict, Optional

from models.gtfs import (
    AlertData,
    GTFSRealtimeData,
    InformedEntityData,
    PositionData,
    PositionData,
    StopTimeUpdateData,
    TripUpdateData,
    VehiclePositionData,
)
from core.constants import GTFS_REALTIME_URL


class GTFSRealtimeManager:
    def __init__(self, update_interval: int = 15):
        self.url = GTFS_REALTIME_URL
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

    def get_delay_info(
        self,
        realtime_data: GTFSRealtimeData,
        trip_id: str,
        stop_sequence: Optional[int] = None,
    ) -> Dict[str, Optional[int]]:
        """
        リアルタイムデータから遅延情報を取得
        """
        result = {"delay": None, "time": None}

        # データがない場合は早期リターン
        if not realtime_data or not realtime_data.trip_updates:
            return result

        for trip_update in realtime_data.trip_updates:
            if trip_update.trip_id == trip_id and trip_update.stop_times:

                if stop_sequence is not None:
                    for stop_time in trip_update.stop_times:
                        if stop_time.stop_sequence == stop_sequence:

                            result["delay"] = stop_time.delay
                            result["time"] = stop_time.time
                            return result

                    # 同じシーケンス番号が見つからない場合は、それ以降の最も近いもの
                    closest_stop = None
                    min_diff = float("inf")

                    for stop_time in trip_update.stop_times:
                        if stop_time.stop_sequence > stop_sequence:
                            diff = stop_time.stop_sequence - stop_sequence
                            if diff < min_diff:
                                min_diff = diff
                                closest_stop = stop_time

                    if closest_stop:
                        result["delay"] = closest_stop.delay
                        result["time"] = closest_stop.time
                        return result
                else:
                    for stop_time in trip_update.stop_times:
                        if stop_time.delay is not None:
                            result["delay"] = stop_time.delay
                            result["time"] = stop_time.time
                            return result
                    for stop_time in trip_update.stop_times:
                        if stop_time.time is not None:
                            result["time"] = stop_time.time
                            return result

        return result

    def get_vehicle_position(self, trip_id: str) -> Optional[PositionData]:
        """trip_idからバスの現在位置を取得"""
        data = self.get_data()
        for vp in data.vehicle_positions:
            if vp.trip_id == trip_id:
                return vp.position
        return None

    def bus_realtime_data(
        self, trip_id: str, stop_sequence: Optional[int] = None
    ) -> Dict[str, Any]:
        # リアルタイムデータを取得
        realtime_data = self.get_data_by_trip_id(trip_id)

        # 結果を格納する辞書
        result = {
            "delay": 0,
            "time": None,
            "current_stop": None,
            "status": "出発待ち",
        }

        # データがない場合は早期リターン
        if not realtime_data:
            return result

        # 遅延情報を取得
        delay_info = self.get_delay_info(realtime_data, trip_id, stop_sequence)
        if delay_info["delay"] is not None:
            result["delay"] = delay_info["delay"]
            result["status"] = "運行中"
        if delay_info["time"] is not None:
            result["time"] = delay_info["time"]
            result["status"] = "運行中"

        return result
