from google.transit import gtfs_realtime_pb2
import requests
import datetime
import os

from gtfs import REALTIME_DATA_DIR, REALTIME_DATA_URL


def get_gtfs_realtime_data():
    old_gtfs_file = os.listdir(REALTIME_DATA_DIR)[0]
    old_gtfs_file_date = datetime.datetime.strptime(
        old_gtfs_file, "%Y%m%d_%H%M%S_gtfsrealtime.bin"
    )
    now_time = datetime.datetime.now() + datetime.timedelta(hours=9)
    passed_time = (now_time - old_gtfs_file_date).total_seconds()

    if passed_time >= 15.0:
        os.remove(REALTIME_DATA_DIR + "/" + old_gtfs_file)
        response = requests.get(REALTIME_DATA_URL)
        now_time = datetime.datetime.now() + datetime.timedelta(hours=9)
        fileName = now_time.strftime("%Y%m%d_%H%M%S_") + "gtfsrealtime.bin"
        saveFilePath = REALTIME_DATA_DIR + "/" + fileName
        with open(saveFilePath, "wb") as saveFile:
            saveFile.write(response.content)
        return response.content
    else:
        with open(REALTIME_DATA_DIR + "/" + old_gtfs_file, "rb") as readFile:
            return readFile.read()


def bus_realtime_data(trip_id, stop_sequence):
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(get_gtfs_realtime_data())
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
            if hasattr(stop_time, "departure"):
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
