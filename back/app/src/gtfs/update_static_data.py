import requests
import zipfile
import io
import pandas as pd
import shutil

from .constants import STATIC_DATA_DIR, STATIC_DATA_URL, IDS


# GTFS staticファイルのダウンロード
def dl_gtfs_static_files():
    shutil.rmtree(STATIC_DATA_DIR)  # 前のファイルが残って居た場合に消去する
    with (
        requests.get(STATIC_DATA_URL) as res,
        io.BytesIO(res.content) as bytes_io,
        zipfile.ZipFile(bytes_io) as zip,
    ):
        zip.extractall(STATIC_DATA_DIR)


# GTFS staticのデータを整形して一つのファイルにする関数
# gtfs-static.csv
def generate_gtfs_data():
    # 必要なtxtファイルをGTFS staticから読み込み
    stop_times = pd.read_csv(STATIC_DATA_DIR + "/stop_times.txt")
    stop_times["stop_id"] = stop_times["stop_id"].apply(lambda id: id.replace(" ", "_"))
    trips = pd.read_csv(STATIC_DATA_DIR + "/trips.txt")
    calendar = pd.read_csv(STATIC_DATA_DIR + "/calendar.txt")
    routes = pd.read_csv(STATIC_DATA_DIR + "/routes.txt")
    routes_jp = pd.read_csv(STATIC_DATA_DIR + "/routes_jp.txt")
    stops = pd.read_csv(STATIC_DATA_DIR + "/stops.txt")
    stops["stop_id"] = stops["stop_id"].apply(lambda id: id.replace(" ", "_"))

    # データ整形
    df = pd.merge(stop_times, trips, on="trip_id")
    df2 = pd.merge(df, calendar, on="service_id")
    df3 = pd.merge(df2, routes, on="route_id")
    df4 = pd.merge(df3, stops, on="stop_id")
    df5 = pd.merge(df4, routes_jp, on="route_id")

    ichipiro_route_list = df4[df4["stop_id"].apply(lambda id: id in IDS)][
        "route_id"
    ].to_list()

    ichipiro_routes = set(ichipiro_route_list)

    df6 = df5[df5["route_id"].apply(lambda id: id in ichipiro_routes)]

    # 保存
    df_result = df6[
        [
            "trip_id",
            "stop_id",
            "route_short_name",
            "route_id",
            "destination_stop",
            "arrival_time",
            "stop_sequence",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ]
    ]
    df_result.to_csv(STATIC_DATA_DIR + "/gtfs-static.csv")
    return
