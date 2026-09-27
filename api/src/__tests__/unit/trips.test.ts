import { describe, it, expect } from "vitest";
import {
  formatTime,
  formatDelay,
  formatRemaining,
  filterAndFormat,
} from "../../trips";
import type { StopTimeUpdate } from "../../types";
import type { TimetableEntry } from "../../timetable";

// 2026-09-10 08:05:00 JST
const JST_08_05 = new Date("2026-09-10T08:05:00+09:00").getTime() / 1000;
const JST_00_00 = new Date("2026-09-10T00:00:00+09:00").getTime() / 1000;
const JST_23_59 = new Date("2026-09-10T23:59:00+09:00").getTime() / 1000;

describe("formatTime", () => {
  it("通常時刻を HH:MM に変換する", () => {
    expect(formatTime(JST_08_05)).toBe("08:05");
  });

  it("深夜0時を 00:00 に変換する", () => {
    expect(formatTime(JST_00_00)).toBe("00:00");
  });

  it("23:59 を正しく変換する", () => {
    expect(formatTime(JST_23_59)).toBe("23:59");
  });
});

describe("formatDelay", () => {
  it("undefined は空文字を返す", () => {
    expect(formatDelay(undefined)).toBe("");
  });

  it("0秒 は空文字を返す", () => {
    expect(formatDelay(0)).toBe("");
  });

  it("負の値（早着）は空文字を返す", () => {
    expect(formatDelay(-120)).toBe("");
  });

  it("120秒 → 2分遅れ", () => {
    expect(formatDelay(120)).toBe("2分遅れ");
  });

  it("30秒（0.5分）→ 切り上げで1分遅れ", () => {
    expect(formatDelay(30)).toBe("1分遅れ");
  });

  it("29秒（0.48分）→ 切り捨てで空文字", () => {
    expect(formatDelay(29)).toBe("");
  });
});

describe("formatRemaining", () => {
  const now = JST_08_05;

  it("過去の時刻は「到着済み」", () => {
    expect(formatRemaining(now - 1, now)).toBe("到着済み");
  });

  it("現在時刻は「到着済み」", () => {
    expect(formatRemaining(now, now)).toBe("到着済み");
  });

  it("59秒後は「まもなく到着」", () => {
    expect(formatRemaining(now + 59, now)).toBe("まもなく到着");
  });

  it("60秒後は「あと1分」", () => {
    expect(formatRemaining(now + 60, now)).toBe("あと1分");
  });

  it("5分後は「あと5分」", () => {
    expect(formatRemaining(now + 300, now)).toBe("あと5分");
  });

  it("1時間10分後は「あと1時間10分」", () => {
    expect(formatRemaining(now + 4200, now)).toBe("あと1時間10分");
  });
});

// テスト用の staticMap / rtMap ヘルパー
function makeEntry(tripId: string, arrivalTime: number): [string, TimetableEntry] {
  return [
    tripId,
    {
      tripId,
      arrivalTime,
      routeShortName: "63",
      destinationLabel: "広島バスセンター",
    },
  ];
}

function makeStu(partial: Partial<StopTimeUpdate>): StopTimeUpdate {
  return { stopId: "22030_2", ...partial };
}

describe("filterAndFormat", () => {
  const now = JST_08_05; // 08:05
  const future1 = JST_08_05 + 600;  // 08:15
  const future2 = JST_08_05 + 1200; // 08:25
  const future3 = JST_08_05 + 1800; // 08:35
  const future4 = JST_08_05 + 2400; // 08:45
  const future5 = JST_08_05 + 3000; // 08:55
  const future6 = JST_08_05 + 3600; // 09:05
  const past    = JST_08_05 - 60;   // 08:04

  const ORIGIN = "22030_2";

  it("定刻が過去の便は除外される", () => {
    const staticMap = new Map([makeEntry("trip-past", past)]);
    const result = filterAndFormat(staticMap, new Map(), ORIGIN, now);
    expect(result).toHaveLength(0);
  });

  it("定刻が未来の便は含まれる", () => {
    const staticMap = new Map([makeEntry("trip-future", future1)]);
    const result = filterAndFormat(staticMap, new Map(), ORIGIN, now);
    expect(result).toHaveLength(1);
    expect(result[0].trip_id).toBe("trip-future");
  });

  it("RT delay を考慮して有効時刻を計算する", () => {
    const staticMap = new Map([makeEntry("trip-delayed", past)]);
    const rtMap = new Map([
      [`trip-delayed:${ORIGIN}`, makeStu({ delay: 120 as any })], // past + 2min = future
    ]);
    const result = filterAndFormat(staticMap, rtMap, ORIGIN, now);
    expect(result).toHaveLength(1);
  });

  it("RT の departureTime が 0 の場合は無効値として無視する", () => {
    const staticMap = new Map([makeEntry("trip-zero-rt", past)]);
    const rtMap = new Map([
      [`trip-zero-rt:${ORIGIN}`, makeStu({ departureTime: 0 as any })],
    ]);
    // departureTime=0 は無効なので定刻(past)を使い除外される
    const result = filterAndFormat(staticMap, rtMap, ORIGIN, now);
    expect(result).toHaveLength(0);
  });

  it("RT の arrivalTime がある場合はそれを有効時刻とする", () => {
    const staticMap = new Map([makeEntry("trip-rt-arr", past)]);
    const rtMap = new Map([
      [`trip-rt-arr:${ORIGIN}`, makeStu({ arrivalTime: (now + 300) as any })],
    ]);
    const result = filterAndFormat(staticMap, rtMap, ORIGIN, now);
    expect(result).toHaveLength(1);
  });

  it("6件あっても5件までに切り詰める", () => {
    const staticMap = new Map([
      makeEntry("t1", future1),
      makeEntry("t2", future2),
      makeEntry("t3", future3),
      makeEntry("t4", future4),
      makeEntry("t5", future5),
      makeEntry("t6", future6),
    ]);
    const result = filterAndFormat(staticMap, new Map(), ORIGIN, now);
    expect(result).toHaveLength(5);
  });

  it("arrival_time の昇順でソートされる", () => {
    const staticMap = new Map([
      makeEntry("t-late", future3),
      makeEntry("t-early", future1),
      makeEntry("t-mid", future2),
    ]);
    const result = filterAndFormat(staticMap, new Map(), ORIGIN, now);
    expect(result.map((s) => s.trip_id)).toEqual(["t-early", "t-mid", "t-late"]);
  });

  it("delay がある場合 formatDelay が反映される", () => {
    const staticMap = new Map([makeEntry("trip-d", future1)]);
    const rtMap = new Map([
      [`trip-d:${ORIGIN}`, makeStu({ delay: 180 as any })],
    ]);
    const result = filterAndFormat(staticMap, rtMap, ORIGIN, now);
    expect(result[0].delay).toBe("3分遅れ");
  });

  it("RT なしの便は delay が空文字", () => {
    const staticMap = new Map([makeEntry("trip-nd", future1)]);
    const result = filterAndFormat(staticMap, new Map(), ORIGIN, now);
    expect(result[0].delay).toBe("");
  });
});
