import Pbf from 'pbf';

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
    const pbf = new Pbf(new Uint8Array(buffer));
    const message: any = pbf.readMessage(this.readFeedMessage, {});

    const tripUpdates: RawTripUpdate[] = [];
    for (const entity of message.entities || []) {
      if (!entity.tripUpdate?.trip?.tripId) continue;

      tripUpdates.push({
        tripId: entity.tripUpdate.trip.tripId,
        stopTimeUpdates: entity.tripUpdate.stopTimeUpdates || [],
      });
    }
    return tripUpdates;
  }

  // Protobuf reading functions
  private static readStopTimeUpdate(tag: number, obj: any, pbf: Pbf) {
    if (tag === 1) obj.stopSequence = pbf.readVarint();
    else if (tag === 4) obj.stopId = pbf.readString();
    else if (tag === 2) {
      // arrival
      pbf.readMessage((tag2, obj2) => {
        if (tag2 === 1) obj.arrivalDelay = pbf.readSVarint();
        else if (tag2 === 2) obj.arrivalTime = pbf.readVarint();
        else pbf.skip(tag2 & 0x7);
      }, obj);
    } else if (tag === 3) {
      // departure
      pbf.readMessage((tag2, obj2) => {
        if (tag2 === 1) obj.departureDelay = pbf.readSVarint();
        else if (tag2 === 2) obj.departureTime = pbf.readVarint();
        else pbf.skip(tag2 & 0x7);
      }, obj);
    } else {
      pbf.skip(tag & 0x7);
    }
  }

  private static readTripDescriptor(tag: number, obj: any, pbf: Pbf) {
    if (tag === 1) obj.tripId = pbf.readString();
    else pbf.skip(tag & 0x7);
  }

  private static readTripUpdate(tag: number, obj: any, pbf: Pbf) {
    if (tag === 1) {
      obj.trip = pbf.readMessage(ProtobufDecoder.readTripDescriptor, {});
    } else if (tag === 2) {
      if (!obj.stopTimeUpdates) obj.stopTimeUpdates = [];
      obj.stopTimeUpdates.push(
        pbf.readMessage(ProtobufDecoder.readStopTimeUpdate, {})
      );
    } else {
      pbf.skip(tag & 0x7);
    }
  }

  private static readFeedEntity(tag: number, obj: any, pbf: Pbf) {
    if (tag === 1) obj.id = pbf.readString();
    else if (tag === 3)
      obj.tripUpdate = pbf.readMessage(ProtobufDecoder.readTripUpdate, {});
    else pbf.skip(tag & 0x7);
  }

  private static readFeedMessage(tag: number, obj: any, pbf: Pbf) {
    if (tag === 2) {
      if (!obj.entities) obj.entities = [];
      obj.entities.push(pbf.readMessage(ProtobufDecoder.readFeedEntity, {}));
    } else {
      pbf.skip(tag & 0x7);
    }
  }
}
