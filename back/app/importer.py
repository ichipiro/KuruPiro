import os
import csv
import shutil
import requests
import zipfile

from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from models.route_jp import RouteJP
from db.session import SessionLocal
from core.config import settings
from models.stop import Stop
from models.route import Route
from models.trip import Trip
from models.stop_time import StopTime
from models.calendar import Calendar
from models.calendar_date import CalendarDate

# CSVファイル名とモデルの対応マッピング
CSV_MODEL_MAPPING = {
    "stops.txt": Stop,
    "routes.txt": Route,
    "routes_jp.txt": RouteJP,
    "trips.txt": Trip,
    "stop_times.txt": StopTime,
    "calendar.txt": Calendar,
    "calendar_dates.txt": CalendarDate,
}


def import_csv_for_model(session: Session, model, filepath: str) -> None:

    def process_csv_row(row: dict, model) -> dict:
        # モデルの各カラム名と型情報を取得
        col_info = {col.name: col.type for col in model.__table__.columns}

        # モデル側に converters が定義されていれば取得（なければ空辞書）
        converters = getattr(model, "converters", {})

        # 各フィールドについて、converters にあれば変換、なければそのまま
        data = {
            field: (
                converters[field](row.get(field, ""))
                if field in converters
                else row.get(field, "")
            )
            for field in col_info.keys()
        }
        return data

    if not os.path.exists(filepath):
        print(f"ファイル {filepath} が見つかりません。 スキップします。")
        return

    print(
        f"{os.path.basename(filepath)} のデータをテーブル名 '{model.__tablename__}' にインポートしています..."
    )
    with open(filepath, newline="", encoding="utf-8-sig") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data = process_csv_row(row, model)
            session.merge(model(**data))
        session.commit()


def download_and_extract_gtfs(destination_dir: str) -> None:
    if not os.path.exists(destination_dir):
        os.makedirs(destination_dir)
    zip_path = os.path.join(destination_dir, "current_data.zip")
    print("GTFS staticデータをダウンロード中です...")
    response = requests.get(
        "https://ajt-mobusta-gtfs.mcapps.jp/static/8/current_data.zip"
    )
    if response.status_code != 200:
        raise Exception("GTFS static zipファイルのダウンロードに失敗しました。")
    with open(zip_path, "wb") as f:
        f.write(response.content)
    print("zipファイルを展開しています...")
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(destination_dir)
    print("GTFS staticファイルのダウンロードと展開が完了しました。")
    os.remove(zip_path)


def import_all_gtfs_static_data() -> None:
    gtfs_dir = settings.GTFS_STATIC_DIR
    download_and_extract_gtfs(gtfs_dir)
    session = SessionLocal()
    try:
        # マッピングに基づき、各 CSV ファイルを自動インポート
        for filename, model in CSV_MODEL_MAPPING.items():
            filepath = os.path.join(gtfs_dir, filename)
            import_csv_for_model(session, model, filepath)
        print("GTFS staticデータのインポートを完了しました。")
    except Exception as e:
        session.rollback()
        print("GTFS staticデータのインポート中にエラーが発生しました:", e)
    finally:
        shutil.rmtree(gtfs_dir)
        session.close()
