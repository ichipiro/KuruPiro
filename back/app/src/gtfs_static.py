import requests
import pandas as pd
import datetime
import gtfs_realtime

from gtfs import STATIC_DATA_DIR, WEEKDAY_DICT, REALTIME_DATA_URL




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
    now_weekday = WEEKDAY_DICT[now_time.weekday()]
    now_date = now_time.strftime("%Y-%m-%d")
    df_gtfs = pd.read_csv(STATIC_DATA_DIR + "/gtfs-static.csv")
    df_active_bus = df_gtfs[(df_gtfs[now_weekday] == 1)]
    df_active_bus.loc[:, "arrival_time"] = df_active_bus["arrival_time"].apply(
        lambda x: datetime.datetime.strptime((now_date + " " + x), "%Y-%m-%d %H:%M:%S")
    )
    df_stop = df_active_bus[df_active_bus["stop_id"] == now_stop_id]
    df_stop_filter_from_time = df_stop[df_stop["arrival_time"] > now_time].sort_values(
        "arrival_time"
    )
    raw_retaltime_data = requests.get(REALTIME_DATA_URL).content
    for _, row in df_stop_filter_from_time.iterrows():
        res = find_stop_from_trip_id(
            row["trip_id"], dest_stop_id, row["stop_sequence"], df_active_bus, opt
        )
        if res.empty:
            continue
        res = res.iloc[0]
        realtime = gtfs_realtime.bus_realtime_data(
            raw_retaltime_data, row["trip_id"], row["stop_sequence"]
        )
        delay = ""
        if realtime["delay"] not in [-1, 0]:
            delay = str( (realtime["delay"] // 60) + 1 ) + "分遅れ"
        dic = {
            "trip_id": row["route_short_name"],
            "trip_dest": row["destination_stop"],
            "arrival_time": row["arrival_time"].strftime("%H:%M"),
            "current_locate": "出発待ち" if realtime["time"] == -1 else "",
            "delay": delay,
        }
        response.append(dic)
        if len(response) >= response_size:
            break
    return response


def main():
    print(next_bus_times("24140_1", "51240", opt=True))
    print("success")


if __name__ == "__main__":
    main()
