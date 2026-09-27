import { describe, it, expect, vi } from "vitest";
import { getTimetable } from "../../timetable";
import type { Env } from "../../types";

const MOCK_FILE = {
  trips: [
    {
      tripId: "trip-001",
      arrivalTime: 1000000,
      routeShortName: "63",
      destinationLabel: "広島バスセンター",
    },
  ],
};

function makeR2Object(data: object): R2ObjectBody {
  return {
    json: () => Promise.resolve(data),
  } as unknown as R2ObjectBody;
}

describe("getTimetable", () => {
  const DATE = "20260910";
  const ORIGIN = "22030_2";
  const DEST = "51240_";

  it("正しいキーで R2 bucket を参照する", async () => {
    const mockGet = vi.fn().mockResolvedValue(makeR2Object(MOCK_FILE));
    const env = { TIMETABLE_BUCKET: { get: mockGet } } as unknown as Env;

    await getTimetable(env, ORIGIN, DEST, DATE);

    expect(mockGet).toHaveBeenCalledWith(
      `timetable/v1/${ORIGIN}/${DEST}/${DATE}.json`,
    );
  });

  it("trips を tripId をキーとした Map で返す", async () => {
    const env = {
      TIMETABLE_BUCKET: { get: vi.fn().mockResolvedValue(makeR2Object(MOCK_FILE)) },
    } as unknown as Env;

    const result = await getTimetable(env, ORIGIN, DEST, DATE);

    expect(result.size).toBe(1);
    expect(result.get("trip-001")).toMatchObject({
      routeShortName: "63",
      destinationLabel: "広島バスセンター",
    });
  });

  it("R2 にオブジェクトがない場合は空の Map を返す", async () => {
    const env = {
      TIMETABLE_BUCKET: { get: vi.fn().mockResolvedValue(null) },
    } as unknown as Env;

    const result = await getTimetable(env, ORIGIN, DEST, DATE);
    expect(result.size).toBe(0);
  });
});
