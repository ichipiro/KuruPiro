from __future__ import annotations

import csv
import hashlib
import io
import sys
from collections import defaultdict
from collections.abc import Iterator
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated, Final, NewType, TypeAlias, TypedDict

import chardet
from pydantic import BaseModel, ConfigDict, Field

StopId = NewType("StopId", str)
ServiceId = NewType("ServiceId", str)
TripId = NewType("TripId", str)
RouteId = NewType("RouteId", str)
FeedVersion = NewType("FeedVersion", str)
GtfsTimeStr = NewType("GtfsTimeStr", str)  # "08:05:00" / "25:30:00"
DateStr = NewType("DateStr", str)  # "YYYYMMDD"
UnixTimeSec = NewType("UnixTimeSec", int)  # Unix timestamp (秒)
DurationSec = NewType("DurationSec", int)  # 相対時間 (秒)

CalendarDatesByDate: TypeAlias = dict[DateStr, list["CalendarDateRow"]]
StopTimesByStop: TypeAlias = dict[StopId, list["StopTimeRow"]]
TripsByService: TypeAlias = dict[ServiceId, frozenset[TripId]]

GTFS_DIR: Final[Path] = Path("tmp/gtfs")
OUTPUT_DIR: Final[Path] = Path("tmp/output")
JST: Final[timezone] = timezone(timedelta(hours=9))

_WEEKDAY_COLS: Final[tuple[str, ...]] = (
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
)

# 対象の停留所ペア (origin, destination)
# 増やすときはここを増やす
STOP_PAIRS: Final[list[tuple[StopId, StopId]]] = [
    (StopId("22030_2"), StopId("51240_")),
    (StopId("24140_1"), StopId("51240_")),
]


class CalendarRow(TypedDict):
    service_id: str
    monday: str
    tuesday: str
    wednesday: str
    thursday: str
    friday: str
    saturday: str
    sunday: str
    start_date: str
    end_date: str


class CalendarDateRow(TypedDict):
    service_id: str
    date: str
    exception_type: str


class TripRow(TypedDict):
    route_id: str
    service_id: str
    trip_id: str
    trip_headsign: str


class StopTimeRow(TypedDict):
    trip_id: str
    stop_id: str
    stop_sequence: int
    arrival_time: str
    departure_time: str


class RouteRow(TypedDict):
    route_id: str
    route_short_name: str


class TimetableEntry(BaseModel):
    model_config = ConfigDict(frozen=True, populate_by_name=True)

    trip_id: Annotated[TripId, Field(alias="tripId")]
    arrival_time: Annotated[UnixTimeSec, Field(alias="arrivalTime")]
    stop_sequence: Annotated[int, Field(alias="stopSequence")]
    route_short_name: Annotated[str, Field(alias="routeShortName")]
    destination_stop_id: Annotated[StopId, Field(alias="destinationStopId")]
    destination_label: Annotated[str, Field(alias="destinationLabel")]
    service_id: Annotated[ServiceId, Field(alias="serviceId")]


class TimetableFile(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    feed_version: Annotated[FeedVersion, Field(alias="feedVersion")]
    date_str: Annotated[DateStr, Field(alias="date")]
    trips: list[TimetableEntry]


class StopPairModel(BaseModel):
    model_config = ConfigDict(frozen=True)

    origin: StopId
    destination: StopId


class MetaFile(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    feed_version: Annotated[FeedVersion, Field(alias="feedVersion")]
    generated_at: Annotated[str, Field(alias="generatedAt")]
    stop_pairs: Annotated[list[StopPairModel], Field(alias="stopPairs")]
    hash: str


class GtfsData(TypedDict):
    calendar: list[CalendarRow]
    calendar_dates: CalendarDatesByDate
    stop_times_by_stop: StopTimesByStop
    trips_by_service: TripsByService
    trips_by_id: dict[TripId, TripRow]
    routes_by_id: dict[RouteId, RouteRow]
    routes_jp_dest: dict[RouteId, str]  # route_id => destination_stop (routes_jp.txt)
    stops_by_id: dict[StopId, str]  # stop_id => stop_name
    date_range: tuple[date, date]


def normalize_stop_id(s: str) -> StopId:
    return StopId(s.replace(" ", "_"))


def parse_gtfs_date(s: str) -> date:
    return date(int(s[:4]), int(s[4:6]), int(s[6:]))


def format_gtfs_time(h: int, m: int, s: int = 0) -> GtfsTimeStr:
    return GtfsTimeStr(f"{h:02d}:{m:02d}:{s:02d}")


def date_to_int(d: date) -> int:
    return int(d.strftime("%Y%m%d"))


def headsign_or_stop_id(headsign: str, fallback: StopId) -> str:
    return headsign.strip() or str(fallback)


def _read_csv(path: Path) -> Iterator[dict[str, str]]:
    if not path.exists():
        raise FileNotFoundError(f"{path} が見つかりませんでした。")
    raw = path.read_bytes()
    encoding = chardet.detect(raw).get("encoding") or "utf-8"
    yield from csv.DictReader(io.StringIO(raw.decode(encoding), newline=""))


def load_gtfs(gtfs_dir: Path) -> GtfsData:
    calendar = [
        CalendarRow(
            service_id=row["service_id"],
            monday=row["monday"],
            tuesday=row["tuesday"],
            wednesday=row["wednesday"],
            thursday=row["thursday"],
            friday=row["friday"],
            saturday=row["saturday"],
            sunday=row["sunday"],
            start_date=row["start_date"],
            end_date=row["end_date"],
        )
        for row in _read_csv(gtfs_dir / "calendar.txt")
    ]

    calendar_dates: CalendarDatesByDate = defaultdict(list)
    all_dates: list[date] = []
    for r in calendar:
        all_dates.append(parse_gtfs_date(r["start_date"]))
        all_dates.append(parse_gtfs_date(r["end_date"]))

    for row in _read_csv(gtfs_dir / "calendar_dates.txt"):
        all_dates.append(parse_gtfs_date(row["date"]))
        d_str = DateStr(row["date"])
        calendar_dates[d_str].append(
            CalendarDateRow(
                service_id=row["service_id"],
                date=row["date"],
                exception_type=row["exception_type"],
            )
        )

    if not all_dates:
        raise ValueError(
            "No operating schedule found in calendar.txt or calendar_dates.txt"
        )

    date_range = (min(all_dates), max(all_dates))

    trips_by_id: dict[TripId, TripRow] = {}
    trips_by_service: dict[ServiceId, set[TripId]] = defaultdict(set)
    for row in _read_csv(gtfs_dir / "trips.txt"):
        tid = TripId(row["trip_id"])
        sid = ServiceId(row["service_id"])
        trips_by_id[tid] = TripRow(
            route_id=row["route_id"],
            service_id=row["service_id"],
            trip_id=row["trip_id"],
            trip_headsign=row.get("trip_headsign", ""),
        )
        trips_by_service[sid].add(tid)

    stop_times_by_stop: dict[StopId, list[StopTimeRow]] = defaultdict(list)
    for row in _read_csv(gtfs_dir / "stop_times.txt"):
        sid = normalize_stop_id(row["stop_id"])
        stop_times_by_stop[sid].append(
            StopTimeRow(
                trip_id=row["trip_id"],
                stop_id=sid,
                stop_sequence=int(row["stop_sequence"]),
                arrival_time=row.get("arrival_time", ""),
                departure_time=row.get("departure_time", ""),
            )
        )

    routes_by_id: dict[RouteId, RouteRow] = {
        RouteId(row["route_id"]): RouteRow(
            route_id=row["route_id"],
            route_short_name=row.get("route_short_name", ""),
        )
        for row in _read_csv(gtfs_dir / "routes.txt")
    }

    routes_jp_dest: dict[RouteId, str] = {
        RouteId(row["route_id"]): row.get("destination_stop", "")
        for row in _read_csv(gtfs_dir / "routes_jp.txt")
        if row.get("destination_stop", "").strip()
    }

    stops_by_id: dict[StopId, str] = {
        normalize_stop_id(row["stop_id"]): row.get("stop_name", "")
        for row in _read_csv(gtfs_dir / "stops.txt")
    }

    return GtfsData(
        calendar=calendar,
        calendar_dates=dict(calendar_dates),
        stop_times_by_stop=dict(stop_times_by_stop),
        trips_by_service={s: frozenset(ids) for s, ids in trips_by_service.items()},
        trips_by_id=trips_by_id,
        routes_by_id=routes_by_id,
        routes_jp_dest=routes_jp_dest,
        stops_by_id=stops_by_id,
        date_range=date_range,
    )


def _apply_exceptions(
    active: frozenset[ServiceId],
    exceptions: list[CalendarDateRow],
) -> frozenset[ServiceId]:
    adds = {
        ServiceId(r["service_id"]) for r in exceptions if r["exception_type"] == "1"
    }
    removes = {
        ServiceId(r["service_id"]) for r in exceptions if r["exception_type"] == "2"
    }
    return (active | adds) - removes


def resolve_active_services(
    target_date: date,
    calendar: list[CalendarRow],
    calendar_dates: CalendarDatesByDate,
) -> frozenset[ServiceId]:
    date_int = date_to_int(target_date)
    dow = target_date.weekday()

    base = frozenset(
        ServiceId(r["service_id"])
        for r in calendar
        if int(r["start_date"]) <= date_int <= int(r["end_date"])
        and r[_WEEKDAY_COLS[dow]] == "1"
    )

    exceptions = calendar_dates.get(DateStr(target_date.strftime("%Y%m%d")), [])
    return _apply_exceptions(base, exceptions) if exceptions else base


def parse_gtfs_time(time_str: str) -> tuple[int, int, int] | None:
    parts = time_str.strip().split(":")
    if len(parts) < 2:
        return None
    return int(parts[0]), int(parts[1]), int(parts[2]) if len(parts) > 2 else 0


class StaticPairTrip(TypedDict):
    trip_id: TripId
    service_id: ServiceId
    origin_seq: int
    arrival_time_str: GtfsTimeStr
    dest_stop_id: StopId
    destination_label: str
    route_short_name: str


def precalculate_pair_trips(
    origin: StopId,
    dest: StopId,
    gtfs: GtfsData,
) -> dict[TripId, StaticPairTrip]:
    stop_times = gtfs["stop_times_by_stop"]
    origin_rows = stop_times.get(origin, [])
    # "51240_" のような末尾がアンダースコアのケース
    # "51240_1", "51240_2" などの全乗り場をまとめて扱う
    if dest.endswith("_"):
        prefix = dest[:-1]
        dest_rows = [
            r
            for sid, rows in stop_times.items()
            if sid.startswith(prefix)
            for r in rows
        ]
    else:
        dest_rows = stop_times.get(dest, [])

    dest_by_trip: dict[TripId, list[StopTimeRow]] = defaultdict(list)
    for r in dest_rows:
        dest_by_trip[TripId(r["trip_id"])].append(r)

    pair_trips: dict[TripId, StaticPairTrip] = {}

    for orig in origin_rows:
        tid = TripId(orig["trip_id"])
        possible_dests = dest_by_trip.get(tid)
        if not possible_dests:
            continue

        valid_dests = [
            d for d in possible_dests if d["stop_sequence"] > orig["stop_sequence"]
        ]
        if not valid_dests:
            continue
        dest_st = min(valid_dests, key=lambda x: x["stop_sequence"])

        raw_time = orig["departure_time"]
        parsed = parse_gtfs_time(raw_time)
        if parsed is None:
            continue

        trip_info = gtfs["trips_by_id"].get(tid)
        if not trip_info:
            continue

        route_info = gtfs["routes_by_id"].get(RouteId(trip_info["route_id"]))
        route_name = route_info["route_short_name"] if route_info else ""

        dest_sid = StopId(dest_st["stop_id"])
        dest_label = (
            gtfs["routes_jp_dest"].get(RouteId(trip_info["route_id"]), "")
            or gtfs["stops_by_id"].get(dest_sid, "")
            or dest_sid
        )

        pair_trips[tid] = StaticPairTrip(
            trip_id=tid,
            service_id=ServiceId(trip_info["service_id"]),
            origin_seq=orig["stop_sequence"],
            arrival_time_str=format_gtfs_time(*parsed),
            dest_stop_id=dest_sid,
            destination_label=dest_label,
            route_short_name=route_name,
        )

    return pair_trips


def build_entries_for_date(
    target_date: date,
    pair_trips: dict[TripId, StaticPairTrip],
    gtfs: GtfsData,
) -> list[TimetableEntry]:
    active_services = resolve_active_services(
        target_date, gtfs["calendar"], gtfs["calendar_dates"]
    )
    active_trip_ids: set[TripId] = set()
    for s in active_services:
        active_trip_ids.update(gtfs["trips_by_service"].get(s, ()))
    same_day = [t for tid, t in pair_trips.items() if tid in active_trip_ids]

    prev_services = resolve_active_services(
        target_date - timedelta(days=1), gtfs["calendar"], gtfs["calendar_dates"]
    )
    prev_trip_ids: set[TripId] = set()
    for s in prev_services:
        prev_trip_ids.update(gtfs["trips_by_service"].get(s, ()))

    overnight: list[StaticPairTrip] = []
    for tid, t in pair_trips.items():
        if tid not in prev_trip_ids:
            continue
        parsed = parse_gtfs_time(t["arrival_time_str"])
        if parsed is None or parsed[0] < 24:
            continue
        h, m, s_val = parsed
        normalized = format_gtfs_time(h - 24, m, s_val)
        overnight.append({**t, "arrival_time_str": GtfsTimeStr(normalized)})

    matched = sorted(overnight + same_day, key=lambda x: x["arrival_time_str"])
    if not matched:
        return []

    midnight_sec = int(
        datetime(
            target_date.year, target_date.month, target_date.day, tzinfo=JST
        ).timestamp()
    )

    entries: list[TimetableEntry] = []
    for t in matched:
        parsed = parse_gtfs_time(t["arrival_time_str"])
        if parsed is None:
            continue
        h, m, s_val = parsed
        entries.append(
            TimetableEntry(
                trip_id=t["trip_id"],
                arrival_time=UnixTimeSec(midnight_sec + h * 3600 + m * 60 + s_val),
                stop_sequence=t["origin_seq"],
                route_short_name=t["route_short_name"],
                destination_stop_id=t["dest_stop_id"],
                destination_label=t["destination_label"],
                service_id=t["service_id"],
            )
        )
    return entries


def generate_for_stop_pair(
    origin: StopId,
    dest: StopId,
    dates: list[date],
    gtfs: GtfsData,
    output_dir: Path,
    feed_version: FeedVersion,
) -> int:
    out_base = output_dir / "timetable" / "v1" / origin / dest
    out_base.mkdir(parents=True, exist_ok=True)

    pair_trips = precalculate_pair_trips(origin, dest, gtfs)
    if not pair_trips:
        return 0

    generated_count = 0
    for target_date in dates:
        entries = build_entries_for_date(target_date, pair_trips, gtfs)
        if not entries:
            continue

        date_str = DateStr(target_date.strftime("%Y%m%d"))
        timetable = TimetableFile(
            feedVersion=feed_version,
            date_str=date_str,
            trips=entries,
        )
        (out_base / f"{date_str}.json").write_text(
            timetable.model_dump_json(by_alias=True),
            encoding="utf-8",
        )
        generated_count += 1

    return generated_count


def compute_trip_stops(gtfs: GtfsData) -> dict[TripId, list[StopId]]:
    raw: dict[TripId, list[tuple[int, StopId]]] = defaultdict(list)
    for stop_id, rows in gtfs["stop_times_by_stop"].items():
        for row in rows:
            raw[TripId(row["trip_id"])].append((row["stop_sequence"], stop_id))
    return {tid: [s for _, s in sorted(stops)] for tid, stops in raw.items()}


def find_reachable_stops(
    origin: StopId, trip_stops: dict[TripId, list[StopId]]
) -> set[StopId]:
    reachable: set[StopId] = set()
    for stops in trip_stops.values():
        try:
            idx = stops.index(origin)
        except ValueError:
            continue
        reachable.update(stops[idx + 1 :])
    return reachable


def find_stops_that_reach(
    dest: StopId, trip_stops: dict[TripId, list[StopId]]
) -> set[StopId]:
    sources: set[StopId] = set()
    for stops in trip_stops.values():
        try:
            idx = stops.index(dest)
        except ValueError:
            continue
        sources.update(stops[:idx])
    return sources


def group_dests_by_station(stops: set[StopId]) -> set[StopId]:
    groups: dict[str, list[StopId]] = defaultdict(list)
    for stop in stops:
        prefix = (stop.rsplit("_", 1)[0] + "_") if "_" in stop else stop
        groups[prefix].append(stop)

    result: set[StopId] = set()
    for prefix, members in groups.items():
        if len(members) > 1:
            result.add(StopId(prefix))
        else:
            result.add(members[0])
    return result


def write_manifest(output_dir: Path) -> int:
    import json

    manifest: dict[str, str] = {}
    for path in sorted((output_dir / "timetable" / "v1").rglob("*.json")):
        key = path.relative_to(output_dir).as_posix()
        manifest[key] = hashlib.sha256(path.read_bytes()).hexdigest()
    (output_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False), encoding="utf-8"
    )
    return len(manifest)


def calculate_hash(output_dir: Path) -> str:
    hash_list = []
    for file_path in sorted(output_dir.rglob("*")):
        if file_path.is_file():
            with file_path.open("rb") as f:
                sha256 = hashlib.sha256()
                while chunk := f.read(8192):
                    sha256.update(chunk)
            hash_list.append(
                hashlib.sha256(
                    (
                        str(file_path.relative_to(output_dir).as_posix())
                        + sha256.hexdigest()
                    ).encode("utf-8")
                ).hexdigest()
            )
    sha256 = hashlib.sha256()
    for h in sorted(hash_list):
        sha256.update(h.encode("utf-8"))
    return sha256.hexdigest()


def write_stops_json(output_dir: Path, stops_by_id: dict[StopId, str]) -> None:
    import json

    out_path = output_dir / "stops.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(stops_by_id, ensure_ascii=False),
        encoding="utf-8",
    )


def write_meta(
    output_dir: Path,
    feed_version: FeedVersion,
    generated_at: str,
    stop_pairs: list[tuple[StopId, StopId]],
    hash: str,
) -> None:
    meta = MetaFile(
        feedVersion=feed_version,
        generatedAt=generated_at,
        stopPairs=[StopPairModel(origin=o, destination=d) for o, d in stop_pairs],
        hash=hash,
    )
    meta_path = output_dir / "timetable" / "v1" / "meta.json"
    meta_path.parent.mkdir(parents=True, exist_ok=True)
    meta_path.write_text(meta.model_dump_json(by_alias=True), encoding="utf-8")


def main() -> None:
    gtfs_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else GTFS_DIR
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else OUTPUT_DIR

    print(f"Loading GTFS  {gtfs_dir}")
    gtfs = load_gtfs(gtfs_dir)

    feed_info_path = gtfs_dir / "feed_info.txt"
    raw_version = (
        next(_read_csv(feed_info_path), {}).get("feed_version", "")
        if feed_info_path.exists()
        else ""
    )
    feed_version = FeedVersion(
        raw_version or datetime.now(timezone.utc).strftime("%Y%m%d")
    )

    start_date, end_date = gtfs["date_range"]
    dates = [
        start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)
    ]
    print(f"{start_date} to {end_date} ({len(dates)} days)")

    stop_pairs = STOP_PAIRS
    print(f"  {len(stop_pairs)} stop pairs")

    total_files = 0
    for o, d in stop_pairs:
        count = generate_for_stop_pair(o, d, dates, gtfs, output_dir, feed_version)
        if count:
            print(f"  {o} -> {d}: {count} files")
        total_files += count

    write_stops_json(output_dir, gtfs["stops_by_id"])
    print(f"  stops.json: {len(gtfs['stops_by_id'])} stops")

    manifest_count = write_manifest(output_dir)
    print(f"  manifest.json: {manifest_count} entries")

    hash = calculate_hash(output_dir)
    write_meta(
        output_dir,
        feed_version,
        datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        stop_pairs,
        hash=hash,
    )
    print(f"✅ {total_files} files written to {output_dir}")


if __name__ == "__main__":
    main()
