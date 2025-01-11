from google.transit import gtfs_realtime_pb2
import requests
import datetime
import os

from gtfs import REALTIME_DATA_URL


def bus_realtime_data(realtime_data, trip_id, stop_sequence):
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(realtime_data)
    delay = -1
    time = -1

    for entity in feed.entity:
        if entity.trip_update.trip.trip_id != trip_id:
            continue
        for stop_time in entity.trip_update.stop_time_update:
            if stop_time.stop_sequence != stop_sequence:
                continue
            if hasattr(stop_time, "arrival"):
                timeObj = stop_time.arrival
            elif hasattr(stop_time, "departure"):
                timeObj = stop_time.departure
            else:
                continue

            if hasattr(timeObj, "delay"):
                delay = timeObj.delay
            if hasattr(timeObj, "time"):
                time = timeObj.time
                if time != 0:
                    time = datetime.datetime.fromtimestamp(
                        time
                    ) + datetime.timedelta(hours=9)

    return {"delay": delay, "time": time}


def main():
    bus_realtime_data("trip_id", "a")
    print("success")


if __name__ == "__main__":
    main()
