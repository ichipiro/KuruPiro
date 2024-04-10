from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware # 追加
import gtfs_static
import json


app = FastAPI()
# CORSを回避するために追加（今回の肝）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,   # 追記により追加
    allow_methods=["*"],      # 追記により追加
    allow_headers=["*"]       # 追記により追加
)


@app.get("/")
def hello_world():
    return {"message": "Hello World2"}


@app.get("/api/{stop_id}/{dest_stop_id}")
def next_bus(
    stop_id: str, dest_stop_id: str, response_size: int = 5, opt: bool = False
):
    return gtfs_static.next_bus_times(stop_id, dest_stop_id, response_size, opt)
