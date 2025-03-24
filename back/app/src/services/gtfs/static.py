"""
GTFS静的データを管理するモジュール
"""

import os
import shutil
import requests
import zipfile
import io
import pandas as pd
import datetime

from core.constants import GTFS_STATIC_URL, DATA_DIR, WEEKDAY_MAP


class GTFSStaticManager:
    """GTFS静的データを管理するクラス"""

    def __init__(self):
        """初期化"""
        os.makedirs(DATA_DIR, exist_ok=True)
        self.calendar_path = f"{DATA_DIR}/calendar.txt"
        self.gtfs_static_path = f"{DATA_DIR}/gtfs-static.csv"
        self._initialize_data()

    def _initialize_data(self) -> None:
        """データの初期化と検証"""
        if not os.path.exists(DATA_DIR):
            self.download_gtfs_files()
            self.generate_gtfs_data()
            return

        if not os.path.exists(self.calendar_path):
            self.download_gtfs_files()
            self.generate_gtfs_data()
            return

        if not os.path.exists(self.gtfs_static_path):
            self.generate_gtfs_data()
            return

        if self._is_calendar_expired():
            self.download_gtfs_files()
            self.generate_gtfs_data()

    def download_gtfs_files(self) -> None:
        """GTFS静的ファイルのダウンロードと解凍"""
        if os.path.exists(DATA_DIR):
            shutil.rmtree(DATA_DIR)
        os.makedirs(DATA_DIR)

        response = requests.get(GTFS_STATIC_URL)
        if response.status_code != 200:
            raise Exception(f"ダウンロード失敗: {response.status_code}")

        with io.BytesIO(response.content) as bytes_io:
            with zipfile.ZipFile(bytes_io) as zip_file:
                zip_file.extractall(DATA_DIR)

    def _is_calendar_expired(self) -> bool:
        """カレンダーの有効期限チェック"""
        try:
            calendar_df = pd.read_csv(self.calendar_path)
            if "end_date" not in calendar_df.columns:
                return True

            end_dates = calendar_df["end_date"].astype(str)
            today = datetime.datetime.now().strftime("%Y%m%d")
            return all(end_date < today for end_date in end_dates)
        except Exception:
            return True

    def get_stop_name(self, stop_id: str) -> str:
        """バス停IDから名前を取得"""
        stops_path = f"{DATA_DIR}/stops.txt"
        if not os.path.exists(stops_path):
            return ""

        try:
            stops_df = pd.read_csv(stops_path)
            match = stops_df[stops_df["stop_id"] == stop_id]
            if not match.empty:
                return match.iloc[0]["stop_name"]
            return ""
        except Exception:
            return ""

    def generate_gtfs_data(self) -> None:
        """GTFS静的データの生成"""
        stop_times = pd.read_csv(f"{DATA_DIR}/stop_times.txt")
        stop_times["stop_id"] = stop_times["stop_id"].str.replace(" ", "_")
        print(stop_times)
        trips = pd.read_csv(f"{DATA_DIR}/trips.txt")
        calendar = pd.read_csv(f"{DATA_DIR}/calendar.txt")
        routes = pd.read_csv(f"{DATA_DIR}/routes.txt")
        routes_jp = pd.read_csv(f"{DATA_DIR}/routes_jp.txt")

        # データの結合と加工処理
        merged_data = pd.merge(stop_times, trips, on="trip_id")
        merged_data = pd.merge(merged_data, calendar, on="service_id")
        merged_data = pd.merge(merged_data, routes, on="route_id")
        merged_data = pd.merge(merged_data, routes_jp, on="route_id")

        merged_data.to_csv(self.gtfs_static_path, index=False)

    def get_trips_for_stop(
        self,
        origin_stop_id: str,
        destination_pattern: str,
        weekday: int,
        is_destination_pattern: bool = False,
    ) -> pd.DataFrame:
        """指定されたバス停間の便を取得"""
        df = pd.read_csv(self.gtfs_static_path)
        df = df[df[WEEKDAY_MAP.get(weekday)] == 1]

        # 出発バス停の便を抽出（完全一致）
        origin_trips = df[df["stop_id"] == origin_stop_id]

        # 目的地バス停の便を抽出（パターンマッチング）
        if is_destination_pattern and destination_pattern.endswith("_"):
            base_pattern = destination_pattern[:-1]
            dest_trips = df[df["stop_id"].str.startswith(base_pattern)]
        else:
            dest_trips = df[df["stop_id"] == destination_pattern]

        # 同一便のみを抽出
        valid_trips = pd.merge(origin_trips, dest_trips, on="trip_id")

        # 出発バス停が到着バス停より前にある便のみを抽出
        valid_trips = valid_trips[
            valid_trips["stop_sequence_x"] < valid_trips["stop_sequence_y"]
        ]

        return valid_trips.sort_values(by="arrival_time_x")
