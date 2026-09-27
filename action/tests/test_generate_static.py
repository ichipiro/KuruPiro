from __future__ import annotations

from datetime import date, timedelta, timezone

from generate_static import (
    CalendarDateRow,
    CalendarRow,
    GtfsData,
    RouteId,
    RouteRow,
    ServiceId,
    StopId,
    StopTimeRow,
    TripId,
    TripRow,
    UnixTimeSec,
    build_entries_for_date,
    normalize_stop_id,
    parse_gtfs_time,
    precalculate_pair_trips,
    resolve_active_services,
)

JST = timezone(timedelta(hours=9))


# normalize_stop_id


def test_normalize_stop_id_replaces_space():
    assert normalize_stop_id("123 4") == StopId("123_4")


def test_normalize_stop_id_no_change():
    assert normalize_stop_id("22030_2") == StopId("22030_2")


# parse_gtfs_time


class TestParseGtfsTime:
    def test_normal_time(self):
        assert parse_gtfs_time("08:05:00") == (8, 5, 0)

    def test_overnight_time(self):
        assert parse_gtfs_time("25:30:00") == (25, 30, 0)

    def test_without_seconds(self):
        assert parse_gtfs_time("09:15") == (9, 15, 0)

    def test_empty_string(self):
        assert parse_gtfs_time("") is None

    def test_invalid_format(self):
        assert parse_gtfs_time("badtime") is None


# resolve_active_services


def _weekday_calendar(service_id: str, dow: str) -> CalendarRow:
    days = {
        "monday": "0",
        "tuesday": "0",
        "wednesday": "0",
        "thursday": "0",
        "friday": "0",
        "saturday": "0",
        "sunday": "0",
    }
    days[dow] = "1"
    return CalendarRow(
        service_id=service_id,
        start_date="20260101",
        end_date="20261231",
        **days,  # type: ignore[arg-type]
    )


class TestResolveActiveServices:
    def test_weekday_match(self):
        # 2026-09-07 は月曜日
        cal = [_weekday_calendar("S_MON", "monday")]
        result = resolve_active_services(date(2026, 9, 7), cal, {})
        assert ServiceId("S_MON") in result

    def test_weekday_no_match(self):
        # 2026-09-07 は月曜日 サービスは土曜日
        cal = [_weekday_calendar("S_SAT", "saturday")]
        result = resolve_active_services(date(2026, 9, 7), cal, {})
        assert ServiceId("S_SAT") not in result

    def test_out_of_date_range(self):
        cal = [
            CalendarRow(
                service_id="S1",
                monday="1",
                tuesday="1",
                wednesday="1",
                thursday="1",
                friday="1",
                saturday="0",
                sunday="0",
                start_date="20260101",
                end_date="20260131",
            )
        ]
        result = resolve_active_services(date(2026, 9, 7), cal, {})
        assert ServiceId("S1") not in result

    def test_exception_type1_adds_service(self):
        cal = [_weekday_calendar("S_MON", "monday")]
        # 2026-09-06 は日曜日 — 普通は非アクティブ
        cd = {
            "20260906": [
                CalendarDateRow(service_id="S_MON", date="20260906", exception_type="1")
            ]
        }
        result = resolve_active_services(date(2026, 9, 6), cal, cd)
        assert ServiceId("S_MON") in result

    def test_exception_type2_removes_service(self):
        cal = [_weekday_calendar("S_MON", "monday")]
        # 2026-09-07 は月曜日 — 普通はアクティブだが除外
        cd = {
            "20260907": [
                CalendarDateRow(service_id="S_MON", date="20260907", exception_type="2")
            ]
        }
        result = resolve_active_services(date(2026, 9, 7), cal, cd)
        assert ServiceId("S_MON") not in result


# precalculate_pair_trips


def _make_gtfs(
    stop_times: dict[StopId, list[StopTimeRow]],
    trips: dict[TripId, TripRow] | None = None,
    routes: dict[RouteId, RouteRow] | None = None,
    routes_jp_dest: dict[RouteId, str] | None = None,
    stops: dict[StopId, str] | None = None,
) -> GtfsData:
    return GtfsData(
        calendar=[],
        calendar_dates={},
        stop_times_by_stop=stop_times,
        trips_by_service={},
        trips_by_id=trips or {},
        routes_by_id=routes or {},
        routes_jp_dest=routes_jp_dest or {},
        stops_by_id=stops or {},
        date_range=(date(2026, 1, 1), date(2026, 12, 31)),
    )


class TestPrecalculatePairTrips:
    def test_basic_pair(self):
        gtfs = _make_gtfs(
            stop_times={
                StopId("A"): [
                    StopTimeRow(
                        trip_id="T1",
                        stop_id="A",
                        stop_sequence=1,
                        arrival_time="08:00:00",
                        departure_time="08:00:00",
                    )
                ],
                StopId("B"): [
                    StopTimeRow(
                        trip_id="T1",
                        stop_id="B",
                        stop_sequence=2,
                        arrival_time="08:10:00",
                        departure_time="08:10:00",
                    )
                ],
            },
            trips={
                TripId("T1"): TripRow(
                    route_id="R1", service_id="S1", trip_id="T1", trip_headsign=""
                )
            },
            routes={RouteId("R1"): RouteRow(route_id="R1", route_short_name="1")},
        )
        result = precalculate_pair_trips(StopId("A"), StopId("B"), gtfs)
        assert TripId("T1") in result
        assert result[TripId("T1")]["arrival_time_str"] == "08:00:00"
        assert result[TripId("T1")]["route_short_name"] == "1"

    def test_wildcard_dest(self):
        # dest = "B_" には "B_1" と "B_2" がマッチする
        gtfs = _make_gtfs(
            stop_times={
                StopId("A"): [
                    StopTimeRow(
                        trip_id="T1",
                        stop_id="A",
                        stop_sequence=1,
                        arrival_time="09:00:00",
                        departure_time="09:00:00",
                    )
                ],
                StopId("B_1"): [
                    StopTimeRow(
                        trip_id="T1",
                        stop_id="B_1",
                        stop_sequence=2,
                        arrival_time="09:15:00",
                        departure_time="09:15:00",
                    )
                ],
            },
            trips={
                TripId("T1"): TripRow(
                    route_id="R1", service_id="S1", trip_id="T1", trip_headsign=""
                )
            },
        )
        result = precalculate_pair_trips(StopId("A"), StopId("B_"), gtfs)
        assert TripId("T1") in result

    def test_dest_before_origin_excluded(self):
        # B が A より 前に 現れたトリップは無効なペアだ
        gtfs = _make_gtfs(
            stop_times={
                StopId("A"): [
                    StopTimeRow(
                        trip_id="T1",
                        stop_id="A",
                        stop_sequence=2,
                        arrival_time="09:00:00",
                        departure_time="09:00:00",
                    )
                ],
                StopId("B"): [
                    StopTimeRow(
                        trip_id="T1",
                        stop_id="B",
                        stop_sequence=1,
                        arrival_time="08:50:00",
                        departure_time="08:50:00",
                    )
                ],
            },
            trips={
                TripId("T1"): TripRow(
                    route_id="R1", service_id="S1", trip_id="T1", trip_headsign=""
                )
            },
        )
        result = precalculate_pair_trips(StopId("A"), StopId("B"), gtfs)
        assert TripId("T1") not in result

    def test_no_common_trip(self):
        gtfs = _make_gtfs(
            stop_times={
                StopId("A"): [
                    StopTimeRow(
                        trip_id="T1",
                        stop_id="A",
                        stop_sequence=1,
                        arrival_time="08:00:00",
                        departure_time="08:00:00",
                    )
                ],
                StopId("B"): [
                    StopTimeRow(
                        trip_id="T2",
                        stop_id="B",
                        stop_sequence=1,
                        arrival_time="08:10:00",
                        departure_time="08:10:00",
                    )
                ],
            },
            trips={
                TripId("T1"): TripRow(
                    route_id="R1", service_id="S1", trip_id="T1", trip_headsign=""
                ),
                TripId("T2"): TripRow(
                    route_id="R1", service_id="S1", trip_id="T2", trip_headsign=""
                ),
            },
        )
        result = precalculate_pair_trips(StopId("A"), StopId("B"), gtfs)
        assert result == {}

    def test_destination_label_from_routes_jp(self):
        gtfs = _make_gtfs(
            stop_times={
                StopId("A"): [
                    StopTimeRow(
                        trip_id="T1",
                        stop_id="A",
                        stop_sequence=1,
                        arrival_time="08:00:00",
                        departure_time="08:00:00",
                    )
                ],
                StopId("B"): [
                    StopTimeRow(
                        trip_id="T1",
                        stop_id="B",
                        stop_sequence=2,
                        arrival_time="08:10:00",
                        departure_time="08:10:00",
                    )
                ],
            },
            trips={
                TripId("T1"): TripRow(
                    route_id="R1", service_id="S1", trip_id="T1", trip_headsign=""
                )
            },
            routes_jp_dest={RouteId("R1"): "広島駅"},
        )
        result = precalculate_pair_trips(StopId("A"), StopId("B"), gtfs)
        assert result[TripId("T1")]["destination_label"] == "広島駅"

    def test_destination_label_fallback_to_stop_name(self):
        gtfs = _make_gtfs(
            stop_times={
                StopId("A"): [
                    StopTimeRow(
                        trip_id="T1",
                        stop_id="A",
                        stop_sequence=1,
                        arrival_time="08:00:00",
                        departure_time="08:00:00",
                    )
                ],
                StopId("B"): [
                    StopTimeRow(
                        trip_id="T1",
                        stop_id="B",
                        stop_sequence=2,
                        arrival_time="08:10:00",
                        departure_time="08:10:00",
                    )
                ],
            },
            trips={
                TripId("T1"): TripRow(
                    route_id="R1", service_id="S1", trip_id="T1", trip_headsign=""
                )
            },
            stops={StopId("B"): "B停留所"},
        )
        result = precalculate_pair_trips(StopId("A"), StopId("B"), gtfs)
        assert result[TripId("T1")]["destination_label"] == "B停留所"


# build_entries_for_date


def _midnight_jst(d: date) -> int:
    from datetime import datetime

    return int(datetime(d.year, d.month, d.day, tzinfo=JST).timestamp())


def _make_pair_trip(
    trip_id: str,
    service_id: str,
    time_str: str,
    seq: int = 1,
) -> dict:
    from generate_static import StaticPairTrip

    return StaticPairTrip(
        trip_id=TripId(trip_id),
        service_id=ServiceId(service_id),
        origin_seq=seq,
        arrival_time_str=time_str,  # type: ignore[arg-type]
        dest_stop_id=StopId("DEST"),
        destination_label="終点",
        route_short_name="1",
    )


def _gtfs_with_service(service_id: str, dow: str = "monday") -> GtfsData:
    days = {
        "monday": "0",
        "tuesday": "0",
        "wednesday": "0",
        "thursday": "0",
        "friday": "0",
        "saturday": "0",
        "sunday": "0",
    }
    days[dow] = "1"
    cal = CalendarRow(
        service_id=service_id,
        start_date="20260101",
        end_date="20261231",
        **days,  # type: ignore[arg-type]
    )
    return GtfsData(
        calendar=[cal],
        calendar_dates={},
        stop_times_by_stop={},
        trips_by_service={
            ServiceId(service_id): frozenset([TripId(service_id + "_T")])
        },
        trips_by_id={},
        routes_by_id={},
        routes_jp_dest={},
        stops_by_id={},
        date_range=(date(2026, 1, 1), date(2026, 12, 31)),
    )


class TestBuildEntriesForDate:
    def test_active_trip_included(self):
        # 2026-09-07 は月曜日
        target = date(2026, 9, 7)
        gtfs = _gtfs_with_service("S1", "monday")
        pair_trips = {TripId("S1_T"): _make_pair_trip("S1_T", "S1", "08:00:00")}
        entries = build_entries_for_date(target, pair_trips, gtfs)
        assert len(entries) == 1
        assert entries[0].trip_id == TripId("S1_T")

    def test_inactive_trip_excluded(self):
        # 2026-09-07 は月曜日、サービスは土曜日
        target = date(2026, 9, 7)
        gtfs = _gtfs_with_service("S1", "saturday")
        pair_trips = {TripId("S1_T"): _make_pair_trip("S1_T", "S1", "08:00:00")}
        entries = build_entries_for_date(target, pair_trips, gtfs)
        assert entries == []

    def test_arrival_time_as_unix_timestamp(self):
        target = date(2026, 9, 7)
        gtfs = _gtfs_with_service("S1", "monday")
        pair_trips = {TripId("S1_T"): _make_pair_trip("S1_T", "S1", "08:30:00")}
        entries = build_entries_for_date(target, pair_trips, gtfs)
        expected = UnixTimeSec(_midnight_jst(target) + 8 * 3600 + 30 * 60)
        assert entries[0].arrival_time == expected

    def test_entries_sorted_by_time(self):
        target = date(2026, 9, 7)
        days = {
            "monday": "1",
            "tuesday": "0",
            "wednesday": "0",
            "thursday": "0",
            "friday": "0",
            "saturday": "0",
            "sunday": "0",
        }
        gtfs = GtfsData(
            calendar=[
                CalendarRow(
                    service_id="S1", start_date="20260101", end_date="20261231", **days
                ),  # type: ignore[arg-type]
                CalendarRow(
                    service_id="S2", start_date="20260101", end_date="20261231", **days
                ),  # type: ignore[arg-type]
            ],
            calendar_dates={},
            stop_times_by_stop={},
            trips_by_service={
                ServiceId("S1"): frozenset([TripId("T1")]),
                ServiceId("S2"): frozenset([TripId("T2")]),
            },
            trips_by_id={},
            routes_by_id={},
            routes_jp_dest={},
            stops_by_id={},
            date_range=(date(2026, 1, 1), date(2026, 12, 31)),
        )
        pair_trips = {
            TripId("T1"): _make_pair_trip("T1", "S1", "09:00:00"),
            TripId("T2"): _make_pair_trip("T2", "S2", "08:00:00"),
        }
        entries = build_entries_for_date(target, pair_trips, gtfs)
        assert entries[0].trip_id == TripId("T2")
        assert entries[1].trip_id == TripId("T1")

    def test_overnight_trip_included(self):
        # T_SUN は日曜日 (2026-09-06) に 25:00 = 月曜 01:00 発で運行
        # target = 月曜日 2026-09-07 に含まれるはず
        sun_days = {
            "monday": "0",
            "tuesday": "0",
            "wednesday": "0",
            "thursday": "0",
            "friday": "0",
            "saturday": "0",
            "sunday": "1",
        }
        gtfs = GtfsData(
            calendar=[
                CalendarRow(
                    service_id="S_SUN",
                    start_date="20260101",
                    end_date="20261231",
                    **sun_days,
                )
            ],  # type: ignore[arg-type]
            calendar_dates={},
            stop_times_by_stop={},
            trips_by_service={ServiceId("S_SUN"): frozenset([TripId("T_SUN")])},
            trips_by_id={},
            routes_by_id={},
            routes_jp_dest={},
            stops_by_id={},
            date_range=(date(2026, 1, 1), date(2026, 12, 31)),
        )
        pair_trips = {TripId("T_SUN"): _make_pair_trip("T_SUN", "S_SUN", "25:00:00")}
        entries = build_entries_for_date(date(2026, 9, 7), pair_trips, gtfs)
        assert len(entries) == 1
        expected = UnixTimeSec(_midnight_jst(date(2026, 9, 7)) + 1 * 3600)
        assert entries[0].arrival_time == expected

    def test_prev_day_normal_time_not_included_as_overnight(self):
        # 土曜日の 23:00 便 (< 24) は日曜日の時刻表に overnight 扱いで現れてはいけない
        sat_days = {
            "monday": "0",
            "tuesday": "0",
            "wednesday": "0",
            "thursday": "0",
            "friday": "0",
            "saturday": "1",
            "sunday": "0",
        }
        gtfs = GtfsData(
            calendar=[
                CalendarRow(
                    service_id="S_SAT",
                    start_date="20260101",
                    end_date="20261231",
                    **sat_days,
                )
            ],  # type: ignore[arg-type]
            calendar_dates={},
            stop_times_by_stop={},
            trips_by_service={ServiceId("S_SAT"): frozenset([TripId("T_SAT")])},
            trips_by_id={},
            routes_by_id={},
            routes_jp_dest={},
            stops_by_id={},
            date_range=(date(2026, 1, 1), date(2026, 12, 31)),
        )
        pair_trips = {TripId("T_SAT"): _make_pair_trip("T_SAT", "S_SAT", "23:00:00")}
        # 日曜日: S_SAT は非アクティブ、かつ 23:00 < 24 なので overnight 対象ではない
        entries = build_entries_for_date(date(2026, 9, 6), pair_trips, gtfs)
        assert entries == []
