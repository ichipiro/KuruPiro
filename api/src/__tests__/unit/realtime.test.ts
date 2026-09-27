import { describe, it, expect } from "vitest";
import { filterByOriginDest } from "../../realtime";
import type { TripUpdate } from "../../types";

function makeTrip(tripId: string, stopIds: string[]): TripUpdate {
  return {
    tripId,
    stopTimeUpdates: stopIds.map((stopId) => ({ stopId })),
  };
}

describe("filterByOriginDest", () => {
  const trips: TripUpdate[] = [
    // A → B → C → D
    makeTrip("trip-abcd", ["A", "B", "C", "D"]),
    // B → C → D（A を含まない）
    makeTrip("trip-bcd", ["B", "C", "D"]),
    // A → B（C, D なし）
    makeTrip("trip-ab", ["A", "B"]),
    // D → A（逆順）
    makeTrip("trip-da", ["D", "A"]),
  ];

  it("origin のみ指定: origin を経由するすべての便を返す", () => {
    const result = filterByOriginDest(trips, "A", null);
    expect(result.map((t) => t.tripId)).toEqual(["trip-abcd", "trip-ab", "trip-da"]);
  });

  it("origin と dest 指定: origin の後に dest があるものだけ返す", () => {
    const result = filterByOriginDest(trips, "A", "C");
    expect(result.map((t) => t.tripId)).toEqual(["trip-abcd"]);
  });

  it("origin が dest より後に来る便は除外する（逆順）", () => {
    const result = filterByOriginDest(trips, "A", "D");
    // trip-da は D→A の順なので除外
    expect(result.map((t) => t.tripId)).toEqual(["trip-abcd"]);
  });

  it("origin を含まない便は除外する", () => {
    const result = filterByOriginDest(trips, "A", "D");
    expect(result.find((t) => t.tripId === "trip-bcd")).toBeUndefined();
  });

  it("dest が origin と同じ stop にある便は除外する（destIdx > originIdx が必要）", () => {
    const result = filterByOriginDest(trips, "A", "A");
    expect(result).toHaveLength(0);
  });

  it("空の trips 配列は空を返す", () => {
    expect(filterByOriginDest([], "A", "B")).toHaveLength(0);
  });

  it("origin が含まれない場合は空を返す", () => {
    expect(filterByOriginDest(trips, "Z", null)).toHaveLength(0);
  });
});
