"""
バス情報を提供するサービスモジュール
"""

import datetime
from typing import List, Dict, Any, Optional
from zoneinfo import ZoneInfo
import math
from pytz import timezone

from services.gtfs.static import GTFSStaticManager
from services.gtfs.realtime import GTFSRealtimeManager
from models.gtfs import BusNextArrival


class BusService:
    """バス情報を提供するサービスクラス"""

    def __init__(self):
        """初期化"""
        self.static_manager = GTFSStaticManager()
        self.realtime_manager = GTFSRealtimeManager()

    def _convert_time_to_seconds(self, time_str: str) -> int:
        """時刻文字列を秒数に変換"""
        hours, minutes, seconds = map(int, time_str.split(":"))
        return hours * 3600 + minutes * 60 + seconds

    def _convert_seconds_to_time(self, seconds: int) -> str:
        """秒数を時刻文字列に変換"""
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        seconds = seconds % 60
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

    def _normalize_stop_id(self, stop_id: str) -> str:
        """バス停IDのスペースをアンダーバーに変換"""
        return stop_id.replace(" ", "_")

    def _is_destination_match(self, stop_id: str, pattern: str) -> bool:
        """目的地のバス停IDがパターンにマッチするか確認"""
        # パターンが'_'で終わる場合は、その前までの部分が一致すればOK
        if pattern.endswith("_"):
            base_pattern = pattern[:-1]
            return stop_id.startswith(base_pattern)
        return stop_id == pattern

    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """2点間の距離をメートルで計算（ハバサイン公式）"""
        R = 6371000  # 地球の半径（メートル）
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = math.sin(delta_phi / 2) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c

    def _get_current_location(self, trip_id: str) -> Optional[str]:
        """バスの現在位置（最寄り停留所名）を取得"""
        # リアルタイム位置情報を取得
        position = self.realtime_manager.get_vehicle_position(trip_id)
        if position is None or position.latitude is None or position.longitude is None:
            return None

        # この便の経由停留所を取得
        trip_stops = self.static_manager.get_trip_stops(trip_id)
        if trip_stops.empty:
            return None

        # 最も近い停留所を探す
        min_distance = float('inf')
        nearest_stop_name = None

        for _, stop in trip_stops.iterrows():
            if stop["stop_lat"] is not None and stop["stop_lon"] is not None:
                distance = self._haversine_distance(
                    position.latitude, position.longitude,
                    float(stop["stop_lat"]), float(stop["stop_lon"])
                )
                if distance < min_distance:
                    min_distance = distance
                    nearest_stop_name = stop["stop_name"]

        return nearest_stop_name

    def get_next_buses(
        self, origin_stop_id: str, destination_stop_id: str, max_results: int = 5
    ) -> List[BusNextArrival]:
        """次のバスの到着時刻を取得"""
        # 出発地のバス停IDを正規化（完全一致）
        origin_stop_id = self._normalize_stop_id(origin_stop_id)
        # 目的地のバス停IDを正規化（カンマ区切りに対応）
        destination_patterns = [self._normalize_stop_id(dest.strip()) for dest in destination_stop_id.split(",")]

        # 現在時刻を取得
        now = datetime.datetime.now(ZoneInfo("Asia/Tokyo"))
        current_seconds = self._convert_time_to_seconds(now.strftime("%H:%M:%S"))

        # 静的データから便を取得（複数の目的地パターンに対応）
        trips_df = self.static_manager.get_trips_for_stop(
            origin_stop_id,
            destination_patterns,
            weekday=now.weekday(),
            is_destination_pattern=True,
        )

        # 結果を整形
        results = []
        for _, trip in trips_df.iterrows():
            # リアルタイムデータを取得
            realtime_info = self.realtime_manager.bus_realtime_data(
                trip["trip_id"], int(trip["stop_sequence_x"])
            )

            # 出発時刻を秒数に変換
            departure_seconds = self._convert_time_to_seconds(trip["arrival_time_x"])

            # 遅延を考慮した実際の出発時刻を計算
            delay_seconds = realtime_info.get("delay", 0) or 0
            actual_departure_seconds = departure_seconds + delay_seconds

            status = realtime_info.get("status", "出発待ち") or "出発待ち"

            # 現在時刻より後の便のみを対象とする
            if actual_departure_seconds >= current_seconds:
                remainning = math.floor(
                    (actual_departure_seconds - current_seconds) / 60
                )

                # 現在位置を取得
                current_location = self._get_current_location(trip["trip_id"])

                next_bus = BusNextArrival(
                    trip_id=trip["trip_id"],
                    route_name=trip["route_short_name_x"],
                    arrival_time=self._convert_seconds_to_time(departure_seconds),
                    status=status,
                    remaining=remainning,
                    trip_dest=trip["destination_stop_x"],
                    delay=math.ceil(delay_seconds / 60),
                    current_location=current_location,
                )
                results.append(next_bus)

        # 遅延を考慮した出発時刻でソートして指定された数の結果を返す
        return sorted(results, key=lambda x: x.arrival_time)[:max_results]

    def get_stop_name(self, stop_id: str) -> str:
        """バス停の名前を取得"""
        return self.static_manager.get_stop_name(stop_id)
