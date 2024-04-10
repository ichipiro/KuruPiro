import requests
import zipfile
import io
import pandas as pd
import shutil
import datetime
import gtfs_realtime

URL = "https://ajt-mobusta-gtfs.mcapps.jp/static/8/current_data.zip"
DATA_DIR = "./data/gtfs-static"

IDS = ("22030_2", "22030_1", "22030_52", "24140_1", "24140_2")


# GTFS staticファイルのダウンロード
def dl_gtfs_static_files():
    shutil.rmtree(DATA_DIR)  # 前のファイルが残って居た場合に消去する

    with (
        requests.get(URL) as res,
        io.BytesIO(res.content) as bytes_io,
        zipfile.ZipFile(bytes_io) as zip,
    ):
        zip.extractall(DATA_DIR)


# GTFS staticのデータを整形して一つのファイルにする関数
# gtfs-static.csv
def generate_gtfs_data():

    # 必要なtxtファイルをGTFS staticから読み込み
    stop_times = pd.read_csv(DATA_DIR + "/stop_times.txt")
    stop_times["stop_id"] = stop_times["stop_id"].apply(lambda id: id.replace(" ", "_"))
    trips = pd.read_csv(DATA_DIR + "/trips.txt")
    calendar = pd.read_csv(DATA_DIR + "/calendar.txt")
    routes = pd.read_csv(DATA_DIR + "/routes.txt")
    stops = pd.read_csv(DATA_DIR + "/stops.txt")
    stops["stop_id"] = stops["stop_id"].apply(lambda id: id.replace(" ", "_"))

    # データ整形
    df = pd.merge(stop_times, trips, on="trip_id")
    df2 = pd.merge(df, calendar, on="service_id")
    df3 = pd.merge(df2, routes, on="route_id")
    df4 = pd.merge(df3, stops, on="stop_id")

    ichipiro_route_list = df4[df4["stop_id"].apply(lambda id: id in IDS)][
        "route_id"
    ].to_list()

    ichipiro_routes = set(ichipiro_route_list)

    df5 = df4[df4["route_id"].apply(lambda id: id in ichipiro_routes)]

    # 保存
    df_result = df5[
        [
            "trip_id",
            "stop_id",
            "route_id",
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
    df_result.to_csv(DATA_DIR + "/gtfs-static.csv")

    return


weekday_dic = {
    0: "monday",
    1: "tuesday",
    2: "wednesday",
    3: "thursday",
    4: "friday",
    5: "saturday",
    6: "sunday",
}


def find_stop_from_trip_id(
    trip_id, dest_stop_id, now_stop_sequence, df_gtfs, opt=False
):

    df_trip = df_gtfs[df_gtfs["trip_id"] == trip_id]

    if opt:
        df_trip.loc[:, "stop_id"] = df_trip["stop_id"].apply(
            lambda id: id.split("_")[0]
        )

    df = df_trip[
        (df_trip["stop_sequence"] > now_stop_sequence)
        & (df_trip["stop_id"] == dest_stop_id)
    ]

    return df


def next_bus_times(now_stop_id, dest_stop_id, response_size=5, opt=False):
    response = []
    now_time = datetime.datetime.now() + datetime.timedelta(hours=9)
    now_weekday = weekday_dic[now_time.weekday()]
    now_date = now_time.strftime("%Y-%m-%d")

    df_gtfs = pd.read_csv(DATA_DIR + "/gtfs-static.csv")

    # 曜日とstop_idでフィルター
    df_active_bus = df_gtfs[(df_gtfs[now_weekday] == 1)]

    # 時間でフィルター
    df_active_bus.loc[:, "arrival_time"] = df_active_bus["arrival_time"].apply(
        lambda x: datetime.datetime.strptime((now_date + " " + x), "%Y-%m-%d %H:%M:%S")
    )

    df_stop = df_active_bus[df_active_bus["stop_id"] == now_stop_id]

    df_stop_filter_from_time = df_stop[df_stop["arrival_time"] > now_time].sort_values(
        "arrival_time"
    )

    for index, row in df_stop_filter_from_time.iterrows():
        res = find_stop_from_trip_id(
            row["trip_id"], dest_stop_id, row["stop_sequence"], df_active_bus, opt
        )
        if not res.empty:

            res = res.iloc[0]

            realtime = gtfs_realtime.bus_realtime_data(
                row["trip_id"], row["stop_sequence"]
            )

            dic = {
                "trip_id": row["trip_id"],
                "route_id": row["route_id"],
                "now_stop_id": row["stop_id"],
                "arrival_time": row["arrival_time"],
                "dest_stop_id": res["stop_id"],
                "dest_arrival_time": res["arrival_time"],
                "delay": realtime["delay"],
                "time_at_now_stop": realtime["time"],
            }

            response.append(dic)

            if len(response) >= response_size:
                return response

    return response


def main():
    # generate_gtfs_data()
    print(next_bus_times("24140_1", "51240", opt=True))
    print("success")


if __name__ == "__main__":
    main()
