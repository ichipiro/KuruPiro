const descriptor = {
  nested: {
    transit_realtime: {
      nested: {
        FeedMessage: {
          fields: {
            header: { type: 'FeedHeader', id: 1 },
            entity: { rule: 'repeated', type: 'FeedEntity', id: 2 },
          },
        },
        FeedHeader: {
          fields: {
            gtfs_realtime_version: { type: 'string', id: 1 },
            incrementality: {
              type: 'Incrementality',
              id: 2,
              options: { default: 'FULL_DATASET' },
            },
            timestamp: { type: 'uint64', id: 3 },
          },
          nested: {
            Incrementality: {
              values: { FULL_DATASET: 0, DIFFERENTIAL: 1 },
            },
          },
        },
        FeedEntity: {
          fields: {
            id: { type: 'string', id: 1 },
            is_deleted: { type: 'bool', id: 2 },
            trip_update: { type: 'TripUpdate', id: 3 },
            vehicle: { type: 'VehiclePosition', id: 4 },
            alert: { type: 'Alert', id: 5 },
          },
        },
        TripUpdate: {
          fields: {
            trip: { type: 'TripDescriptor', id: 1 },
            stop_time_update: {
              rule: 'repeated',
              type: 'StopTimeUpdate',
              id: 2,
            },
            vehicle: { type: 'VehicleDescriptor', id: 3 },
            timestamp: { type: 'uint64', id: 4 },
            delay: { type: 'int32', id: 5 },
          },
        },
        VehiclePosition: {
          fields: {
            trip: { type: 'TripDescriptor', id: 1 },
            position: { type: 'Position', id: 2 },
            current_stop_sequence: { type: 'uint32', id: 3 },
            current_status: {
              type: 'VehicleStopStatus',
              id: 4,
              options: { default: 'IN_TRANSIT_TO' },
            },
            timestamp: { type: 'uint64', id: 5 },
            congestion_level: {
              type: 'CongestionLevel',
              id: 6,
              options: { default: 'UNKNOWN_CONGESTION_LEVEL' },
            },
            stop_id: { type: 'string', id: 7 },
            vehicle: { type: 'VehicleDescriptor', id: 8 },
            occupancy_status: { type: 'OccupancyStatus', id: 9 },
          },
          nested: {
            VehicleStopStatus: {
              values: {
                INCOMING_AT: 0,
                STOPPED_AT: 1,
                IN_TRANSIT_TO: 2,
              },
            },
            CongestionLevel: {
              values: {
                UNKNOWN_CONGESTION_LEVEL: 0,
                RUNNING_SMOOTHLY: 1,
                STOP_AND_GO: 2,
                CONGESTION: 3,
                SEVERE_CONGESTION: 4,
              },
            },
            OccupancyStatus: {
              values: {
                EMPTY: 0,
                MANY_SEATS_AVAILABLE: 1,
                FEW_SEATS_AVAILABLE: 2,
                STANDING_ROOM_ONLY: 3,
                CRUSHED_STANDING_ROOM_ONLY: 4,
                FULL: 5,
                NOT_ACCEPTING_PASSENGERS: 6,
                NO_DATA_AVAILABLE: 7,
                NOT_BOARDABLE: 8,
              },
            },
          },
        },
        TripDescriptor: {
          fields: {
            trip_id: { type: 'string', id: 1 },
            route_id: { type: 'string', id: 2 },
            direction_id: { type: 'uint32', id: 3 },
            start_time: { type: 'string', id: 4 },
            start_date: { type: 'string', id: 5 },
            schedule_relationship: {
              type: 'ScheduleRelationship',
              id: 6,
              options: { default: 'SCHEDULED' },
            },
          },
          nested: {
            ScheduleRelationship: {
              values: {
                SCHEDULED: 0,
                ADDED: 1,
                UNSCHEDULED: 2,
                CANCELED: 3,
                REPLACEMENT: 5,
                DUPLICATED: 6,
              },
            },
          },
        },
        VehicleDescriptor: {
          fields: {
            id: { type: 'string', id: 1 },
            label: { type: 'string', id: 2 },
            license_plate: { type: 'string', id: 3 },
          },
        },
        Position: {
          fields: {
            latitude: { type: 'float', id: 1 },
            longitude: { type: 'float', id: 2 },
            bearing: { type: 'float', id: 3 },
            odometer: { type: 'double', id: 4 },
            speed: { type: 'float', id: 5 },
          },
        },
        StopTimeUpdate: {
          fields: {
            stop_sequence: { type: 'uint32', id: 1 },
            stop_id: { type: 'string', id: 2 },
            arrival: { type: 'StopTimeEvent', id: 3 },
            departure: { type: 'StopTimeEvent', id: 4 },
            schedule_relationship: {
              type: 'ScheduleRelationship',
              id: 5,
              options: { default: 'SCHEDULED' },
            },
            stop_time_properties: { type: 'StopTimeProperties', id: 6 },
          },
          nested: {
            ScheduleRelationship: {
              values: {
                SCHEDULED: 0,
                SKIPPED: 1,
                NO_DATA: 2,
              },
            },
            StopTimeProperties: {
              fields: {
                trip_id: { type: 'string', id: 1 },
                start_time: { type: 'string', id: 2 },
                start_date: { type: 'string', id: 3 },
              },
            },
          },
        },
        StopTimeEvent: {
          fields: {
            delay: { type: 'int32', id: 1 },
            time: { type: 'int64', id: 2 },
            uncertainty: { type: 'int32', id: 3 },
          },
        },
        Alert: {
          fields: {
            active_period: { rule: 'repeated', type: 'TimeRange', id: 1 },
            informed_entity: { rule: 'repeated', type: 'EntitySelector', id: 5 },
            cause: { type: 'Cause', id: 6, options: { default: 'UNKNOWN_CAUSE' } },
            effect: { type: 'Effect', id: 7, options: { default: 'UNKNOWN_EFFECT' } },
            url: { type: 'TranslatedString', id: 8 },
            header_text: { type: 'TranslatedString', id: 10 },
            description_text: { type: 'TranslatedString', id: 11 },
            tts_header_text: { type: 'TranslatedString', id: 12 },
            tts_description_text: { type: 'TranslatedString', id: 13 },
          },
          nested: {
            Cause: {
              values: {
                UNKNOWN_CAUSE: 1,
                OTHER_CAUSE: 2,
                TECHNICAL_PROBLEM: 3,
                STRIKE: 4,
                DEMONSTRATION: 5,
                ACCIDENT: 6,
                HOLIDAY: 7,
                WEATHER: 8,
                MAINTENANCE: 9,
                CONSTRUCTION: 10,
                POLICE_ACTIVITY: 11,
                MEDICAL_EMERGENCY: 12,
              },
            },
            Effect: {
              values: {
                NO_SERVICE: 1,
                REDUCED_SERVICE: 2,
                SIGNIFICANT_DELAYS: 3,
                DETOUR: 4,
                ADDITIONAL_SERVICE: 5,
                MODIFIED_SERVICE: 6,
                OTHER_EFFECT: 7,
                UNKNOWN_EFFECT: 8,
                STOP_MOVED: 9,
              },
            },
          },
        },
        TimeRange: {
          fields: {
            start: { type: 'uint64', id: 1 },
            end: { type: 'uint64', id: 2 },
          },
        },
        EntitySelector: {
          fields: {
            agency_id: { type: 'string', id: 1 },
            route_id: { type: 'string', id: 2 },
            route_type: { type: 'int32', id: 3 },
            trip: { type: 'TripDescriptor', id: 4 },
            stop_id: { type: 'string', id: 5 },
          },
        },
        TranslatedString: {
          fields: {
            translation: { rule: 'repeated', type: 'Translation', id: 1 },
          },
        },
        Translation: {
          fields: {
            text: { type: 'string', id: 1 },
            language: { type: 'string', id: 2 },
          },
        },
      },
    },
  },
} as const;

export default descriptor;
