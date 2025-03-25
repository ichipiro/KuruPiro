from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class BusStop:
    stop_id: str
    stop_name: str
    stop_lat: float
    stop_lon: float


@dataclass
class BusRoute:
    route_id: str
    route_name: str
    route_desc: Optional[str] = None


@dataclass
class BusTrip:
    trip_id: str
    route_id: str
    service_id: str
    direction_id: Optional[int] = None


@dataclass
class BusSchedule:
    trip_id: str
    arrival_time: str
    departure_time: str
    stop_id: str
    stop_sequence: int
    stop_headsign: Optional[str] = None


@dataclass
class BusNextArrival:
    trip_id: str
    route_name: str
    arrival_time: str
    status: str
    trip_dest: str
    remaining: int
    delay: Optional[int] = None


@dataclass
class StopTimeUpdateData:
    stop_id: str
    time: Optional[int]
    delay: Optional[int]
    stop_sequence: int


@dataclass
class TripUpdateData:
    trip_id: Optional[str]
    stop_times: List[StopTimeUpdateData] = field(default_factory=list)


@dataclass
class PositionData:
    latitude: Optional[float]
    longitude: Optional[float]
    bearing: Optional[float]


@dataclass
class VehiclePositionData:
    trip_id: Optional[str]
    vehicle_id: Optional[str]
    position: PositionData


@dataclass
class InformedEntityData:
    trip_id: Optional[str]
    route_id: Optional[str]


@dataclass
class AlertData:
    informed_entities: List[InformedEntityData] = field(default_factory=list)
    header_text: Optional[str] = None


@dataclass
class GTFSRealtimeData:
    trip_updates: List[TripUpdateData] = field(default_factory=list)
    vehicle_positions: List[VehiclePositionData] = field(default_factory=list)
    alerts: List[AlertData] = field(default_factory=list)
