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
from functools import wraps

from core.constants import GTFS_STATIC_URL, DATA_DIR, WEEKDAY_MAP


def check_expiration(func):
    """関数実行前に有効期限をチェックするデコレータ"""

    @wraps(func)
    def wrapper(self, *args, **kwargs):
        # データの有効期限をチェック
        if self._is_calendar_expired():
            self.download_gtfs_files()
            self.generate_gtfs_data()
            self._load_data()
        return func(self, *args, **kwargs)

    return wrapper


class GTFSStaticManager:
    """GTFS静的データを管理するクラス"""

    def __init__(self):
        """初期化"""
        os.makedirs(DATA_DIR, exist_ok=True)
        self.calendar_path = f"{DATA_DIR}/calendar.txt"
        self.stops_path = f"{DATA_DIR}/stops.txt"

        # データフレームをメモリに保持するためのプロパティ
        self._gtfs_df = None
        self._stops_df = None
        self._calendar_df = None

        # データの初期化と読み込み
        self._initialize_data()

    def _initialize_data(self) -> None:
        """データの初期化と検証"""
        if not os.path.exists(DATA_DIR):
            self.download_gtfs_files()
            self.generate_gtfs_data()
        elif not os.path.exists(self.calendar_path):
            self.download_gtfs_files()
            self.generate_gtfs_data()
        else:
            # 必要なデータをメモリに読み込む
            self.generate_gtfs_data()

        if self._is_calendar_expired():
            self.download_gtfs_files()
            self.generate_gtfs_data()

        # データをメモリに読み込む
        self._load_data()

    def _load_data(self) -> None:
        """必要なCSVファイルをデータフレームとしてメモリに読み込む"""
        try:
            if os.path.exists(self.stops_path):
                self._stops_df = pd.read_csv(self.stops_path)

            if os.path.exists(self.calendar_path):
                self._calendar_df = pd.read_csv(self.calendar_path)

            # GTFSデータは既にメモリ上にあるか、generate_gtfs_dataで生成される
        except Exception as e:
            print(f"データ読み込みエラー: {e}")
            # エラー時は空のデータフレームを用意
            self._gtfs_df = pd.DataFrame()
            self._stops_df = pd.DataFrame()
            self._calendar_df = pd.DataFrame()

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
            # メモリ上のデータを使用するが、なければファイルから読み込む
            if self._calendar_df is None and os.path.exists(self.calendar_path):
                self._calendar_df = pd.read_csv(self.calendar_path)

            if self._calendar_df is None or "end_date" not in self._calendar_df.columns:
                return True

            end_dates = self._calendar_df["end_date"].astype(str)
            today = datetime.datetime.now().strftime("%Y%m%d")
            return all(end_date < today for end_date in end_dates)
        except Exception:
            return True

    @check_expiration
    def get_stop_name(self, stop_id: str) -> str:
        """バス停IDから名前を取得"""
        if self._stops_df is None or self._stops_df.empty:
            return ""

        try:
            match = self._stops_df[self._stops_df["stop_id"] == stop_id]
            if not match.empty:
                return match.iloc[0]["stop_name"]
            return ""
        except Exception:
            return ""

    @check_expiration
    def get_all_stops(self) -> pd.DataFrame:
        """全停留所情報を取得"""
        if self._stops_df is None or self._stops_df.empty:
            return pd.DataFrame()
        return self._stops_df

    @check_expiration
    def get_trip_stops(self, trip_id: str) -> pd.DataFrame:
        """指定されたtrip_idの経由停留所を順番に取得"""
        if self._gtfs_df is None or self._gtfs_df.empty:
            return pd.DataFrame()
        
        df = self._gtfs_df
        trip_stops = df[df["trip_id"] == trip_id].sort_values("stop_sequence")
        
        if trip_stops.empty:
            return pd.DataFrame()
        
        # stops_dfと結合して停留所名と座標を取得
        # stop_idの形式を合わせる（アンダースコアをスペースに変換）
        if self._stops_df is not None and not self._stops_df.empty:
            trip_stops = trip_stops.copy()
            trip_stops["stop_id_space"] = trip_stops["stop_id"].str.replace("_", " ")
            trip_stops = pd.merge(
                trip_stops,
                self._stops_df[["stop_id", "stop_name", "stop_lat", "stop_lon"]],
                left_on="stop_id_space",
                right_on="stop_id",
                how="left",
                suffixes=("", "_stops")
            )
        
        return trip_stops[["stop_id", "stop_name", "stop_sequence", "stop_lat", "stop_lon", "arrival_time"]]

    def generate_gtfs_data(self) -> None:
        """GTFS静的データの生成"""
        try:
            stop_times = pd.read_csv(f"{DATA_DIR}/stop_times.txt")
            stop_times["stop_id"] = stop_times["stop_id"].str.replace(" ", "_")
            trips = pd.read_csv(f"{DATA_DIR}/trips.txt")
            calendar = pd.read_csv(f"{DATA_DIR}/calendar.txt")
            routes = pd.read_csv(f"{DATA_DIR}/routes.txt")
            routes_jp = pd.read_csv(f"{DATA_DIR}/routes_jp.txt")

            # データの結合と加工処理
            merged_data = pd.merge(stop_times, trips, on="trip_id")
            merged_data = pd.merge(merged_data, calendar, on="service_id")
            merged_data = pd.merge(merged_data, routes, on="route_id")
            merged_data = pd.merge(merged_data, routes_jp, on="route_id")

            # メモリ上のデータを更新
            self._gtfs_df = merged_data
            self._calendar_df = calendar
        except Exception as e:
            print(f"GTFS静的データ生成エラー: {e}")

    @check_expiration
    def get_trips_for_stop(
        self,
        origin_stop_id: str,
        destination_patterns,
        weekday: int,
        is_destination_pattern: bool = False,
    ) -> pd.DataFrame:
        """指定されたバス停間の便を取得（複数の目的地パターンに対応）"""
        if self._gtfs_df is None or self._gtfs_df.empty:
            return pd.DataFrame()

        # destination_patternsが文字列の場合はリストに変換（後方互換性）
        if isinstance(destination_patterns, str):
            destination_patterns = [destination_patterns]

        df = self._gtfs_df
        df = df[df[WEEKDAY_MAP.get(weekday)] == 1]

        # 出発バス停の便を抽出（完全一致）
        origin_trips = df[df["stop_id"] == origin_stop_id]

        # 複数の目的地パターンに対応
        all_valid_trips = []
        for destination_pattern in destination_patterns:
            # 目的地バス停の便を抽出
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

            all_valid_trips.append(valid_trips)

        # 全ての結果を結合
        if all_valid_trips:
            combined_trips = pd.concat(all_valid_trips, ignore_index=True)
            # 重複を削除（同じtrip_idが複数の目的地パターンにマッチする場合）
            combined_trips = combined_trips.drop_duplicates(subset=["trip_id", "stop_sequence_x"])
            return combined_trips.sort_values(by="arrival_time_x")

        return pd.DataFrame()
