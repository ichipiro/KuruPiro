from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware # 追加
import gtfs_static
import json
import datetime


app = FastAPI()
# CORSを回避するために追加（今回の肝）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://kurupiro.huyu2239.work"],
    allow_credentials=True,   # 追記により追加
    allow_methods=["*"],      # 追記により追加
    allow_headers=["*"]       # 追記により追加
)
cache = {}


@app.get("/")
def hello_world():
    return {"message": "Hello World2"}


@app.get("/api/{stop_id}/{dest_stop_id}")
def next_bus(
    stop_id: str, dest_stop_id: str, response_size: int = 5, opt: bool = False
):
    now = datetime.datetime.now()
    if stop_id not in cache:
        cache[stop_id] = {}
    if dest_stop_id not in cache[stop_id] or (now - cache[stop_id][dest_stop_id]["timestamp"]).seconds > 15:
        cache[stop_id][dest_stop_id] = {
            "data": gtfs_static.next_bus_times(stop_id, dest_stop_id, response_size, opt),
            "timestamp": datetime.datetime.now(),
        }
    return cache[stop_id][dest_stop_id]["data"]
