"""
APIルートを定義するモジュール
"""

from fastapi import APIRouter
from typing import List, Dict, Any


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
            "trip_short_id": bus.route_name,
            "arrival_time": bus.arrival_time[:-3],
            "remaining_time": (
                "まもなく到着"
                if bus.remaining <= 1
                else "あと" + str(bus.remaining) + "分"
            ),
            "delay": str(bus.delay) + "分遅れ" if bus.delay > 0 else "",
            "trip_dest": bus.trip_dest,
            "status": bus.status,
        }
        for bus in buses
    ]


@router.get("/api/stop/{stop_id}/name")
def get_stop_name(stop_id: str) -> Dict[str, str]:
    """バス停の名前を取得するエンドポイント"""
    name = bus_service.get_stop_name(stop_id)
    return {"stop_id": stop_id, "name": name}
