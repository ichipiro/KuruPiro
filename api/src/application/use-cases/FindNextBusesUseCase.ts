import { StopId, Delay, TripId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { TripFinderService } from '@/domain/services/TripFinderService';
import { TimeCalculationService } from '@/domain/services/TimeCalculationService';
import type { IRealtimeRepository, IStopRepository, IStopTimeRepository } from '@/domain/repositories';
import type { NextBusDTO } from '@/application/dto/NextBusDTO';
import type { TripSearchResult } from '@/domain/queries';
import type { TripUpdate } from '@/domain/entities/TripUpdate';

/**
 * 次のバスを検索するユースケース
 *
 * 出発地と目的地の間を走る次のバスを検索し、リアルタイムデータがあれば
 * 遅延情報を適用して実際の到着時刻を計算します。
 */
export class FindNextBusesUseCase {
  constructor(
    private readonly tripFinder: TripFinderService,
    private readonly timeCalculation: TimeCalculationService,
    private readonly stopRepo: IStopRepository,
    private readonly stopTimeRepo: IStopTimeRepository,
    private readonly realtimeRepo?: IRealtimeRepository
  ) {}

  /**
   * 次のバスを検索
   *
   * @param originStopId 出発地停留所ID
   * @param destinationStopIds 目的地停留所IDの配列（複数可）
   * @param currentDateTime 現在時刻（JST）
   * @param viaStopIds 経由地停留所IDの配列（オプション）
   * @returns 次のバス情報のリスト（残り時間順にソート）
   */
  async execute(
    originStopId: StopId,
    destinationStopIds: StopId[],
    currentDateTime: JSTDateTime,
    viaStopIds?: StopId[],
    limit?: number
  ): Promise<NextBusDTO[]> {
    // 1. 各destinationを並列検索
    const tripResultsPerDest = await Promise.all(
      destinationStopIds.map(dest =>
        this.tripFinder.findTrips(originStopId, dest, currentDateTime)
      )
    );

    // マージ + 同一tripIdは到着時刻が早い方を残す
    const tripResultMap = new Map<string, TripSearchResult>();
    for (const results of tripResultsPerDest) {
      for (const trip of results) {
        const existing = tripResultMap.get(trip.tripId);
        if (!existing || trip.arrivalTime.compareTo(existing.arrivalTime) < 0) {
          tripResultMap.set(trip.tripId, trip);
        }
      }
    }
    const tripResults = Array.from(tripResultMap.values());

    if (tripResults.length === 0) {
      return [];
    }

    // 1.5. 経由地が指定されている場合、経由地を通過するトリップのみにフィルタリング
    let filteredTripResults = tripResults;
    if (viaStopIds && viaStopIds.length > 0) {
      filteredTripResults = await this.filterByViaStops(
        tripResults,
        originStopId,
        viaStopIds
      );

      if (filteredTripResults.length === 0) {
        return [];
      }
    }

    // 2. 対象の便のリアルタイムデータをまとめて取得
    //    （フィード全件のパースはCPU制限を圧迫するため、必要な便だけ問い合わせる。
    //      TripFinderService が同じ便を取得済みなのでDOへの追加往復は発生しない）
    let tripUpdateMap: Map<string, TripUpdate> | undefined;
    if (this.realtimeRepo) {
      tripUpdateMap = await this.realtimeRepo.getTripUpdatesForTrips(
        filteredTripResults.map((trip) => TripId.fromString(trip.tripId))
      );
    }

    // 2.5. 各便の現在位置（停留所名）を1クエリでまとめて取得
    //      便ごとに findNameById を呼ぶとD1への問い合わせがN+1になるため
    const currentLocationByTripId = await this.resolveCurrentLocations(
      filteredTripResults,
      tripUpdateMap
    );

    // 3. 基準日を一度だけ計算（パフォーマンス最適化）
    const baseDate = JSTDateTime.fromComponents(
      currentDateTime.year,
      currentDateTime.month,
      currentDateTime.day,
      0,
      0,
      0
    );

    // 4. 各トリップを NextBusDTO に変換
    const buses = filteredTripResults.map((tripResult) => {
      // リアルタイムデータから遅延情報とUnix timestampを取得
      let delay: Delay | undefined;
      let realtimeArrivalTimestamp: number | undefined;
      let isArrivedInFeed = false; // フィードに存在しない = 到着済み
      const currentLocation = currentLocationByTripId.get(tripResult.tripId) ?? '';

      if (tripUpdateMap) {
        const tripUpdate = tripUpdateMap.get(tripResult.tripId);

        if (tripUpdate) {
          // stopSequenceに対応するStopTimeUpdateを探す
          const stopTimeUpdate = tripUpdate.findStopTimeUpdate(
            tripResult.stopSequence
          );

          if (stopTimeUpdate) {
            // StopTimeUpdateが見つかった = まだ到着していない
            // Get representative delay (departure or arrival, whichever is available)
            const representativeDelay = stopTimeUpdate.getRepresentativeDelay();
            if (representativeDelay.hasDelay()) {
              delay = representativeDelay;
            }

            // Unix timestampがあればそれを使う（より正確）
            realtimeArrivalTimestamp = stopTimeUpdate.departureTime || stopTimeUpdate.arrivalTime;
          } else {
            // StopTimeUpdateが見つからない = フィードから削除されている = 到着済み
            isArrivedInFeed = true;
          }
        }
      }

      // 実際の到着時刻を計算
      let actualArrivalTime: JSTDateTime;
      if (realtimeArrivalTimestamp && realtimeArrivalTimestamp > 0) {
        // Unix timestampがあればそれを使う（最も正確）
        actualArrivalTime = JSTDateTime.fromUnixTimestamp(realtimeArrivalTimestamp);
      } else {
        // Unix timestampがなければ従来通りの計算（時刻表 + 遅延）
        actualArrivalTime = this.timeCalculation.calculateActualArrivalTime(
          tripResult.arrivalTime,
          delay,
          baseDate
        );
      }

      // 予定到着時刻も計算（遅延なし）
      const scheduledArrivalTime = this.timeCalculation.calculateActualArrivalTime(
        tripResult.arrivalTime,
        undefined,
        baseDate
      );

      // 残り時間を計算
      const remainingTime = this.timeCalculation.calculateRemainingTime(
        actualArrivalTime,
        currentDateTime
      );

      // DTOに変換
      const dto: NextBusDTO = {
        scheduledArrival: scheduledArrivalTime.toTimeString(),
        actualArrival: actualArrivalTime.toTimeString(),
        remainingTime: remainingTime.toString(),
        remainingMinutes: remainingTime.toMinutes(),
        routeShortName: tripResult.routeShortName,
        destinationLabel: tripResult.destinationLabel,
        tripId: tripResult.tripId,
        delaySeconds: delay ? delay.toSeconds() : 0,
        delayDisplay: delay ? delay.toDisplayString() : '',
        isArrivedInFeed, // フィードに存在しない = 到着済み
        currentLocation, // 現在のバスの位置
      };

      return dto;
    });

    // 5. 既に到着した便を除外
    const upcomingBuses = buses.filter((bus) => {
      // フィードに存在しない場合は到着済みとして除外
      if (bus.isArrivedInFeed) {
        return false;
      }

      // まだ到着していない
      if (bus.remainingMinutes >= 0) {
        return true;
      }

      // 遅延している便は、計算上過ぎていても3分間は表示し続ける
      // （リアルタイムデータにUnix timestampがない場合の誤差対応）
      if (bus.delaySeconds > 0 && bus.remainingMinutes >= -3) {
        return true;
      }

      return false; // 到着済み
    });

    // 6. 残り時間順にソート（猶予期間中の便は0分として扱う）
    upcomingBuses.sort((a, b) => {
      const aSort = Math.max(0, a.remainingMinutes);
      const bSort = Math.max(0, b.remainingMinutes);
      return aSort - bSort;
    });

    return limit !== undefined ? upcomingBuses.slice(0, limit) : upcomingBuses;
  }

  /**
   * 各便の現在位置（停留所名）をまとめて解決する
   *
   * リアルタイムデータから現在位置の停留所IDを集め、1クエリで名前を引きます。
   *
   * @param tripResults トリップ検索結果
   * @param tripUpdateMap tripId → リアルタイム更新情報
   * @returns tripId → 停留所名 のMap（現在位置が不明な便は含まない）
   */
  private async resolveCurrentLocations(
    tripResults: TripSearchResult[],
    tripUpdateMap: Map<string, TripUpdate> | undefined
  ): Promise<Map<string, string>> {
    const locations = new Map<string, string>();

    if (!tripUpdateMap) {
      return locations;
    }

    // tripId → 現在位置の停留所ID
    const currentStopIdByTripId = new Map<string, StopId>();
    for (const tripResult of tripResults) {
      const currentStopId = tripUpdateMap.get(tripResult.tripId)?.getCurrentStopId();
      if (currentStopId) {
        currentStopIdByTripId.set(tripResult.tripId, currentStopId);
      }
    }

    if (currentStopIdByTripId.size === 0) {
      return locations;
    }

    const stopNames = await this.stopRepo.findNamesByIds([
      ...currentStopIdByTripId.values(),
    ]);

    for (const [tripId, stopId] of currentStopIdByTripId) {
      const stopName = stopNames.get(stopId.value);
      if (stopName) {
        locations.set(tripId, stopName);
      }
    }

    return locations;
  }

  /**
   * 経由地を通過するトリップのみにフィルタリング
   *
   * @param tripResults トリップ検索結果
   * @param originStopId 出発地
   * @param viaStopIds 経由地（順番を保持）
   * @returns origin → via1 → via2 → ... → destination の順で通過するトリップのみ
   */
  private async filterByViaStops(
    tripResults: TripSearchResult[],
    originStopId: StopId,
    viaStopIds: StopId[]
  ): Promise<TripSearchResult[]> {
    const validTrips: TripSearchResult[] = [];

    // 便ごとに引くとN+1になるため、全便の停車地を1クエリでまとめて取得する
    const stopTimesByTripId = await this.stopTimeRepo.findByTripIds(
      tripResults.map((tripResult) => TripId.fromString(tripResult.tripId))
    );

    for (const tripResult of tripResults) {
      // トリップの全停車地を取得
      const stopTimes = stopTimesByTripId.get(tripResult.tripId) ?? [];

      if (stopTimes.length === 0) {
        continue;
      }

      // 各停留所のstop_sequenceを取得
      const stopSequenceMap = new Map<string, number>();
      for (const stopTime of stopTimes) {
        stopSequenceMap.set(stopTime.stopId.value, stopTime.sequence);
      }

      // origin, via1, via2, ..., destination の順番をチェック
      // tripResultが持つ実際のdestinationStopIdを使用
      const destinationStopId = StopId.fromString(tripResult.destinationStopId);
      const requiredStops = [originStopId, ...viaStopIds, destinationStopId];
      let previousSequence = -1;
      let isValid = true;

      for (const requiredStop of requiredStops) {
        const sequence = stopSequenceMap.get(requiredStop.value);

        if (sequence === undefined) {
          // 必要な停留所を通過していない
          isValid = false;
          break;
        }

        if (sequence <= previousSequence) {
          // 順番が正しくない
          isValid = false;
          break;
        }

        previousSequence = sequence;
      }

      if (isValid) {
        validTrips.push(tripResult);
      }
    }

    return validTrips;
  }
}
