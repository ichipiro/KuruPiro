"""
APIルートを定義するモジュール
"""

from fastapi import APIRouter
from typing import List, Dict, Any


from services.gtfs.realtime import GTFSRealtimeData
from services.bus.service import BusService

router = APIRouter()
bus_service = BusService()


@router.get("/api/{stop_id}/{dest_stop_id}")
def next_bus(
    stop_id: str, dest_stop_id: str, response_size: int = 5
) -> List[Dict[str, Any]]:
    """次のバスの到着時刻を取得するエンドポイント"""
    buses = bus_service.get_next_buses(stop_id, dest_stop_id, response_size)

    return [
        {
            "trip_id": bus.trip_id,
            "route_name": bus.route_name,
            "arrival_time": bus.arrival_time,
            "delay": bus.delay,
            "status": bus.status,
        }
        for bus in buses
    ]


@router.get("/trip/{trip_id}")
def get_trip_realtime(trip_id: str) -> GTFSRealtimeData:

    data = bus_service.realtime_manager.get_data_by_trip_id(trip_id=trip_id)
    # print(bus_service.realtime_manager.get_data())

    return data


@router.get("/api/stop/{stop_id}/name")
def get_stop_name(stop_id: str) -> Dict[str, str]:
    """バス停の名前を取得するエンドポイント"""
    name = bus_service.get_stop_name(stop_id)
    return {"stop_id": stop_id, "name": name}
