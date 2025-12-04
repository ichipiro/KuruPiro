# GTFSデータのURL
GTFS_STATIC_URL = "https://ajt-mobusta-gtfs.mcapps.jp/static/8/current_data.zip"
GTFS_REALTIME_URL = "https://ajt-mobusta-gtfs.mcapps.jp/realtime/8"

# データディレクトリ
DATA_DIR = "/tmp/data/gtfs-static"

# 曜日マッピング
WEEKDAY_MAP = {
    0: "monday",
    1: "tuesday",
    2: "wednesday",
    3: "thursday",
    4: "friday",
    5: "saturday",
    6: "sunday",
}

# リアルタイムデータ更新間隔（秒）
REALTIME_UPDATE_INTERVAL = 15
