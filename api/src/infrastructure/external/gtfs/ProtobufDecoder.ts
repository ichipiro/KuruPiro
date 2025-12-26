import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

/**
 * GTFS Realtime Protobuf形式のStopTimeUpdate
 */
export interface RawStopTimeUpdate {
  stopSequence?: number;
  stopId?: string;
  arrivalDelay?: number;
  arrivalTime?: number;
  departureDelay?: number;
  departureTime?: number;
}

/**
 * GTFS Realtime Protobuf形式のTripUpdate
 */
export interface RawTripUpdate {
  tripId: string;
  stopTimeUpdates: RawStopTimeUpdate[];
}

/**
 * GTFS Realtime Protobufデータをデコードするクラス
 *
 * GTFSリアルタイムAPI（trip_updates.bin）から取得したProtobuf形式のデータを
 * JavaScriptオブジェクトに変換します。
 */
export class ProtobufDecoder {
  /**
   * GTFS Realtime Protobufバッファをデコード
   */
  static decodeTripUpdates(buffer: ArrayBuffer): RawTripUpdate[] {
    // Use official GTFS Realtime bindings to decode
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    console.log(`[ProtobufDecoder] Parsed feed with ${feed.entity.length} entities`);

    const tripUpdates: RawTripUpdate[] = [];
    for (const entity of feed.entity) {
      if (!entity.tripUpdate?.trip?.tripId) {
        continue;
      }


      // Map stopTimeUpdate to our format
      const stopTimeUpdates: RawStopTimeUpdate[] = (entity.tripUpdate.stopTimeUpdate || []).map(stu => {
        const arrivalDelay = stu.arrival?.delay ?? undefined;
        const departureDelay = stu.departure?.delay ?? undefined;

        return {
          stopSequence: stu.stopSequence ?? undefined,
          // Fix GTFS spec violation: normalize stop_id by replacing spaces with underscores
          stopId: stu.stopId ? stu.stopId.replace(/ /g, '_') : undefined,
          arrivalDelay,
          arrivalTime: typeof stu.arrival?.time === 'object' && stu.arrival?.time?.toNumber ? stu.arrival.time.toNumber() : (stu.arrival?.time as number) ?? undefined,
          departureDelay,
          departureTime: typeof stu.departure?.time === 'object' && stu.departure?.time?.toNumber ? stu.departure.time.toNumber() : (stu.departure?.time as number) ?? undefined,
        };
      });

      const originalTripId = entity.tripUpdate.trip.tripId;
      const normalizedTripId = originalTripId.replace(/ /g, '_');

      // Debug: Log if normalization changed the trip ID
      if (originalTripId !== normalizedTripId) {
        console.log(`[ProtobufDecoder] Normalized trip ID: "${originalTripId}" -> "${normalizedTripId}"`);
      }

      tripUpdates.push({
        // Fix GTFS spec violation: normalize trip_id by replacing spaces with underscores
        tripId: normalizedTripId,
        stopTimeUpdates,
      });
    }

    console.log(`[ProtobufDecoder] Extracted ${tripUpdates.length} trip updates`);

    // Debug: Log first 5 trip IDs
    if (tripUpdates.length > 0) {
      console.log('[ProtobufDecoder] First 5 trip IDs:', tripUpdates.slice(0, 5).map(t => t.tripId));
    }

    return tripUpdates;
  }
}
