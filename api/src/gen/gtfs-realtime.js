/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $RangeError = $util.global.RangeError, $Array = $util.global.Array, $TypeError = $util.global.TypeError, $String = $util.global.String, $parseInt = $util.global.parseInt, $Number = $util.global.Number, $BigInt = $util.global.BigInt, $Boolean = $util.global.Boolean, $isFinite = $util.global.isFinite;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const transit_realtime = $root.transit_realtime = (() => {

    /**
     * Namespace transit_realtime.
     * @exports transit_realtime
     * @namespace
     */
    const transit_realtime = {};

    transit_realtime.FeedMessage = (function() {

        /**
         * Properties of a FeedMessage.
         * @typedef {Object} transit_realtime.FeedMessage.$Properties
         * @property {transit_realtime.FeedHeader.$Properties} header FeedMessage header
         * @property {Array.<transit_realtime.FeedEntity.$Properties>|null} [entity] FeedMessage entity
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a FeedMessage.
         * @memberof transit_realtime
         * @interface IFeedMessage
         * @augments transit_realtime.FeedMessage.$Properties
         * @deprecated Use transit_realtime.FeedMessage.$Properties instead.
         */

        /**
         * Shape of a FeedMessage.
         * @typedef {transit_realtime.FeedMessage.$Properties} transit_realtime.FeedMessage.$Shape
         */

        /**
         * Constructs a new FeedMessage.
         * @memberof transit_realtime
         * @classdesc Represents a FeedMessage.
         * @constructor
         * @param {transit_realtime.FeedMessage.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const FeedMessage = function (properties) {
            this.entity = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * FeedMessage header.
         * @member {transit_realtime.FeedHeader.$Properties} header
         * @memberof transit_realtime.FeedMessage
         * @instance
         */
        FeedMessage.prototype.header = null;

        /**
         * FeedMessage entity.
         * @member {Array.<transit_realtime.FeedEntity.$Properties>} entity
         * @memberof transit_realtime.FeedMessage
         * @instance
         */
        FeedMessage.prototype.entity = $util.emptyArray;

        /**
         * Creates a new FeedMessage instance using the specified properties.
         * @function create
         * @memberof transit_realtime.FeedMessage
         * @static
         * @param {transit_realtime.FeedMessage.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.FeedMessage} FeedMessage instance
         * @type {{
         *   (properties: transit_realtime.FeedMessage.$Shape): transit_realtime.FeedMessage & transit_realtime.FeedMessage.$Shape;
         *   (properties?: transit_realtime.FeedMessage.$Properties): transit_realtime.FeedMessage;
         * }}
         */
        FeedMessage.create = function(properties) {
            return new FeedMessage(properties);
        };

        /**
         * Encodes the specified FeedMessage message. Does not implicitly {@link transit_realtime.FeedMessage.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.FeedMessage
         * @static
         * @param {transit_realtime.FeedMessage.$Properties} message FeedMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FeedMessage.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            $root.transit_realtime.FeedHeader.encode(message.header, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.entity != null && message.entity.length)
                for (let i = 0; i < message.entity.length; ++i)
                    $root.transit_realtime.FeedEntity.encode(message.entity[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified FeedMessage message, length delimited. Does not implicitly {@link transit_realtime.FeedMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.FeedMessage
         * @static
         * @param {transit_realtime.FeedMessage.$Properties} message FeedMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FeedMessage.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a FeedMessage message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.FeedMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.FeedMessage & transit_realtime.FeedMessage.$Shape} FeedMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FeedMessage.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.FeedMessage();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.header = $root.transit_realtime.FeedHeader.decode(reader, reader.uint32(), $undefined, _depth + 1, message.header);
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if (!(message.entity && message.entity.length))
                            message.entity = [];
                        message.entity.push($root.transit_realtime.FeedEntity.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            if (!$Object.hasOwnProperty.call(message, "header"))
                throw $util.ProtocolError("missing required 'header'", { instance: message });
            return message;
        };

        /**
         * Decodes a FeedMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.FeedMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.FeedMessage & transit_realtime.FeedMessage.$Shape} FeedMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FeedMessage.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FeedMessage message.
         * @function verify
         * @memberof transit_realtime.FeedMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FeedMessage.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            {
                let error = $root.transit_realtime.FeedHeader.verify(message.header, _depth + 1);
                if (error)
                    return "header." + error;
            }
            if (message.entity != null && $Object.hasOwnProperty.call(message, "entity")) {
                if (!$Array.isArray(message.entity))
                    return "entity: array expected";
                for (let i = 0; i < message.entity.length; ++i) {
                    let error = $root.transit_realtime.FeedEntity.verify(message.entity[i], _depth + 1);
                    if (error)
                        return "entity." + error;
                }
            }
            return null;
        };

        /**
         * Creates a FeedMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.FeedMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.FeedMessage} FeedMessage
         */
        FeedMessage.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.FeedMessage)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.FeedMessage: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.FeedMessage();
            if (object.header != null) {
                if (!$util.isObject(object.header))
                    throw $TypeError(".transit_realtime.FeedMessage.header: object expected");
                message.header = $root.transit_realtime.FeedHeader.fromObject(object.header, _depth + 1);
            }
            if (object.entity) {
                if (!$Array.isArray(object.entity))
                    throw $TypeError(".transit_realtime.FeedMessage.entity: array expected");
                message.entity = $Array(object.entity.length);
                for (let i = 0; i < object.entity.length; ++i) {
                    if (!$util.isObject(object.entity[i]))
                        throw $TypeError(".transit_realtime.FeedMessage.entity: object expected");
                    message.entity[i] = $root.transit_realtime.FeedEntity.fromObject(object.entity[i], _depth + 1);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a FeedMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.FeedMessage
         * @static
         * @param {transit_realtime.FeedMessage} message FeedMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FeedMessage.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults)
                object.entity = [];
            if (options.defaults)
                object.header = null;
            if (message.header != null && $Object.hasOwnProperty.call(message, "header"))
                object.header = $root.transit_realtime.FeedHeader.toObject(message.header, options, _depth + 1);
            if (message.entity && message.entity.length) {
                object.entity = $Array(message.entity.length);
                for (let j = 0; j < message.entity.length; ++j)
                    object.entity[j] = $root.transit_realtime.FeedEntity.toObject(message.entity[j], options, _depth + 1);
            }
            return object;
        };

        /**
         * Converts this FeedMessage to JSON.
         * @function toJSON
         * @memberof transit_realtime.FeedMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FeedMessage.prototype.toJSON = function() {
            return FeedMessage.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for FeedMessage
         * @function getTypeUrl
         * @memberof transit_realtime.FeedMessage
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        FeedMessage.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.FeedMessage";
        };

        return FeedMessage;
    })();

    transit_realtime.FeedHeader = (function() {

        /**
         * Properties of a FeedHeader.
         * @typedef {Object} transit_realtime.FeedHeader.$Properties
         * @property {string} gtfsRealtimeVersion FeedHeader gtfsRealtimeVersion
         * @property {transit_realtime.FeedHeader.Incrementality|null} [incrementality] FeedHeader incrementality
         * @property {number|Long|null} [timestamp] FeedHeader timestamp
         * @property {string|null} [feedVersion] FeedHeader feedVersion
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a FeedHeader.
         * @memberof transit_realtime
         * @interface IFeedHeader
         * @augments transit_realtime.FeedHeader.$Properties
         * @deprecated Use transit_realtime.FeedHeader.$Properties instead.
         */

        /**
         * Shape of a FeedHeader.
         * @typedef {transit_realtime.FeedHeader.$Properties} transit_realtime.FeedHeader.$Shape
         */

        /**
         * Constructs a new FeedHeader.
         * @memberof transit_realtime
         * @classdesc Represents a FeedHeader.
         * @constructor
         * @param {transit_realtime.FeedHeader.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const FeedHeader = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * FeedHeader gtfsRealtimeVersion.
         * @member {string} gtfsRealtimeVersion
         * @memberof transit_realtime.FeedHeader
         * @instance
         */
        FeedHeader.prototype.gtfsRealtimeVersion = "";

        /**
         * FeedHeader incrementality.
         * @member {transit_realtime.FeedHeader.Incrementality} incrementality
         * @memberof transit_realtime.FeedHeader
         * @instance
         */
        FeedHeader.prototype.incrementality = 0;

        /**
         * FeedHeader timestamp.
         * @member {number|Long} timestamp
         * @memberof transit_realtime.FeedHeader
         * @instance
         */
        FeedHeader.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * FeedHeader feedVersion.
         * @member {string} feedVersion
         * @memberof transit_realtime.FeedHeader
         * @instance
         */
        FeedHeader.prototype.feedVersion = "";

        /**
         * Creates a new FeedHeader instance using the specified properties.
         * @function create
         * @memberof transit_realtime.FeedHeader
         * @static
         * @param {transit_realtime.FeedHeader.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.FeedHeader} FeedHeader instance
         * @type {{
         *   (properties: transit_realtime.FeedHeader.$Shape): transit_realtime.FeedHeader & transit_realtime.FeedHeader.$Shape;
         *   (properties?: transit_realtime.FeedHeader.$Properties): transit_realtime.FeedHeader;
         * }}
         */
        FeedHeader.create = function(properties) {
            return new FeedHeader(properties);
        };

        /**
         * Encodes the specified FeedHeader message. Does not implicitly {@link transit_realtime.FeedHeader.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.FeedHeader
         * @static
         * @param {transit_realtime.FeedHeader.$Properties} message FeedHeader message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FeedHeader.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.gtfsRealtimeVersion);
            if (message.incrementality != null && $Object.hasOwnProperty.call(message, "incrementality"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.incrementality);
            if (message.timestamp != null && $Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.timestamp);
            if (message.feedVersion != null && $Object.hasOwnProperty.call(message, "feedVersion"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.feedVersion);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified FeedHeader message, length delimited. Does not implicitly {@link transit_realtime.FeedHeader.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.FeedHeader
         * @static
         * @param {transit_realtime.FeedHeader.$Properties} message FeedHeader message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FeedHeader.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a FeedHeader message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.FeedHeader
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.FeedHeader & transit_realtime.FeedHeader.$Shape} FeedHeader
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FeedHeader.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message, value;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.FeedHeader();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.gtfsRealtimeVersion = reader.string();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        value = reader.int32();
                        if ($root.transit_realtime.FeedHeader.Incrementality[value] !== $undefined)
                            message.incrementality = value;
                        else if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        message.timestamp = reader.uint64();
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.feedVersion = reader.string();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            if (!$Object.hasOwnProperty.call(message, "gtfsRealtimeVersion"))
                throw $util.ProtocolError("missing required 'gtfsRealtimeVersion'", { instance: message });
            return message;
        };

        /**
         * Decodes a FeedHeader message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.FeedHeader
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.FeedHeader & transit_realtime.FeedHeader.$Shape} FeedHeader
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FeedHeader.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FeedHeader message.
         * @function verify
         * @memberof transit_realtime.FeedHeader
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FeedHeader.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (!$util.isString(message.gtfsRealtimeVersion))
                return "gtfsRealtimeVersion: string expected";
            if (message.incrementality != null && $Object.hasOwnProperty.call(message, "incrementality"))
                switch (message.incrementality) {
                default:
                    return "incrementality: enum value expected";
                case 0:
                case 1:
                    break;
                }
            if (message.timestamp != null && $Object.hasOwnProperty.call(message, "timestamp"))
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                    return "timestamp: integer|Long expected";
            if (message.feedVersion != null && $Object.hasOwnProperty.call(message, "feedVersion"))
                if (!$util.isString(message.feedVersion))
                    return "feedVersion: string expected";
            return null;
        };

        /**
         * Creates a FeedHeader message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.FeedHeader
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.FeedHeader} FeedHeader
         */
        FeedHeader.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.FeedHeader)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.FeedHeader: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.FeedHeader();
            if (object.gtfsRealtimeVersion != null)
                message.gtfsRealtimeVersion = $String(object.gtfsRealtimeVersion);
            switch (object.incrementality) {
            case "FULL_DATASET":
            case 0:
                message.incrementality = 0;
                break;
            case "DIFFERENTIAL":
            case 1:
                message.incrementality = 1;
                break;
            default:
            }
            if (object.timestamp != null)
                if ($util.Long)
                    message.timestamp = $util.Long.fromValue(object.timestamp, true);
                else if (typeof object.timestamp === "string")
                    message.timestamp = $parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                    message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                    message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber(true);
            if (object.feedVersion != null)
                message.feedVersion = $String(object.feedVersion);
            return message;
        };

        /**
         * Creates a plain object from a FeedHeader message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.FeedHeader
         * @static
         * @param {transit_realtime.FeedHeader} message FeedHeader
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FeedHeader.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.gtfsRealtimeVersion = "";
                object.incrementality = options.enums === $String ? "FULL_DATASET" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.timestamp = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.timestamp = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                object.feedVersion = "";
            }
            if (message.gtfsRealtimeVersion != null && $Object.hasOwnProperty.call(message, "gtfsRealtimeVersion"))
                object.gtfsRealtimeVersion = message.gtfsRealtimeVersion;
            if (message.incrementality != null && $Object.hasOwnProperty.call(message, "incrementality"))
                object.incrementality = options.enums === $String ? $root.transit_realtime.FeedHeader.Incrementality[message.incrementality] === $undefined ? message.incrementality : $root.transit_realtime.FeedHeader.Incrementality[message.incrementality] : message.incrementality;
            if (message.timestamp != null && $Object.hasOwnProperty.call(message, "timestamp"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.timestamp = typeof message.timestamp === "number" ? $BigInt(message.timestamp) : $util.Long.fromBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0, true).toBigInt();
                else if (typeof message.timestamp === "number")
                    object.timestamp = options.longs === $String ? $String(message.timestamp) : message.timestamp;
                else
                    object.timestamp = options.longs === $String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === $Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber(true) : message.timestamp;
            if (message.feedVersion != null && $Object.hasOwnProperty.call(message, "feedVersion"))
                object.feedVersion = message.feedVersion;
            return object;
        };

        /**
         * Converts this FeedHeader to JSON.
         * @function toJSON
         * @memberof transit_realtime.FeedHeader
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FeedHeader.prototype.toJSON = function() {
            return FeedHeader.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for FeedHeader
         * @function getTypeUrl
         * @memberof transit_realtime.FeedHeader
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        FeedHeader.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.FeedHeader";
        };

        /**
         * Incrementality enum.
         * @name transit_realtime.FeedHeader.Incrementality
         * @enum {number}
         * @property {number} FULL_DATASET=0 FULL_DATASET value
         * @property {number} DIFFERENTIAL=1 DIFFERENTIAL value
         */
        FeedHeader.Incrementality = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "FULL_DATASET"] = 0;
            values[valuesById[1] = "DIFFERENTIAL"] = 1;
            return values;
        })();

        return FeedHeader;
    })();

    transit_realtime.FeedEntity = (function() {

        /**
         * Properties of a FeedEntity.
         * @typedef {Object} transit_realtime.FeedEntity.$Properties
         * @property {string} id FeedEntity id
         * @property {boolean|null} [isDeleted] FeedEntity isDeleted
         * @property {transit_realtime.TripUpdate.$Properties|null} [tripUpdate] FeedEntity tripUpdate
         * @property {transit_realtime.VehiclePosition.$Properties|null} [vehicle] FeedEntity vehicle
         * @property {transit_realtime.Alert.$Properties|null} [alert] FeedEntity alert
         * @property {transit_realtime.Shape.$Properties|null} [shape] FeedEntity shape
         * @property {transit_realtime.Stop.$Properties|null} [stop] FeedEntity stop
         * @property {transit_realtime.TripModifications.$Properties|null} [tripModifications] FeedEntity tripModifications
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a FeedEntity.
         * @memberof transit_realtime
         * @interface IFeedEntity
         * @augments transit_realtime.FeedEntity.$Properties
         * @deprecated Use transit_realtime.FeedEntity.$Properties instead.
         */

        /**
         * Shape of a FeedEntity.
         * @typedef {transit_realtime.FeedEntity.$Properties} transit_realtime.FeedEntity.$Shape
         */

        /**
         * Constructs a new FeedEntity.
         * @memberof transit_realtime
         * @classdesc Represents a FeedEntity.
         * @constructor
         * @param {transit_realtime.FeedEntity.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const FeedEntity = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * FeedEntity id.
         * @member {string} id
         * @memberof transit_realtime.FeedEntity
         * @instance
         */
        FeedEntity.prototype.id = "";

        /**
         * FeedEntity isDeleted.
         * @member {boolean} isDeleted
         * @memberof transit_realtime.FeedEntity
         * @instance
         */
        FeedEntity.prototype.isDeleted = false;

        /**
         * FeedEntity tripUpdate.
         * @member {transit_realtime.TripUpdate.$Properties|null|undefined} tripUpdate
         * @memberof transit_realtime.FeedEntity
         * @instance
         */
        FeedEntity.prototype.tripUpdate = null;

        /**
         * FeedEntity vehicle.
         * @member {transit_realtime.VehiclePosition.$Properties|null|undefined} vehicle
         * @memberof transit_realtime.FeedEntity
         * @instance
         */
        FeedEntity.prototype.vehicle = null;

        /**
         * FeedEntity alert.
         * @member {transit_realtime.Alert.$Properties|null|undefined} alert
         * @memberof transit_realtime.FeedEntity
         * @instance
         */
        FeedEntity.prototype.alert = null;

        /**
         * FeedEntity shape.
         * @member {transit_realtime.Shape.$Properties|null|undefined} shape
         * @memberof transit_realtime.FeedEntity
         * @instance
         */
        FeedEntity.prototype.shape = null;

        /**
         * FeedEntity stop.
         * @member {transit_realtime.Stop.$Properties|null|undefined} stop
         * @memberof transit_realtime.FeedEntity
         * @instance
         */
        FeedEntity.prototype.stop = null;

        /**
         * FeedEntity tripModifications.
         * @member {transit_realtime.TripModifications.$Properties|null|undefined} tripModifications
         * @memberof transit_realtime.FeedEntity
         * @instance
         */
        FeedEntity.prototype.tripModifications = null;

        /**
         * Creates a new FeedEntity instance using the specified properties.
         * @function create
         * @memberof transit_realtime.FeedEntity
         * @static
         * @param {transit_realtime.FeedEntity.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.FeedEntity} FeedEntity instance
         * @type {{
         *   (properties: transit_realtime.FeedEntity.$Shape): transit_realtime.FeedEntity & transit_realtime.FeedEntity.$Shape;
         *   (properties?: transit_realtime.FeedEntity.$Properties): transit_realtime.FeedEntity;
         * }}
         */
        FeedEntity.create = function(properties) {
            return new FeedEntity(properties);
        };

        /**
         * Encodes the specified FeedEntity message. Does not implicitly {@link transit_realtime.FeedEntity.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.FeedEntity
         * @static
         * @param {transit_realtime.FeedEntity.$Properties} message FeedEntity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FeedEntity.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.isDeleted != null && $Object.hasOwnProperty.call(message, "isDeleted"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isDeleted);
            if (message.tripUpdate != null && $Object.hasOwnProperty.call(message, "tripUpdate"))
                $root.transit_realtime.TripUpdate.encode(message.tripUpdate, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
            if (message.vehicle != null && $Object.hasOwnProperty.call(message, "vehicle"))
                $root.transit_realtime.VehiclePosition.encode(message.vehicle, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
            if (message.alert != null && $Object.hasOwnProperty.call(message, "alert"))
                $root.transit_realtime.Alert.encode(message.alert, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
            if (message.shape != null && $Object.hasOwnProperty.call(message, "shape"))
                $root.transit_realtime.Shape.encode(message.shape, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
            if (message.stop != null && $Object.hasOwnProperty.call(message, "stop"))
                $root.transit_realtime.Stop.encode(message.stop, writer.uint32(/* id 7, wireType 2 =*/58).fork(), _depth + 1).ldelim();
            if (message.tripModifications != null && $Object.hasOwnProperty.call(message, "tripModifications"))
                $root.transit_realtime.TripModifications.encode(message.tripModifications, writer.uint32(/* id 8, wireType 2 =*/66).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified FeedEntity message, length delimited. Does not implicitly {@link transit_realtime.FeedEntity.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.FeedEntity
         * @static
         * @param {transit_realtime.FeedEntity.$Properties} message FeedEntity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FeedEntity.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a FeedEntity message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.FeedEntity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.FeedEntity & transit_realtime.FeedEntity.$Shape} FeedEntity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FeedEntity.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.FeedEntity();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.id = reader.string();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.isDeleted = reader.bool();
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.tripUpdate = $root.transit_realtime.TripUpdate.decode(reader, reader.uint32(), $undefined, _depth + 1, message.tripUpdate);
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.vehicle = $root.transit_realtime.VehiclePosition.decode(reader, reader.uint32(), $undefined, _depth + 1, message.vehicle);
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        message.alert = $root.transit_realtime.Alert.decode(reader, reader.uint32(), $undefined, _depth + 1, message.alert);
                        continue;
                    }
                case 6: {
                        if (wireType !== 2)
                            break;
                        message.shape = $root.transit_realtime.Shape.decode(reader, reader.uint32(), $undefined, _depth + 1, message.shape);
                        continue;
                    }
                case 7: {
                        if (wireType !== 2)
                            break;
                        message.stop = $root.transit_realtime.Stop.decode(reader, reader.uint32(), $undefined, _depth + 1, message.stop);
                        continue;
                    }
                case 8: {
                        if (wireType !== 2)
                            break;
                        message.tripModifications = $root.transit_realtime.TripModifications.decode(reader, reader.uint32(), $undefined, _depth + 1, message.tripModifications);
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            if (!$Object.hasOwnProperty.call(message, "id"))
                throw $util.ProtocolError("missing required 'id'", { instance: message });
            return message;
        };

        /**
         * Decodes a FeedEntity message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.FeedEntity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.FeedEntity & transit_realtime.FeedEntity.$Shape} FeedEntity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FeedEntity.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FeedEntity message.
         * @function verify
         * @memberof transit_realtime.FeedEntity
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FeedEntity.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (!$util.isString(message.id))
                return "id: string expected";
            if (message.isDeleted != null && $Object.hasOwnProperty.call(message, "isDeleted"))
                if (typeof message.isDeleted !== "boolean")
                    return "isDeleted: boolean expected";
            if (message.tripUpdate != null && $Object.hasOwnProperty.call(message, "tripUpdate")) {
                let error = $root.transit_realtime.TripUpdate.verify(message.tripUpdate, _depth + 1);
                if (error)
                    return "tripUpdate." + error;
            }
            if (message.vehicle != null && $Object.hasOwnProperty.call(message, "vehicle")) {
                let error = $root.transit_realtime.VehiclePosition.verify(message.vehicle, _depth + 1);
                if (error)
                    return "vehicle." + error;
            }
            if (message.alert != null && $Object.hasOwnProperty.call(message, "alert")) {
                let error = $root.transit_realtime.Alert.verify(message.alert, _depth + 1);
                if (error)
                    return "alert." + error;
            }
            if (message.shape != null && $Object.hasOwnProperty.call(message, "shape")) {
                let error = $root.transit_realtime.Shape.verify(message.shape, _depth + 1);
                if (error)
                    return "shape." + error;
            }
            if (message.stop != null && $Object.hasOwnProperty.call(message, "stop")) {
                let error = $root.transit_realtime.Stop.verify(message.stop, _depth + 1);
                if (error)
                    return "stop." + error;
            }
            if (message.tripModifications != null && $Object.hasOwnProperty.call(message, "tripModifications")) {
                let error = $root.transit_realtime.TripModifications.verify(message.tripModifications, _depth + 1);
                if (error)
                    return "tripModifications." + error;
            }
            return null;
        };

        /**
         * Creates a FeedEntity message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.FeedEntity
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.FeedEntity} FeedEntity
         */
        FeedEntity.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.FeedEntity)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.FeedEntity: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.FeedEntity();
            if (object.id != null)
                message.id = $String(object.id);
            if (object.isDeleted != null)
                message.isDeleted = $Boolean(object.isDeleted);
            if (object.tripUpdate != null) {
                if (!$util.isObject(object.tripUpdate))
                    throw $TypeError(".transit_realtime.FeedEntity.tripUpdate: object expected");
                message.tripUpdate = $root.transit_realtime.TripUpdate.fromObject(object.tripUpdate, _depth + 1);
            }
            if (object.vehicle != null) {
                if (!$util.isObject(object.vehicle))
                    throw $TypeError(".transit_realtime.FeedEntity.vehicle: object expected");
                message.vehicle = $root.transit_realtime.VehiclePosition.fromObject(object.vehicle, _depth + 1);
            }
            if (object.alert != null) {
                if (!$util.isObject(object.alert))
                    throw $TypeError(".transit_realtime.FeedEntity.alert: object expected");
                message.alert = $root.transit_realtime.Alert.fromObject(object.alert, _depth + 1);
            }
            if (object.shape != null) {
                if (!$util.isObject(object.shape))
                    throw $TypeError(".transit_realtime.FeedEntity.shape: object expected");
                message.shape = $root.transit_realtime.Shape.fromObject(object.shape, _depth + 1);
            }
            if (object.stop != null) {
                if (!$util.isObject(object.stop))
                    throw $TypeError(".transit_realtime.FeedEntity.stop: object expected");
                message.stop = $root.transit_realtime.Stop.fromObject(object.stop, _depth + 1);
            }
            if (object.tripModifications != null) {
                if (!$util.isObject(object.tripModifications))
                    throw $TypeError(".transit_realtime.FeedEntity.tripModifications: object expected");
                message.tripModifications = $root.transit_realtime.TripModifications.fromObject(object.tripModifications, _depth + 1);
            }
            return message;
        };

        /**
         * Creates a plain object from a FeedEntity message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.FeedEntity
         * @static
         * @param {transit_realtime.FeedEntity} message FeedEntity
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FeedEntity.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.isDeleted = false;
                object.tripUpdate = null;
                object.vehicle = null;
                object.alert = null;
                object.shape = null;
                object.stop = null;
                object.tripModifications = null;
            }
            if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                object.id = message.id;
            if (message.isDeleted != null && $Object.hasOwnProperty.call(message, "isDeleted"))
                object.isDeleted = message.isDeleted;
            if (message.tripUpdate != null && $Object.hasOwnProperty.call(message, "tripUpdate"))
                object.tripUpdate = $root.transit_realtime.TripUpdate.toObject(message.tripUpdate, options, _depth + 1);
            if (message.vehicle != null && $Object.hasOwnProperty.call(message, "vehicle"))
                object.vehicle = $root.transit_realtime.VehiclePosition.toObject(message.vehicle, options, _depth + 1);
            if (message.alert != null && $Object.hasOwnProperty.call(message, "alert"))
                object.alert = $root.transit_realtime.Alert.toObject(message.alert, options, _depth + 1);
            if (message.shape != null && $Object.hasOwnProperty.call(message, "shape"))
                object.shape = $root.transit_realtime.Shape.toObject(message.shape, options, _depth + 1);
            if (message.stop != null && $Object.hasOwnProperty.call(message, "stop"))
                object.stop = $root.transit_realtime.Stop.toObject(message.stop, options, _depth + 1);
            if (message.tripModifications != null && $Object.hasOwnProperty.call(message, "tripModifications"))
                object.tripModifications = $root.transit_realtime.TripModifications.toObject(message.tripModifications, options, _depth + 1);
            return object;
        };

        /**
         * Converts this FeedEntity to JSON.
         * @function toJSON
         * @memberof transit_realtime.FeedEntity
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FeedEntity.prototype.toJSON = function() {
            return FeedEntity.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for FeedEntity
         * @function getTypeUrl
         * @memberof transit_realtime.FeedEntity
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        FeedEntity.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.FeedEntity";
        };

        return FeedEntity;
    })();

    transit_realtime.TripUpdate = (function() {

        /**
         * Properties of a TripUpdate.
         * @typedef {Object} transit_realtime.TripUpdate.$Properties
         * @property {transit_realtime.TripDescriptor.$Properties} trip TripUpdate trip
         * @property {transit_realtime.VehicleDescriptor.$Properties|null} [vehicle] TripUpdate vehicle
         * @property {Array.<transit_realtime.TripUpdate.StopTimeUpdate.$Properties>|null} [stopTimeUpdate] TripUpdate stopTimeUpdate
         * @property {number|Long|null} [timestamp] TripUpdate timestamp
         * @property {number|null} [delay] TripUpdate delay
         * @property {transit_realtime.TripUpdate.TripProperties.$Properties|null} [tripProperties] TripUpdate tripProperties
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a TripUpdate.
         * @memberof transit_realtime
         * @interface ITripUpdate
         * @augments transit_realtime.TripUpdate.$Properties
         * @deprecated Use transit_realtime.TripUpdate.$Properties instead.
         */

        /**
         * Shape of a TripUpdate.
         * @typedef {transit_realtime.TripUpdate.$Properties} transit_realtime.TripUpdate.$Shape
         */

        /**
         * Constructs a new TripUpdate.
         * @memberof transit_realtime
         * @classdesc Represents a TripUpdate.
         * @constructor
         * @param {transit_realtime.TripUpdate.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const TripUpdate = function (properties) {
            this.stopTimeUpdate = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * TripUpdate trip.
         * @member {transit_realtime.TripDescriptor.$Properties} trip
         * @memberof transit_realtime.TripUpdate
         * @instance
         */
        TripUpdate.prototype.trip = null;

        /**
         * TripUpdate vehicle.
         * @member {transit_realtime.VehicleDescriptor.$Properties|null|undefined} vehicle
         * @memberof transit_realtime.TripUpdate
         * @instance
         */
        TripUpdate.prototype.vehicle = null;

        /**
         * TripUpdate stopTimeUpdate.
         * @member {Array.<transit_realtime.TripUpdate.StopTimeUpdate.$Properties>} stopTimeUpdate
         * @memberof transit_realtime.TripUpdate
         * @instance
         */
        TripUpdate.prototype.stopTimeUpdate = $util.emptyArray;

        /**
         * TripUpdate timestamp.
         * @member {number|Long} timestamp
         * @memberof transit_realtime.TripUpdate
         * @instance
         */
        TripUpdate.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * TripUpdate delay.
         * @member {number} delay
         * @memberof transit_realtime.TripUpdate
         * @instance
         */
        TripUpdate.prototype.delay = 0;

        /**
         * TripUpdate tripProperties.
         * @member {transit_realtime.TripUpdate.TripProperties.$Properties|null|undefined} tripProperties
         * @memberof transit_realtime.TripUpdate
         * @instance
         */
        TripUpdate.prototype.tripProperties = null;

        /**
         * Creates a new TripUpdate instance using the specified properties.
         * @function create
         * @memberof transit_realtime.TripUpdate
         * @static
         * @param {transit_realtime.TripUpdate.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.TripUpdate} TripUpdate instance
         * @type {{
         *   (properties: transit_realtime.TripUpdate.$Shape): transit_realtime.TripUpdate & transit_realtime.TripUpdate.$Shape;
         *   (properties?: transit_realtime.TripUpdate.$Properties): transit_realtime.TripUpdate;
         * }}
         */
        TripUpdate.create = function(properties) {
            return new TripUpdate(properties);
        };

        /**
         * Encodes the specified TripUpdate message. Does not implicitly {@link transit_realtime.TripUpdate.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.TripUpdate
         * @static
         * @param {transit_realtime.TripUpdate.$Properties} message TripUpdate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TripUpdate.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            $root.transit_realtime.TripDescriptor.encode(message.trip, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.stopTimeUpdate != null && message.stopTimeUpdate.length)
                for (let i = 0; i < message.stopTimeUpdate.length; ++i)
                    $root.transit_realtime.TripUpdate.StopTimeUpdate.encode(message.stopTimeUpdate[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
            if (message.vehicle != null && $Object.hasOwnProperty.call(message, "vehicle"))
                $root.transit_realtime.VehicleDescriptor.encode(message.vehicle, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
            if (message.timestamp != null && $Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.timestamp);
            if (message.delay != null && $Object.hasOwnProperty.call(message, "delay"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.delay);
            if (message.tripProperties != null && $Object.hasOwnProperty.call(message, "tripProperties"))
                $root.transit_realtime.TripUpdate.TripProperties.encode(message.tripProperties, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified TripUpdate message, length delimited. Does not implicitly {@link transit_realtime.TripUpdate.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.TripUpdate
         * @static
         * @param {transit_realtime.TripUpdate.$Properties} message TripUpdate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TripUpdate.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a TripUpdate message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.TripUpdate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.TripUpdate & transit_realtime.TripUpdate.$Shape} TripUpdate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TripUpdate.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.TripUpdate();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.trip = $root.transit_realtime.TripDescriptor.decode(reader, reader.uint32(), $undefined, _depth + 1, message.trip);
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.vehicle = $root.transit_realtime.VehicleDescriptor.decode(reader, reader.uint32(), $undefined, _depth + 1, message.vehicle);
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if (!(message.stopTimeUpdate && message.stopTimeUpdate.length))
                            message.stopTimeUpdate = [];
                        message.stopTimeUpdate.push($root.transit_realtime.TripUpdate.StopTimeUpdate.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        message.timestamp = reader.uint64();
                        continue;
                    }
                case 5: {
                        if (wireType !== 0)
                            break;
                        message.delay = reader.int32();
                        continue;
                    }
                case 6: {
                        if (wireType !== 2)
                            break;
                        message.tripProperties = $root.transit_realtime.TripUpdate.TripProperties.decode(reader, reader.uint32(), $undefined, _depth + 1, message.tripProperties);
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            if (!$Object.hasOwnProperty.call(message, "trip"))
                throw $util.ProtocolError("missing required 'trip'", { instance: message });
            return message;
        };

        /**
         * Decodes a TripUpdate message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.TripUpdate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.TripUpdate & transit_realtime.TripUpdate.$Shape} TripUpdate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TripUpdate.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TripUpdate message.
         * @function verify
         * @memberof transit_realtime.TripUpdate
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TripUpdate.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            {
                let error = $root.transit_realtime.TripDescriptor.verify(message.trip, _depth + 1);
                if (error)
                    return "trip." + error;
            }
            if (message.vehicle != null && $Object.hasOwnProperty.call(message, "vehicle")) {
                let error = $root.transit_realtime.VehicleDescriptor.verify(message.vehicle, _depth + 1);
                if (error)
                    return "vehicle." + error;
            }
            if (message.stopTimeUpdate != null && $Object.hasOwnProperty.call(message, "stopTimeUpdate")) {
                if (!$Array.isArray(message.stopTimeUpdate))
                    return "stopTimeUpdate: array expected";
                for (let i = 0; i < message.stopTimeUpdate.length; ++i) {
                    let error = $root.transit_realtime.TripUpdate.StopTimeUpdate.verify(message.stopTimeUpdate[i], _depth + 1);
                    if (error)
                        return "stopTimeUpdate." + error;
                }
            }
            if (message.timestamp != null && $Object.hasOwnProperty.call(message, "timestamp"))
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                    return "timestamp: integer|Long expected";
            if (message.delay != null && $Object.hasOwnProperty.call(message, "delay"))
                if (!$util.isInteger(message.delay))
                    return "delay: integer expected";
            if (message.tripProperties != null && $Object.hasOwnProperty.call(message, "tripProperties")) {
                let error = $root.transit_realtime.TripUpdate.TripProperties.verify(message.tripProperties, _depth + 1);
                if (error)
                    return "tripProperties." + error;
            }
            return null;
        };

        /**
         * Creates a TripUpdate message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.TripUpdate
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.TripUpdate} TripUpdate
         */
        TripUpdate.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.TripUpdate)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.TripUpdate: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.TripUpdate();
            if (object.trip != null) {
                if (!$util.isObject(object.trip))
                    throw $TypeError(".transit_realtime.TripUpdate.trip: object expected");
                message.trip = $root.transit_realtime.TripDescriptor.fromObject(object.trip, _depth + 1);
            }
            if (object.vehicle != null) {
                if (!$util.isObject(object.vehicle))
                    throw $TypeError(".transit_realtime.TripUpdate.vehicle: object expected");
                message.vehicle = $root.transit_realtime.VehicleDescriptor.fromObject(object.vehicle, _depth + 1);
            }
            if (object.stopTimeUpdate) {
                if (!$Array.isArray(object.stopTimeUpdate))
                    throw $TypeError(".transit_realtime.TripUpdate.stopTimeUpdate: array expected");
                message.stopTimeUpdate = $Array(object.stopTimeUpdate.length);
                for (let i = 0; i < object.stopTimeUpdate.length; ++i) {
                    if (!$util.isObject(object.stopTimeUpdate[i]))
                        throw $TypeError(".transit_realtime.TripUpdate.stopTimeUpdate: object expected");
                    message.stopTimeUpdate[i] = $root.transit_realtime.TripUpdate.StopTimeUpdate.fromObject(object.stopTimeUpdate[i], _depth + 1);
                }
            }
            if (object.timestamp != null)
                if ($util.Long)
                    message.timestamp = $util.Long.fromValue(object.timestamp, true);
                else if (typeof object.timestamp === "string")
                    message.timestamp = $parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                    message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                    message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber(true);
            if (object.delay != null)
                message.delay = object.delay | 0;
            if (object.tripProperties != null) {
                if (!$util.isObject(object.tripProperties))
                    throw $TypeError(".transit_realtime.TripUpdate.tripProperties: object expected");
                message.tripProperties = $root.transit_realtime.TripUpdate.TripProperties.fromObject(object.tripProperties, _depth + 1);
            }
            return message;
        };

        /**
         * Creates a plain object from a TripUpdate message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.TripUpdate
         * @static
         * @param {transit_realtime.TripUpdate} message TripUpdate
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TripUpdate.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults)
                object.stopTimeUpdate = [];
            if (options.defaults) {
                object.trip = null;
                object.vehicle = null;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.timestamp = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.timestamp = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                object.delay = 0;
                object.tripProperties = null;
            }
            if (message.trip != null && $Object.hasOwnProperty.call(message, "trip"))
                object.trip = $root.transit_realtime.TripDescriptor.toObject(message.trip, options, _depth + 1);
            if (message.stopTimeUpdate && message.stopTimeUpdate.length) {
                object.stopTimeUpdate = $Array(message.stopTimeUpdate.length);
                for (let j = 0; j < message.stopTimeUpdate.length; ++j)
                    object.stopTimeUpdate[j] = $root.transit_realtime.TripUpdate.StopTimeUpdate.toObject(message.stopTimeUpdate[j], options, _depth + 1);
            }
            if (message.vehicle != null && $Object.hasOwnProperty.call(message, "vehicle"))
                object.vehicle = $root.transit_realtime.VehicleDescriptor.toObject(message.vehicle, options, _depth + 1);
            if (message.timestamp != null && $Object.hasOwnProperty.call(message, "timestamp"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.timestamp = typeof message.timestamp === "number" ? $BigInt(message.timestamp) : $util.Long.fromBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0, true).toBigInt();
                else if (typeof message.timestamp === "number")
                    object.timestamp = options.longs === $String ? $String(message.timestamp) : message.timestamp;
                else
                    object.timestamp = options.longs === $String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === $Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber(true) : message.timestamp;
            if (message.delay != null && $Object.hasOwnProperty.call(message, "delay"))
                object.delay = message.delay;
            if (message.tripProperties != null && $Object.hasOwnProperty.call(message, "tripProperties"))
                object.tripProperties = $root.transit_realtime.TripUpdate.TripProperties.toObject(message.tripProperties, options, _depth + 1);
            return object;
        };

        /**
         * Converts this TripUpdate to JSON.
         * @function toJSON
         * @memberof transit_realtime.TripUpdate
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TripUpdate.prototype.toJSON = function() {
            return TripUpdate.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for TripUpdate
         * @function getTypeUrl
         * @memberof transit_realtime.TripUpdate
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TripUpdate.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.TripUpdate";
        };

        TripUpdate.StopTimeEvent = (function() {

            /**
             * Properties of a StopTimeEvent.
             * @typedef {Object} transit_realtime.TripUpdate.StopTimeEvent.$Properties
             * @property {number|null} [delay] StopTimeEvent delay
             * @property {number|Long|null} [time] StopTimeEvent time
             * @property {number|null} [uncertainty] StopTimeEvent uncertainty
             * @property {number|Long|null} [scheduledTime] StopTimeEvent scheduledTime
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a StopTimeEvent.
             * @memberof transit_realtime.TripUpdate
             * @interface IStopTimeEvent
             * @augments transit_realtime.TripUpdate.StopTimeEvent.$Properties
             * @deprecated Use transit_realtime.TripUpdate.StopTimeEvent.$Properties instead.
             */

            /**
             * Shape of a StopTimeEvent.
             * @typedef {transit_realtime.TripUpdate.StopTimeEvent.$Properties} transit_realtime.TripUpdate.StopTimeEvent.$Shape
             */

            /**
             * Constructs a new StopTimeEvent.
             * @memberof transit_realtime.TripUpdate
             * @classdesc Represents a StopTimeEvent.
             * @constructor
             * @param {transit_realtime.TripUpdate.StopTimeEvent.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const StopTimeEvent = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * StopTimeEvent delay.
             * @member {number} delay
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @instance
             */
            StopTimeEvent.prototype.delay = 0;

            /**
             * StopTimeEvent time.
             * @member {number|Long} time
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @instance
             */
            StopTimeEvent.prototype.time = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * StopTimeEvent uncertainty.
             * @member {number} uncertainty
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @instance
             */
            StopTimeEvent.prototype.uncertainty = 0;

            /**
             * StopTimeEvent scheduledTime.
             * @member {number|Long} scheduledTime
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @instance
             */
            StopTimeEvent.prototype.scheduledTime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new StopTimeEvent instance using the specified properties.
             * @function create
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @static
             * @param {transit_realtime.TripUpdate.StopTimeEvent.$Properties=} [properties] Properties to set
             * @returns {transit_realtime.TripUpdate.StopTimeEvent} StopTimeEvent instance
             * @type {{
             *   (properties: transit_realtime.TripUpdate.StopTimeEvent.$Shape): transit_realtime.TripUpdate.StopTimeEvent & transit_realtime.TripUpdate.StopTimeEvent.$Shape;
             *   (properties?: transit_realtime.TripUpdate.StopTimeEvent.$Properties): transit_realtime.TripUpdate.StopTimeEvent;
             * }}
             */
            StopTimeEvent.create = function(properties) {
                return new StopTimeEvent(properties);
            };

            /**
             * Encodes the specified StopTimeEvent message. Does not implicitly {@link transit_realtime.TripUpdate.StopTimeEvent.verify|verify} messages.
             * @function encode
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @static
             * @param {transit_realtime.TripUpdate.StopTimeEvent.$Properties} message StopTimeEvent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StopTimeEvent.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.delay != null && $Object.hasOwnProperty.call(message, "delay"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.delay);
                if (message.time != null && $Object.hasOwnProperty.call(message, "time"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int64(message.time);
                if (message.uncertainty != null && $Object.hasOwnProperty.call(message, "uncertainty"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.uncertainty);
                if (message.scheduledTime != null && $Object.hasOwnProperty.call(message, "scheduledTime"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.scheduledTime);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified StopTimeEvent message, length delimited. Does not implicitly {@link transit_realtime.TripUpdate.StopTimeEvent.verify|verify} messages.
             * @function encodeDelimited
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @static
             * @param {transit_realtime.TripUpdate.StopTimeEvent.$Properties} message StopTimeEvent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StopTimeEvent.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a StopTimeEvent message from the specified reader or buffer.
             * @function decode
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {transit_realtime.TripUpdate.StopTimeEvent & transit_realtime.TripUpdate.StopTimeEvent.$Shape} StopTimeEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            StopTimeEvent.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.transit_realtime.TripUpdate.StopTimeEvent();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            message.delay = reader.int32();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            message.time = reader.int64();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.uncertainty = reader.int32();
                            continue;
                        }
                    case 4: {
                            if (wireType !== 0)
                                break;
                            message.scheduledTime = reader.int64();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a StopTimeEvent message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {transit_realtime.TripUpdate.StopTimeEvent & transit_realtime.TripUpdate.StopTimeEvent.$Shape} StopTimeEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            StopTimeEvent.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a StopTimeEvent message.
             * @function verify
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            StopTimeEvent.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.delay != null && $Object.hasOwnProperty.call(message, "delay"))
                    if (!$util.isInteger(message.delay))
                        return "delay: integer expected";
                if (message.time != null && $Object.hasOwnProperty.call(message, "time"))
                    if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                        return "time: integer|Long expected";
                if (message.uncertainty != null && $Object.hasOwnProperty.call(message, "uncertainty"))
                    if (!$util.isInteger(message.uncertainty))
                        return "uncertainty: integer expected";
                if (message.scheduledTime != null && $Object.hasOwnProperty.call(message, "scheduledTime"))
                    if (!$util.isInteger(message.scheduledTime) && !(message.scheduledTime && $util.isInteger(message.scheduledTime.low) && $util.isInteger(message.scheduledTime.high)))
                        return "scheduledTime: integer|Long expected";
                return null;
            };

            /**
             * Creates a StopTimeEvent message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {transit_realtime.TripUpdate.StopTimeEvent} StopTimeEvent
             */
            StopTimeEvent.fromObject = function (object, _depth) {
                if (object instanceof $root.transit_realtime.TripUpdate.StopTimeEvent)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".transit_realtime.TripUpdate.StopTimeEvent: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.transit_realtime.TripUpdate.StopTimeEvent();
                if (object.delay != null)
                    message.delay = object.delay | 0;
                if (object.time != null)
                    if ($util.Long)
                        message.time = $util.Long.fromValue(object.time, false);
                    else if (typeof object.time === "string")
                        message.time = $parseInt(object.time, 10);
                    else if (typeof object.time === "number")
                        message.time = object.time;
                    else if (typeof object.time === "object")
                        message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
                if (object.uncertainty != null)
                    message.uncertainty = object.uncertainty | 0;
                if (object.scheduledTime != null)
                    if ($util.Long)
                        message.scheduledTime = $util.Long.fromValue(object.scheduledTime, false);
                    else if (typeof object.scheduledTime === "string")
                        message.scheduledTime = $parseInt(object.scheduledTime, 10);
                    else if (typeof object.scheduledTime === "number")
                        message.scheduledTime = object.scheduledTime;
                    else if (typeof object.scheduledTime === "object")
                        message.scheduledTime = new $util.LongBits(object.scheduledTime.low >>> 0, object.scheduledTime.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a StopTimeEvent message. Also converts values to other types if specified.
             * @function toObject
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @static
             * @param {transit_realtime.TripUpdate.StopTimeEvent} message StopTimeEvent
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            StopTimeEvent.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.delay = 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.time = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.time = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                    object.uncertainty = 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.scheduledTime = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.scheduledTime = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                }
                if (message.delay != null && $Object.hasOwnProperty.call(message, "delay"))
                    object.delay = message.delay;
                if (message.time != null && $Object.hasOwnProperty.call(message, "time"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.time = typeof message.time === "number" ? $BigInt(message.time) : $util.Long.fromBits(message.time.low >>> 0, message.time.high >>> 0, false).toBigInt();
                    else if (typeof message.time === "number")
                        object.time = options.longs === $String ? $String(message.time) : message.time;
                    else
                        object.time = options.longs === $String ? $util.Long.prototype.toString.call(message.time) : options.longs === $Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
                if (message.uncertainty != null && $Object.hasOwnProperty.call(message, "uncertainty"))
                    object.uncertainty = message.uncertainty;
                if (message.scheduledTime != null && $Object.hasOwnProperty.call(message, "scheduledTime"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.scheduledTime = typeof message.scheduledTime === "number" ? $BigInt(message.scheduledTime) : $util.Long.fromBits(message.scheduledTime.low >>> 0, message.scheduledTime.high >>> 0, false).toBigInt();
                    else if (typeof message.scheduledTime === "number")
                        object.scheduledTime = options.longs === $String ? $String(message.scheduledTime) : message.scheduledTime;
                    else
                        object.scheduledTime = options.longs === $String ? $util.Long.prototype.toString.call(message.scheduledTime) : options.longs === $Number ? new $util.LongBits(message.scheduledTime.low >>> 0, message.scheduledTime.high >>> 0).toNumber() : message.scheduledTime;
                return object;
            };

            /**
             * Converts this StopTimeEvent to JSON.
             * @function toJSON
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            StopTimeEvent.prototype.toJSON = function() {
                return StopTimeEvent.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for StopTimeEvent
             * @function getTypeUrl
             * @memberof transit_realtime.TripUpdate.StopTimeEvent
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            StopTimeEvent.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/transit_realtime.TripUpdate.StopTimeEvent";
            };

            return StopTimeEvent;
        })();

        TripUpdate.StopTimeUpdate = (function() {

            /**
             * Properties of a StopTimeUpdate.
             * @typedef {Object} transit_realtime.TripUpdate.StopTimeUpdate.$Properties
             * @property {number|null} [stopSequence] StopTimeUpdate stopSequence
             * @property {string|null} [stopId] StopTimeUpdate stopId
             * @property {transit_realtime.TripUpdate.StopTimeEvent.$Properties|null} [arrival] StopTimeUpdate arrival
             * @property {transit_realtime.TripUpdate.StopTimeEvent.$Properties|null} [departure] StopTimeUpdate departure
             * @property {transit_realtime.VehiclePosition.OccupancyStatus|null} [departureOccupancyStatus] StopTimeUpdate departureOccupancyStatus
             * @property {transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship|null} [scheduleRelationship] StopTimeUpdate scheduleRelationship
             * @property {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Properties|null} [stopTimeProperties] StopTimeUpdate stopTimeProperties
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a StopTimeUpdate.
             * @memberof transit_realtime.TripUpdate
             * @interface IStopTimeUpdate
             * @augments transit_realtime.TripUpdate.StopTimeUpdate.$Properties
             * @deprecated Use transit_realtime.TripUpdate.StopTimeUpdate.$Properties instead.
             */

            /**
             * Shape of a StopTimeUpdate.
             * @typedef {transit_realtime.TripUpdate.StopTimeUpdate.$Properties} transit_realtime.TripUpdate.StopTimeUpdate.$Shape
             */

            /**
             * Constructs a new StopTimeUpdate.
             * @memberof transit_realtime.TripUpdate
             * @classdesc Represents a StopTimeUpdate.
             * @constructor
             * @param {transit_realtime.TripUpdate.StopTimeUpdate.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const StopTimeUpdate = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * StopTimeUpdate stopSequence.
             * @member {number} stopSequence
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @instance
             */
            StopTimeUpdate.prototype.stopSequence = 0;

            /**
             * StopTimeUpdate stopId.
             * @member {string} stopId
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @instance
             */
            StopTimeUpdate.prototype.stopId = "";

            /**
             * StopTimeUpdate arrival.
             * @member {transit_realtime.TripUpdate.StopTimeEvent.$Properties|null|undefined} arrival
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @instance
             */
            StopTimeUpdate.prototype.arrival = null;

            /**
             * StopTimeUpdate departure.
             * @member {transit_realtime.TripUpdate.StopTimeEvent.$Properties|null|undefined} departure
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @instance
             */
            StopTimeUpdate.prototype.departure = null;

            /**
             * StopTimeUpdate departureOccupancyStatus.
             * @member {transit_realtime.VehiclePosition.OccupancyStatus} departureOccupancyStatus
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @instance
             */
            StopTimeUpdate.prototype.departureOccupancyStatus = 0;

            /**
             * StopTimeUpdate scheduleRelationship.
             * @member {transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship} scheduleRelationship
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @instance
             */
            StopTimeUpdate.prototype.scheduleRelationship = 0;

            /**
             * StopTimeUpdate stopTimeProperties.
             * @member {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Properties|null|undefined} stopTimeProperties
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @instance
             */
            StopTimeUpdate.prototype.stopTimeProperties = null;

            /**
             * Creates a new StopTimeUpdate instance using the specified properties.
             * @function create
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @static
             * @param {transit_realtime.TripUpdate.StopTimeUpdate.$Properties=} [properties] Properties to set
             * @returns {transit_realtime.TripUpdate.StopTimeUpdate} StopTimeUpdate instance
             * @type {{
             *   (properties: transit_realtime.TripUpdate.StopTimeUpdate.$Shape): transit_realtime.TripUpdate.StopTimeUpdate & transit_realtime.TripUpdate.StopTimeUpdate.$Shape;
             *   (properties?: transit_realtime.TripUpdate.StopTimeUpdate.$Properties): transit_realtime.TripUpdate.StopTimeUpdate;
             * }}
             */
            StopTimeUpdate.create = function(properties) {
                return new StopTimeUpdate(properties);
            };

            /**
             * Encodes the specified StopTimeUpdate message. Does not implicitly {@link transit_realtime.TripUpdate.StopTimeUpdate.verify|verify} messages.
             * @function encode
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @static
             * @param {transit_realtime.TripUpdate.StopTimeUpdate.$Properties} message StopTimeUpdate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StopTimeUpdate.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.stopSequence != null && $Object.hasOwnProperty.call(message, "stopSequence"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.stopSequence);
                if (message.arrival != null && $Object.hasOwnProperty.call(message, "arrival"))
                    $root.transit_realtime.TripUpdate.StopTimeEvent.encode(message.arrival, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                if (message.departure != null && $Object.hasOwnProperty.call(message, "departure"))
                    $root.transit_realtime.TripUpdate.StopTimeEvent.encode(message.departure, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.stopId);
                if (message.scheduleRelationship != null && $Object.hasOwnProperty.call(message, "scheduleRelationship"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int32(message.scheduleRelationship);
                if (message.stopTimeProperties != null && $Object.hasOwnProperty.call(message, "stopTimeProperties"))
                    $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.encode(message.stopTimeProperties, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
                if (message.departureOccupancyStatus != null && $Object.hasOwnProperty.call(message, "departureOccupancyStatus"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int32(message.departureOccupancyStatus);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified StopTimeUpdate message, length delimited. Does not implicitly {@link transit_realtime.TripUpdate.StopTimeUpdate.verify|verify} messages.
             * @function encodeDelimited
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @static
             * @param {transit_realtime.TripUpdate.StopTimeUpdate.$Properties} message StopTimeUpdate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StopTimeUpdate.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a StopTimeUpdate message from the specified reader or buffer.
             * @function decode
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {transit_realtime.TripUpdate.StopTimeUpdate & transit_realtime.TripUpdate.StopTimeUpdate.$Shape} StopTimeUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            StopTimeUpdate.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.transit_realtime.TripUpdate.StopTimeUpdate();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            message.stopSequence = reader.uint32();
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            message.stopId = reader.string();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.arrival = $root.transit_realtime.TripUpdate.StopTimeEvent.decode(reader, reader.uint32(), $undefined, _depth + 1, message.arrival);
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.departure = $root.transit_realtime.TripUpdate.StopTimeEvent.decode(reader, reader.uint32(), $undefined, _depth + 1, message.departure);
                            continue;
                        }
                    case 7: {
                            if (wireType !== 0)
                                break;
                            value = reader.int32();
                            if ($root.transit_realtime.VehiclePosition.OccupancyStatus[value] !== $undefined)
                                message.departureOccupancyStatus = value;
                            else if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                            continue;
                        }
                    case 5: {
                            if (wireType !== 0)
                                break;
                            value = reader.int32();
                            if ($root.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship[value] !== $undefined)
                                message.scheduleRelationship = value;
                            else if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                            continue;
                        }
                    case 6: {
                            if (wireType !== 2)
                                break;
                            message.stopTimeProperties = $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.decode(reader, reader.uint32(), $undefined, _depth + 1, message.stopTimeProperties);
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a StopTimeUpdate message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {transit_realtime.TripUpdate.StopTimeUpdate & transit_realtime.TripUpdate.StopTimeUpdate.$Shape} StopTimeUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            StopTimeUpdate.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a StopTimeUpdate message.
             * @function verify
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            StopTimeUpdate.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.stopSequence != null && $Object.hasOwnProperty.call(message, "stopSequence"))
                    if (!$util.isInteger(message.stopSequence))
                        return "stopSequence: integer expected";
                if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                    if (!$util.isString(message.stopId))
                        return "stopId: string expected";
                if (message.arrival != null && $Object.hasOwnProperty.call(message, "arrival")) {
                    let error = $root.transit_realtime.TripUpdate.StopTimeEvent.verify(message.arrival, _depth + 1);
                    if (error)
                        return "arrival." + error;
                }
                if (message.departure != null && $Object.hasOwnProperty.call(message, "departure")) {
                    let error = $root.transit_realtime.TripUpdate.StopTimeEvent.verify(message.departure, _depth + 1);
                    if (error)
                        return "departure." + error;
                }
                if (message.departureOccupancyStatus != null && $Object.hasOwnProperty.call(message, "departureOccupancyStatus"))
                    switch (message.departureOccupancyStatus) {
                    default:
                        return "departureOccupancyStatus: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        break;
                    }
                if (message.scheduleRelationship != null && $Object.hasOwnProperty.call(message, "scheduleRelationship"))
                    switch (message.scheduleRelationship) {
                    default:
                        return "scheduleRelationship: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.stopTimeProperties != null && $Object.hasOwnProperty.call(message, "stopTimeProperties")) {
                    let error = $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.verify(message.stopTimeProperties, _depth + 1);
                    if (error)
                        return "stopTimeProperties." + error;
                }
                return null;
            };

            /**
             * Creates a StopTimeUpdate message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {transit_realtime.TripUpdate.StopTimeUpdate} StopTimeUpdate
             */
            StopTimeUpdate.fromObject = function (object, _depth) {
                if (object instanceof $root.transit_realtime.TripUpdate.StopTimeUpdate)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".transit_realtime.TripUpdate.StopTimeUpdate: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.transit_realtime.TripUpdate.StopTimeUpdate();
                if (object.stopSequence != null)
                    message.stopSequence = object.stopSequence >>> 0;
                if (object.stopId != null)
                    message.stopId = $String(object.stopId);
                if (object.arrival != null) {
                    if (!$util.isObject(object.arrival))
                        throw $TypeError(".transit_realtime.TripUpdate.StopTimeUpdate.arrival: object expected");
                    message.arrival = $root.transit_realtime.TripUpdate.StopTimeEvent.fromObject(object.arrival, _depth + 1);
                }
                if (object.departure != null) {
                    if (!$util.isObject(object.departure))
                        throw $TypeError(".transit_realtime.TripUpdate.StopTimeUpdate.departure: object expected");
                    message.departure = $root.transit_realtime.TripUpdate.StopTimeEvent.fromObject(object.departure, _depth + 1);
                }
                switch (object.departureOccupancyStatus) {
                case "EMPTY":
                case 0:
                    message.departureOccupancyStatus = 0;
                    break;
                case "MANY_SEATS_AVAILABLE":
                case 1:
                    message.departureOccupancyStatus = 1;
                    break;
                case "FEW_SEATS_AVAILABLE":
                case 2:
                    message.departureOccupancyStatus = 2;
                    break;
                case "STANDING_ROOM_ONLY":
                case 3:
                    message.departureOccupancyStatus = 3;
                    break;
                case "CRUSHED_STANDING_ROOM_ONLY":
                case 4:
                    message.departureOccupancyStatus = 4;
                    break;
                case "FULL":
                case 5:
                    message.departureOccupancyStatus = 5;
                    break;
                case "NOT_ACCEPTING_PASSENGERS":
                case 6:
                    message.departureOccupancyStatus = 6;
                    break;
                case "NO_DATA_AVAILABLE":
                case 7:
                    message.departureOccupancyStatus = 7;
                    break;
                case "NOT_BOARDABLE":
                case 8:
                    message.departureOccupancyStatus = 8;
                    break;
                default:
                }
                switch (object.scheduleRelationship) {
                case "SCHEDULED":
                case 0:
                    message.scheduleRelationship = 0;
                    break;
                case "SKIPPED":
                case 1:
                    message.scheduleRelationship = 1;
                    break;
                case "NO_DATA":
                case 2:
                    message.scheduleRelationship = 2;
                    break;
                case "UNSCHEDULED":
                case 3:
                    message.scheduleRelationship = 3;
                    break;
                default:
                }
                if (object.stopTimeProperties != null) {
                    if (!$util.isObject(object.stopTimeProperties))
                        throw $TypeError(".transit_realtime.TripUpdate.StopTimeUpdate.stopTimeProperties: object expected");
                    message.stopTimeProperties = $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.fromObject(object.stopTimeProperties, _depth + 1);
                }
                return message;
            };

            /**
             * Creates a plain object from a StopTimeUpdate message. Also converts values to other types if specified.
             * @function toObject
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @static
             * @param {transit_realtime.TripUpdate.StopTimeUpdate} message StopTimeUpdate
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            StopTimeUpdate.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.stopSequence = 0;
                    object.arrival = null;
                    object.departure = null;
                    object.stopId = "";
                    object.scheduleRelationship = options.enums === $String ? "SCHEDULED" : 0;
                    object.stopTimeProperties = null;
                    object.departureOccupancyStatus = options.enums === $String ? "EMPTY" : 0;
                }
                if (message.stopSequence != null && $Object.hasOwnProperty.call(message, "stopSequence"))
                    object.stopSequence = message.stopSequence;
                if (message.arrival != null && $Object.hasOwnProperty.call(message, "arrival"))
                    object.arrival = $root.transit_realtime.TripUpdate.StopTimeEvent.toObject(message.arrival, options, _depth + 1);
                if (message.departure != null && $Object.hasOwnProperty.call(message, "departure"))
                    object.departure = $root.transit_realtime.TripUpdate.StopTimeEvent.toObject(message.departure, options, _depth + 1);
                if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                    object.stopId = message.stopId;
                if (message.scheduleRelationship != null && $Object.hasOwnProperty.call(message, "scheduleRelationship"))
                    object.scheduleRelationship = options.enums === $String ? $root.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship[message.scheduleRelationship] === $undefined ? message.scheduleRelationship : $root.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship[message.scheduleRelationship] : message.scheduleRelationship;
                if (message.stopTimeProperties != null && $Object.hasOwnProperty.call(message, "stopTimeProperties"))
                    object.stopTimeProperties = $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.toObject(message.stopTimeProperties, options, _depth + 1);
                if (message.departureOccupancyStatus != null && $Object.hasOwnProperty.call(message, "departureOccupancyStatus"))
                    object.departureOccupancyStatus = options.enums === $String ? $root.transit_realtime.VehiclePosition.OccupancyStatus[message.departureOccupancyStatus] === $undefined ? message.departureOccupancyStatus : $root.transit_realtime.VehiclePosition.OccupancyStatus[message.departureOccupancyStatus] : message.departureOccupancyStatus;
                return object;
            };

            /**
             * Converts this StopTimeUpdate to JSON.
             * @function toJSON
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            StopTimeUpdate.prototype.toJSON = function() {
                return StopTimeUpdate.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for StopTimeUpdate
             * @function getTypeUrl
             * @memberof transit_realtime.TripUpdate.StopTimeUpdate
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            StopTimeUpdate.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/transit_realtime.TripUpdate.StopTimeUpdate";
            };

            /**
             * ScheduleRelationship enum.
             * @name transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship
             * @enum {number}
             * @property {number} SCHEDULED=0 SCHEDULED value
             * @property {number} SKIPPED=1 SKIPPED value
             * @property {number} NO_DATA=2 NO_DATA value
             * @property {number} UNSCHEDULED=3 UNSCHEDULED value
             */
            StopTimeUpdate.ScheduleRelationship = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "SCHEDULED"] = 0;
                values[valuesById[1] = "SKIPPED"] = 1;
                values[valuesById[2] = "NO_DATA"] = 2;
                values[valuesById[3] = "UNSCHEDULED"] = 3;
                return values;
            })();

            StopTimeUpdate.StopTimeProperties = (function() {

                /**
                 * Properties of a StopTimeProperties.
                 * @typedef {Object} transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Properties
                 * @property {string|null} [assignedStopId] StopTimeProperties assignedStopId
                 * @property {string|null} [stopHeadsign] StopTimeProperties stopHeadsign
                 * @property {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.DropOffPickupType|null} [pickupType] StopTimeProperties pickupType
                 * @property {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.DropOffPickupType|null} [dropOffType] StopTimeProperties dropOffType
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a StopTimeProperties.
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate
                 * @interface IStopTimeProperties
                 * @augments transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Properties
                 * @deprecated Use transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Properties instead.
                 */

                /**
                 * Shape of a StopTimeProperties.
                 * @typedef {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Properties} transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Shape
                 */

                /**
                 * Constructs a new StopTimeProperties.
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate
                 * @classdesc Represents a StopTimeProperties.
                 * @constructor
                 * @param {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const StopTimeProperties = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * StopTimeProperties assignedStopId.
                 * @member {string} assignedStopId
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @instance
                 */
                StopTimeProperties.prototype.assignedStopId = "";

                /**
                 * StopTimeProperties stopHeadsign.
                 * @member {string} stopHeadsign
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @instance
                 */
                StopTimeProperties.prototype.stopHeadsign = "";

                /**
                 * StopTimeProperties pickupType.
                 * @member {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.DropOffPickupType} pickupType
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @instance
                 */
                StopTimeProperties.prototype.pickupType = 0;

                /**
                 * StopTimeProperties dropOffType.
                 * @member {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.DropOffPickupType} dropOffType
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @instance
                 */
                StopTimeProperties.prototype.dropOffType = 0;

                /**
                 * Creates a new StopTimeProperties instance using the specified properties.
                 * @function create
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @static
                 * @param {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Properties=} [properties] Properties to set
                 * @returns {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties} StopTimeProperties instance
                 * @type {{
                 *   (properties: transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Shape): transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties & transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Shape;
                 *   (properties?: transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Properties): transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties;
                 * }}
                 */
                StopTimeProperties.create = function(properties) {
                    return new StopTimeProperties(properties);
                };

                /**
                 * Encodes the specified StopTimeProperties message. Does not implicitly {@link transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.verify|verify} messages.
                 * @function encode
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @static
                 * @param {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Properties} message StopTimeProperties message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StopTimeProperties.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.assignedStopId != null && $Object.hasOwnProperty.call(message, "assignedStopId"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.assignedStopId);
                    if (message.stopHeadsign != null && $Object.hasOwnProperty.call(message, "stopHeadsign"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.stopHeadsign);
                    if (message.pickupType != null && $Object.hasOwnProperty.call(message, "pickupType"))
                        writer.uint32(/* id 3, wireType 0 =*/24).int32(message.pickupType);
                    if (message.dropOffType != null && $Object.hasOwnProperty.call(message, "dropOffType"))
                        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.dropOffType);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified StopTimeProperties message, length delimited. Does not implicitly {@link transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @static
                 * @param {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Properties} message StopTimeProperties message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StopTimeProperties.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a StopTimeProperties message from the specified reader or buffer.
                 * @function decode
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties & transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Shape} StopTimeProperties
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StopTimeProperties.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.assignedStopId = reader.string();
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.stopHeadsign = reader.string();
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                value = reader.int32();
                                if ($root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.DropOffPickupType[value] !== $undefined)
                                    message.pickupType = value;
                                else if (!reader.discardUnknown) {
                                    $util.makeProp(message, "$unknowns", false);
                                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                                }
                                continue;
                            }
                        case 4: {
                                if (wireType !== 0)
                                    break;
                                value = reader.int32();
                                if ($root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.DropOffPickupType[value] !== $undefined)
                                    message.dropOffType = value;
                                else if (!reader.discardUnknown) {
                                    $util.makeProp(message, "$unknowns", false);
                                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                                }
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a StopTimeProperties message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties & transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.$Shape} StopTimeProperties
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StopTimeProperties.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a StopTimeProperties message.
                 * @function verify
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                StopTimeProperties.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (message.assignedStopId != null && $Object.hasOwnProperty.call(message, "assignedStopId"))
                        if (!$util.isString(message.assignedStopId))
                            return "assignedStopId: string expected";
                    if (message.stopHeadsign != null && $Object.hasOwnProperty.call(message, "stopHeadsign"))
                        if (!$util.isString(message.stopHeadsign))
                            return "stopHeadsign: string expected";
                    if (message.pickupType != null && $Object.hasOwnProperty.call(message, "pickupType"))
                        switch (message.pickupType) {
                        default:
                            return "pickupType: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                            break;
                        }
                    if (message.dropOffType != null && $Object.hasOwnProperty.call(message, "dropOffType"))
                        switch (message.dropOffType) {
                        default:
                            return "dropOffType: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                            break;
                        }
                    return null;
                };

                /**
                 * Creates a StopTimeProperties message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties} StopTimeProperties
                 */
                StopTimeProperties.fromObject = function (object, _depth) {
                    if (object instanceof $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties();
                    if (object.assignedStopId != null)
                        message.assignedStopId = $String(object.assignedStopId);
                    if (object.stopHeadsign != null)
                        message.stopHeadsign = $String(object.stopHeadsign);
                    switch (object.pickupType) {
                    case "REGULAR":
                    case 0:
                        message.pickupType = 0;
                        break;
                    case "NONE":
                    case 1:
                        message.pickupType = 1;
                        break;
                    case "PHONE_AGENCY":
                    case 2:
                        message.pickupType = 2;
                        break;
                    case "COORDINATE_WITH_DRIVER":
                    case 3:
                        message.pickupType = 3;
                        break;
                    default:
                    }
                    switch (object.dropOffType) {
                    case "REGULAR":
                    case 0:
                        message.dropOffType = 0;
                        break;
                    case "NONE":
                    case 1:
                        message.dropOffType = 1;
                        break;
                    case "PHONE_AGENCY":
                    case 2:
                        message.dropOffType = 2;
                        break;
                    case "COORDINATE_WITH_DRIVER":
                    case 3:
                        message.dropOffType = 3;
                        break;
                    default:
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a StopTimeProperties message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @static
                 * @param {transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties} message StopTimeProperties
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                StopTimeProperties.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.assignedStopId = "";
                        object.stopHeadsign = "";
                        object.pickupType = options.enums === $String ? "REGULAR" : 0;
                        object.dropOffType = options.enums === $String ? "REGULAR" : 0;
                    }
                    if (message.assignedStopId != null && $Object.hasOwnProperty.call(message, "assignedStopId"))
                        object.assignedStopId = message.assignedStopId;
                    if (message.stopHeadsign != null && $Object.hasOwnProperty.call(message, "stopHeadsign"))
                        object.stopHeadsign = message.stopHeadsign;
                    if (message.pickupType != null && $Object.hasOwnProperty.call(message, "pickupType"))
                        object.pickupType = options.enums === $String ? $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.DropOffPickupType[message.pickupType] === $undefined ? message.pickupType : $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.DropOffPickupType[message.pickupType] : message.pickupType;
                    if (message.dropOffType != null && $Object.hasOwnProperty.call(message, "dropOffType"))
                        object.dropOffType = options.enums === $String ? $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.DropOffPickupType[message.dropOffType] === $undefined ? message.dropOffType : $root.transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.DropOffPickupType[message.dropOffType] : message.dropOffType;
                    return object;
                };

                /**
                 * Converts this StopTimeProperties to JSON.
                 * @function toJSON
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                StopTimeProperties.prototype.toJSON = function() {
                    return StopTimeProperties.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for StopTimeProperties
                 * @function getTypeUrl
                 * @memberof transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                StopTimeProperties.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties";
                };

                /**
                 * DropOffPickupType enum.
                 * @name transit_realtime.TripUpdate.StopTimeUpdate.StopTimeProperties.DropOffPickupType
                 * @enum {number}
                 * @property {number} REGULAR=0 REGULAR value
                 * @property {number} NONE=1 NONE value
                 * @property {number} PHONE_AGENCY=2 PHONE_AGENCY value
                 * @property {number} COORDINATE_WITH_DRIVER=3 COORDINATE_WITH_DRIVER value
                 */
                StopTimeProperties.DropOffPickupType = (function() {
                    const valuesById = $Object.create(null), values = $Object.create(valuesById);
                    values[valuesById[0] = "REGULAR"] = 0;
                    values[valuesById[1] = "NONE"] = 1;
                    values[valuesById[2] = "PHONE_AGENCY"] = 2;
                    values[valuesById[3] = "COORDINATE_WITH_DRIVER"] = 3;
                    return values;
                })();

                return StopTimeProperties;
            })();

            return StopTimeUpdate;
        })();

        TripUpdate.TripProperties = (function() {

            /**
             * Properties of a TripProperties.
             * @typedef {Object} transit_realtime.TripUpdate.TripProperties.$Properties
             * @property {string|null} [tripId] TripProperties tripId
             * @property {string|null} [startDate] TripProperties startDate
             * @property {string|null} [startTime] TripProperties startTime
             * @property {string|null} [shapeId] TripProperties shapeId
             * @property {string|null} [tripHeadsign] TripProperties tripHeadsign
             * @property {string|null} [tripShortName] TripProperties tripShortName
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a TripProperties.
             * @memberof transit_realtime.TripUpdate
             * @interface ITripProperties
             * @augments transit_realtime.TripUpdate.TripProperties.$Properties
             * @deprecated Use transit_realtime.TripUpdate.TripProperties.$Properties instead.
             */

            /**
             * Shape of a TripProperties.
             * @typedef {transit_realtime.TripUpdate.TripProperties.$Properties} transit_realtime.TripUpdate.TripProperties.$Shape
             */

            /**
             * Constructs a new TripProperties.
             * @memberof transit_realtime.TripUpdate
             * @classdesc Represents a TripProperties.
             * @constructor
             * @param {transit_realtime.TripUpdate.TripProperties.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const TripProperties = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * TripProperties tripId.
             * @member {string} tripId
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @instance
             */
            TripProperties.prototype.tripId = "";

            /**
             * TripProperties startDate.
             * @member {string} startDate
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @instance
             */
            TripProperties.prototype.startDate = "";

            /**
             * TripProperties startTime.
             * @member {string} startTime
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @instance
             */
            TripProperties.prototype.startTime = "";

            /**
             * TripProperties shapeId.
             * @member {string} shapeId
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @instance
             */
            TripProperties.prototype.shapeId = "";

            /**
             * TripProperties tripHeadsign.
             * @member {string} tripHeadsign
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @instance
             */
            TripProperties.prototype.tripHeadsign = "";

            /**
             * TripProperties tripShortName.
             * @member {string} tripShortName
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @instance
             */
            TripProperties.prototype.tripShortName = "";

            /**
             * Creates a new TripProperties instance using the specified properties.
             * @function create
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @static
             * @param {transit_realtime.TripUpdate.TripProperties.$Properties=} [properties] Properties to set
             * @returns {transit_realtime.TripUpdate.TripProperties} TripProperties instance
             * @type {{
             *   (properties: transit_realtime.TripUpdate.TripProperties.$Shape): transit_realtime.TripUpdate.TripProperties & transit_realtime.TripUpdate.TripProperties.$Shape;
             *   (properties?: transit_realtime.TripUpdate.TripProperties.$Properties): transit_realtime.TripUpdate.TripProperties;
             * }}
             */
            TripProperties.create = function(properties) {
                return new TripProperties(properties);
            };

            /**
             * Encodes the specified TripProperties message. Does not implicitly {@link transit_realtime.TripUpdate.TripProperties.verify|verify} messages.
             * @function encode
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @static
             * @param {transit_realtime.TripUpdate.TripProperties.$Properties} message TripProperties message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TripProperties.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.tripId != null && $Object.hasOwnProperty.call(message, "tripId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.tripId);
                if (message.startDate != null && $Object.hasOwnProperty.call(message, "startDate"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.startDate);
                if (message.startTime != null && $Object.hasOwnProperty.call(message, "startTime"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.startTime);
                if (message.shapeId != null && $Object.hasOwnProperty.call(message, "shapeId"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.shapeId);
                if (message.tripHeadsign != null && $Object.hasOwnProperty.call(message, "tripHeadsign"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.tripHeadsign);
                if (message.tripShortName != null && $Object.hasOwnProperty.call(message, "tripShortName"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.tripShortName);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified TripProperties message, length delimited. Does not implicitly {@link transit_realtime.TripUpdate.TripProperties.verify|verify} messages.
             * @function encodeDelimited
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @static
             * @param {transit_realtime.TripUpdate.TripProperties.$Properties} message TripProperties message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TripProperties.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a TripProperties message from the specified reader or buffer.
             * @function decode
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {transit_realtime.TripUpdate.TripProperties & transit_realtime.TripUpdate.TripProperties.$Shape} TripProperties
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TripProperties.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.transit_realtime.TripUpdate.TripProperties();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.tripId = reader.string();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.startDate = reader.string();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.startTime = reader.string();
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            message.shapeId = reader.string();
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            message.tripHeadsign = reader.string();
                            continue;
                        }
                    case 6: {
                            if (wireType !== 2)
                                break;
                            message.tripShortName = reader.string();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a TripProperties message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {transit_realtime.TripUpdate.TripProperties & transit_realtime.TripUpdate.TripProperties.$Shape} TripProperties
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TripProperties.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a TripProperties message.
             * @function verify
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TripProperties.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.tripId != null && $Object.hasOwnProperty.call(message, "tripId"))
                    if (!$util.isString(message.tripId))
                        return "tripId: string expected";
                if (message.startDate != null && $Object.hasOwnProperty.call(message, "startDate"))
                    if (!$util.isString(message.startDate))
                        return "startDate: string expected";
                if (message.startTime != null && $Object.hasOwnProperty.call(message, "startTime"))
                    if (!$util.isString(message.startTime))
                        return "startTime: string expected";
                if (message.shapeId != null && $Object.hasOwnProperty.call(message, "shapeId"))
                    if (!$util.isString(message.shapeId))
                        return "shapeId: string expected";
                if (message.tripHeadsign != null && $Object.hasOwnProperty.call(message, "tripHeadsign"))
                    if (!$util.isString(message.tripHeadsign))
                        return "tripHeadsign: string expected";
                if (message.tripShortName != null && $Object.hasOwnProperty.call(message, "tripShortName"))
                    if (!$util.isString(message.tripShortName))
                        return "tripShortName: string expected";
                return null;
            };

            /**
             * Creates a TripProperties message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {transit_realtime.TripUpdate.TripProperties} TripProperties
             */
            TripProperties.fromObject = function (object, _depth) {
                if (object instanceof $root.transit_realtime.TripUpdate.TripProperties)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".transit_realtime.TripUpdate.TripProperties: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.transit_realtime.TripUpdate.TripProperties();
                if (object.tripId != null)
                    message.tripId = $String(object.tripId);
                if (object.startDate != null)
                    message.startDate = $String(object.startDate);
                if (object.startTime != null)
                    message.startTime = $String(object.startTime);
                if (object.shapeId != null)
                    message.shapeId = $String(object.shapeId);
                if (object.tripHeadsign != null)
                    message.tripHeadsign = $String(object.tripHeadsign);
                if (object.tripShortName != null)
                    message.tripShortName = $String(object.tripShortName);
                return message;
            };

            /**
             * Creates a plain object from a TripProperties message. Also converts values to other types if specified.
             * @function toObject
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @static
             * @param {transit_realtime.TripUpdate.TripProperties} message TripProperties
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TripProperties.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.tripId = "";
                    object.startDate = "";
                    object.startTime = "";
                    object.shapeId = "";
                    object.tripHeadsign = "";
                    object.tripShortName = "";
                }
                if (message.tripId != null && $Object.hasOwnProperty.call(message, "tripId"))
                    object.tripId = message.tripId;
                if (message.startDate != null && $Object.hasOwnProperty.call(message, "startDate"))
                    object.startDate = message.startDate;
                if (message.startTime != null && $Object.hasOwnProperty.call(message, "startTime"))
                    object.startTime = message.startTime;
                if (message.shapeId != null && $Object.hasOwnProperty.call(message, "shapeId"))
                    object.shapeId = message.shapeId;
                if (message.tripHeadsign != null && $Object.hasOwnProperty.call(message, "tripHeadsign"))
                    object.tripHeadsign = message.tripHeadsign;
                if (message.tripShortName != null && $Object.hasOwnProperty.call(message, "tripShortName"))
                    object.tripShortName = message.tripShortName;
                return object;
            };

            /**
             * Converts this TripProperties to JSON.
             * @function toJSON
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TripProperties.prototype.toJSON = function() {
                return TripProperties.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for TripProperties
             * @function getTypeUrl
             * @memberof transit_realtime.TripUpdate.TripProperties
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            TripProperties.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/transit_realtime.TripUpdate.TripProperties";
            };

            return TripProperties;
        })();

        return TripUpdate;
    })();

    transit_realtime.VehiclePosition = (function() {

        /**
         * Properties of a VehiclePosition.
         * @typedef {Object} transit_realtime.VehiclePosition.$Properties
         * @property {transit_realtime.TripDescriptor.$Properties|null} [trip] VehiclePosition trip
         * @property {transit_realtime.VehicleDescriptor.$Properties|null} [vehicle] VehiclePosition vehicle
         * @property {transit_realtime.Position.$Properties|null} [position] VehiclePosition position
         * @property {number|null} [currentStopSequence] VehiclePosition currentStopSequence
         * @property {string|null} [stopId] VehiclePosition stopId
         * @property {transit_realtime.VehiclePosition.VehicleStopStatus|null} [currentStatus] VehiclePosition currentStatus
         * @property {number|Long|null} [timestamp] VehiclePosition timestamp
         * @property {transit_realtime.VehiclePosition.CongestionLevel|null} [congestionLevel] VehiclePosition congestionLevel
         * @property {transit_realtime.VehiclePosition.OccupancyStatus|null} [occupancyStatus] VehiclePosition occupancyStatus
         * @property {number|null} [occupancyPercentage] VehiclePosition occupancyPercentage
         * @property {Array.<transit_realtime.VehiclePosition.CarriageDetails.$Properties>|null} [multiCarriageDetails] VehiclePosition multiCarriageDetails
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a VehiclePosition.
         * @memberof transit_realtime
         * @interface IVehiclePosition
         * @augments transit_realtime.VehiclePosition.$Properties
         * @deprecated Use transit_realtime.VehiclePosition.$Properties instead.
         */

        /**
         * Shape of a VehiclePosition.
         * @typedef {transit_realtime.VehiclePosition.$Properties} transit_realtime.VehiclePosition.$Shape
         */

        /**
         * Constructs a new VehiclePosition.
         * @memberof transit_realtime
         * @classdesc Represents a VehiclePosition.
         * @constructor
         * @param {transit_realtime.VehiclePosition.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const VehiclePosition = function (properties) {
            this.multiCarriageDetails = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * VehiclePosition trip.
         * @member {transit_realtime.TripDescriptor.$Properties|null|undefined} trip
         * @memberof transit_realtime.VehiclePosition
         * @instance
         */
        VehiclePosition.prototype.trip = null;

        /**
         * VehiclePosition vehicle.
         * @member {transit_realtime.VehicleDescriptor.$Properties|null|undefined} vehicle
         * @memberof transit_realtime.VehiclePosition
         * @instance
         */
        VehiclePosition.prototype.vehicle = null;

        /**
         * VehiclePosition position.
         * @member {transit_realtime.Position.$Properties|null|undefined} position
         * @memberof transit_realtime.VehiclePosition
         * @instance
         */
        VehiclePosition.prototype.position = null;

        /**
         * VehiclePosition currentStopSequence.
         * @member {number} currentStopSequence
         * @memberof transit_realtime.VehiclePosition
         * @instance
         */
        VehiclePosition.prototype.currentStopSequence = 0;

        /**
         * VehiclePosition stopId.
         * @member {string} stopId
         * @memberof transit_realtime.VehiclePosition
         * @instance
         */
        VehiclePosition.prototype.stopId = "";

        /**
         * VehiclePosition currentStatus.
         * @member {transit_realtime.VehiclePosition.VehicleStopStatus} currentStatus
         * @memberof transit_realtime.VehiclePosition
         * @instance
         */
        VehiclePosition.prototype.currentStatus = 2;

        /**
         * VehiclePosition timestamp.
         * @member {number|Long} timestamp
         * @memberof transit_realtime.VehiclePosition
         * @instance
         */
        VehiclePosition.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * VehiclePosition congestionLevel.
         * @member {transit_realtime.VehiclePosition.CongestionLevel} congestionLevel
         * @memberof transit_realtime.VehiclePosition
         * @instance
         */
        VehiclePosition.prototype.congestionLevel = 0;

        /**
         * VehiclePosition occupancyStatus.
         * @member {transit_realtime.VehiclePosition.OccupancyStatus} occupancyStatus
         * @memberof transit_realtime.VehiclePosition
         * @instance
         */
        VehiclePosition.prototype.occupancyStatus = 0;

        /**
         * VehiclePosition occupancyPercentage.
         * @member {number} occupancyPercentage
         * @memberof transit_realtime.VehiclePosition
         * @instance
         */
        VehiclePosition.prototype.occupancyPercentage = 0;

        /**
         * VehiclePosition multiCarriageDetails.
         * @member {Array.<transit_realtime.VehiclePosition.CarriageDetails.$Properties>} multiCarriageDetails
         * @memberof transit_realtime.VehiclePosition
         * @instance
         */
        VehiclePosition.prototype.multiCarriageDetails = $util.emptyArray;

        /**
         * Creates a new VehiclePosition instance using the specified properties.
         * @function create
         * @memberof transit_realtime.VehiclePosition
         * @static
         * @param {transit_realtime.VehiclePosition.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.VehiclePosition} VehiclePosition instance
         * @type {{
         *   (properties: transit_realtime.VehiclePosition.$Shape): transit_realtime.VehiclePosition & transit_realtime.VehiclePosition.$Shape;
         *   (properties?: transit_realtime.VehiclePosition.$Properties): transit_realtime.VehiclePosition;
         * }}
         */
        VehiclePosition.create = function(properties) {
            return new VehiclePosition(properties);
        };

        /**
         * Encodes the specified VehiclePosition message. Does not implicitly {@link transit_realtime.VehiclePosition.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.VehiclePosition
         * @static
         * @param {transit_realtime.VehiclePosition.$Properties} message VehiclePosition message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VehiclePosition.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.trip != null && $Object.hasOwnProperty.call(message, "trip"))
                $root.transit_realtime.TripDescriptor.encode(message.trip, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.position != null && $Object.hasOwnProperty.call(message, "position"))
                $root.transit_realtime.Position.encode(message.position, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
            if (message.currentStopSequence != null && $Object.hasOwnProperty.call(message, "currentStopSequence"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.currentStopSequence);
            if (message.currentStatus != null && $Object.hasOwnProperty.call(message, "currentStatus"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.currentStatus);
            if (message.timestamp != null && $Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.timestamp);
            if (message.congestionLevel != null && $Object.hasOwnProperty.call(message, "congestionLevel"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.congestionLevel);
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.stopId);
            if (message.vehicle != null && $Object.hasOwnProperty.call(message, "vehicle"))
                $root.transit_realtime.VehicleDescriptor.encode(message.vehicle, writer.uint32(/* id 8, wireType 2 =*/66).fork(), _depth + 1).ldelim();
            if (message.occupancyStatus != null && $Object.hasOwnProperty.call(message, "occupancyStatus"))
                writer.uint32(/* id 9, wireType 0 =*/72).int32(message.occupancyStatus);
            if (message.occupancyPercentage != null && $Object.hasOwnProperty.call(message, "occupancyPercentage"))
                writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.occupancyPercentage);
            if (message.multiCarriageDetails != null && message.multiCarriageDetails.length)
                for (let i = 0; i < message.multiCarriageDetails.length; ++i)
                    $root.transit_realtime.VehiclePosition.CarriageDetails.encode(message.multiCarriageDetails[i], writer.uint32(/* id 11, wireType 2 =*/90).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified VehiclePosition message, length delimited. Does not implicitly {@link transit_realtime.VehiclePosition.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.VehiclePosition
         * @static
         * @param {transit_realtime.VehiclePosition.$Properties} message VehiclePosition message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VehiclePosition.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a VehiclePosition message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.VehiclePosition
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.VehiclePosition & transit_realtime.VehiclePosition.$Shape} VehiclePosition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VehiclePosition.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message, value;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.VehiclePosition();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.trip = $root.transit_realtime.TripDescriptor.decode(reader, reader.uint32(), $undefined, _depth + 1, message.trip);
                        continue;
                    }
                case 8: {
                        if (wireType !== 2)
                            break;
                        message.vehicle = $root.transit_realtime.VehicleDescriptor.decode(reader, reader.uint32(), $undefined, _depth + 1, message.vehicle);
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.position = $root.transit_realtime.Position.decode(reader, reader.uint32(), $undefined, _depth + 1, message.position);
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        message.currentStopSequence = reader.uint32();
                        continue;
                    }
                case 7: {
                        if (wireType !== 2)
                            break;
                        message.stopId = reader.string();
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        value = reader.int32();
                        if ($root.transit_realtime.VehiclePosition.VehicleStopStatus[value] !== $undefined)
                            message.currentStatus = value;
                        else if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                        continue;
                    }
                case 5: {
                        if (wireType !== 0)
                            break;
                        message.timestamp = reader.uint64();
                        continue;
                    }
                case 6: {
                        if (wireType !== 0)
                            break;
                        value = reader.int32();
                        if ($root.transit_realtime.VehiclePosition.CongestionLevel[value] !== $undefined)
                            message.congestionLevel = value;
                        else if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                        continue;
                    }
                case 9: {
                        if (wireType !== 0)
                            break;
                        value = reader.int32();
                        if ($root.transit_realtime.VehiclePosition.OccupancyStatus[value] !== $undefined)
                            message.occupancyStatus = value;
                        else if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                        continue;
                    }
                case 10: {
                        if (wireType !== 0)
                            break;
                        message.occupancyPercentage = reader.uint32();
                        continue;
                    }
                case 11: {
                        if (wireType !== 2)
                            break;
                        if (!(message.multiCarriageDetails && message.multiCarriageDetails.length))
                            message.multiCarriageDetails = [];
                        message.multiCarriageDetails.push($root.transit_realtime.VehiclePosition.CarriageDetails.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a VehiclePosition message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.VehiclePosition
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.VehiclePosition & transit_realtime.VehiclePosition.$Shape} VehiclePosition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VehiclePosition.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a VehiclePosition message.
         * @function verify
         * @memberof transit_realtime.VehiclePosition
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        VehiclePosition.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.trip != null && $Object.hasOwnProperty.call(message, "trip")) {
                let error = $root.transit_realtime.TripDescriptor.verify(message.trip, _depth + 1);
                if (error)
                    return "trip." + error;
            }
            if (message.vehicle != null && $Object.hasOwnProperty.call(message, "vehicle")) {
                let error = $root.transit_realtime.VehicleDescriptor.verify(message.vehicle, _depth + 1);
                if (error)
                    return "vehicle." + error;
            }
            if (message.position != null && $Object.hasOwnProperty.call(message, "position")) {
                let error = $root.transit_realtime.Position.verify(message.position, _depth + 1);
                if (error)
                    return "position." + error;
            }
            if (message.currentStopSequence != null && $Object.hasOwnProperty.call(message, "currentStopSequence"))
                if (!$util.isInteger(message.currentStopSequence))
                    return "currentStopSequence: integer expected";
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                if (!$util.isString(message.stopId))
                    return "stopId: string expected";
            if (message.currentStatus != null && $Object.hasOwnProperty.call(message, "currentStatus"))
                switch (message.currentStatus) {
                default:
                    return "currentStatus: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.timestamp != null && $Object.hasOwnProperty.call(message, "timestamp"))
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                    return "timestamp: integer|Long expected";
            if (message.congestionLevel != null && $Object.hasOwnProperty.call(message, "congestionLevel"))
                switch (message.congestionLevel) {
                default:
                    return "congestionLevel: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            if (message.occupancyStatus != null && $Object.hasOwnProperty.call(message, "occupancyStatus"))
                switch (message.occupancyStatus) {
                default:
                    return "occupancyStatus: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    break;
                }
            if (message.occupancyPercentage != null && $Object.hasOwnProperty.call(message, "occupancyPercentage"))
                if (!$util.isInteger(message.occupancyPercentage))
                    return "occupancyPercentage: integer expected";
            if (message.multiCarriageDetails != null && $Object.hasOwnProperty.call(message, "multiCarriageDetails")) {
                if (!$Array.isArray(message.multiCarriageDetails))
                    return "multiCarriageDetails: array expected";
                for (let i = 0; i < message.multiCarriageDetails.length; ++i) {
                    let error = $root.transit_realtime.VehiclePosition.CarriageDetails.verify(message.multiCarriageDetails[i], _depth + 1);
                    if (error)
                        return "multiCarriageDetails." + error;
                }
            }
            return null;
        };

        /**
         * Creates a VehiclePosition message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.VehiclePosition
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.VehiclePosition} VehiclePosition
         */
        VehiclePosition.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.VehiclePosition)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.VehiclePosition: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.VehiclePosition();
            if (object.trip != null) {
                if (!$util.isObject(object.trip))
                    throw $TypeError(".transit_realtime.VehiclePosition.trip: object expected");
                message.trip = $root.transit_realtime.TripDescriptor.fromObject(object.trip, _depth + 1);
            }
            if (object.vehicle != null) {
                if (!$util.isObject(object.vehicle))
                    throw $TypeError(".transit_realtime.VehiclePosition.vehicle: object expected");
                message.vehicle = $root.transit_realtime.VehicleDescriptor.fromObject(object.vehicle, _depth + 1);
            }
            if (object.position != null) {
                if (!$util.isObject(object.position))
                    throw $TypeError(".transit_realtime.VehiclePosition.position: object expected");
                message.position = $root.transit_realtime.Position.fromObject(object.position, _depth + 1);
            }
            if (object.currentStopSequence != null)
                message.currentStopSequence = object.currentStopSequence >>> 0;
            if (object.stopId != null)
                message.stopId = $String(object.stopId);
            switch (object.currentStatus) {
            case "INCOMING_AT":
            case 0:
                message.currentStatus = 0;
                break;
            case "STOPPED_AT":
            case 1:
                message.currentStatus = 1;
                break;
            case "IN_TRANSIT_TO":
            case 2:
                message.currentStatus = 2;
                break;
            default:
            }
            if (object.timestamp != null)
                if ($util.Long)
                    message.timestamp = $util.Long.fromValue(object.timestamp, true);
                else if (typeof object.timestamp === "string")
                    message.timestamp = $parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                    message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                    message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber(true);
            switch (object.congestionLevel) {
            case "UNKNOWN_CONGESTION_LEVEL":
            case 0:
                message.congestionLevel = 0;
                break;
            case "RUNNING_SMOOTHLY":
            case 1:
                message.congestionLevel = 1;
                break;
            case "STOP_AND_GO":
            case 2:
                message.congestionLevel = 2;
                break;
            case "CONGESTION":
            case 3:
                message.congestionLevel = 3;
                break;
            case "SEVERE_CONGESTION":
            case 4:
                message.congestionLevel = 4;
                break;
            default:
            }
            switch (object.occupancyStatus) {
            case "EMPTY":
            case 0:
                message.occupancyStatus = 0;
                break;
            case "MANY_SEATS_AVAILABLE":
            case 1:
                message.occupancyStatus = 1;
                break;
            case "FEW_SEATS_AVAILABLE":
            case 2:
                message.occupancyStatus = 2;
                break;
            case "STANDING_ROOM_ONLY":
            case 3:
                message.occupancyStatus = 3;
                break;
            case "CRUSHED_STANDING_ROOM_ONLY":
            case 4:
                message.occupancyStatus = 4;
                break;
            case "FULL":
            case 5:
                message.occupancyStatus = 5;
                break;
            case "NOT_ACCEPTING_PASSENGERS":
            case 6:
                message.occupancyStatus = 6;
                break;
            case "NO_DATA_AVAILABLE":
            case 7:
                message.occupancyStatus = 7;
                break;
            case "NOT_BOARDABLE":
            case 8:
                message.occupancyStatus = 8;
                break;
            default:
            }
            if (object.occupancyPercentage != null)
                message.occupancyPercentage = object.occupancyPercentage >>> 0;
            if (object.multiCarriageDetails) {
                if (!$Array.isArray(object.multiCarriageDetails))
                    throw $TypeError(".transit_realtime.VehiclePosition.multiCarriageDetails: array expected");
                message.multiCarriageDetails = $Array(object.multiCarriageDetails.length);
                for (let i = 0; i < object.multiCarriageDetails.length; ++i) {
                    if (!$util.isObject(object.multiCarriageDetails[i]))
                        throw $TypeError(".transit_realtime.VehiclePosition.multiCarriageDetails: object expected");
                    message.multiCarriageDetails[i] = $root.transit_realtime.VehiclePosition.CarriageDetails.fromObject(object.multiCarriageDetails[i], _depth + 1);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a VehiclePosition message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.VehiclePosition
         * @static
         * @param {transit_realtime.VehiclePosition} message VehiclePosition
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        VehiclePosition.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults)
                object.multiCarriageDetails = [];
            if (options.defaults) {
                object.trip = null;
                object.position = null;
                object.currentStopSequence = 0;
                object.currentStatus = options.enums === $String ? "IN_TRANSIT_TO" : 2;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.timestamp = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.timestamp = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                object.congestionLevel = options.enums === $String ? "UNKNOWN_CONGESTION_LEVEL" : 0;
                object.stopId = "";
                object.vehicle = null;
                object.occupancyStatus = options.enums === $String ? "EMPTY" : 0;
                object.occupancyPercentage = 0;
            }
            if (message.trip != null && $Object.hasOwnProperty.call(message, "trip"))
                object.trip = $root.transit_realtime.TripDescriptor.toObject(message.trip, options, _depth + 1);
            if (message.position != null && $Object.hasOwnProperty.call(message, "position"))
                object.position = $root.transit_realtime.Position.toObject(message.position, options, _depth + 1);
            if (message.currentStopSequence != null && $Object.hasOwnProperty.call(message, "currentStopSequence"))
                object.currentStopSequence = message.currentStopSequence;
            if (message.currentStatus != null && $Object.hasOwnProperty.call(message, "currentStatus"))
                object.currentStatus = options.enums === $String ? $root.transit_realtime.VehiclePosition.VehicleStopStatus[message.currentStatus] === $undefined ? message.currentStatus : $root.transit_realtime.VehiclePosition.VehicleStopStatus[message.currentStatus] : message.currentStatus;
            if (message.timestamp != null && $Object.hasOwnProperty.call(message, "timestamp"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.timestamp = typeof message.timestamp === "number" ? $BigInt(message.timestamp) : $util.Long.fromBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0, true).toBigInt();
                else if (typeof message.timestamp === "number")
                    object.timestamp = options.longs === $String ? $String(message.timestamp) : message.timestamp;
                else
                    object.timestamp = options.longs === $String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === $Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber(true) : message.timestamp;
            if (message.congestionLevel != null && $Object.hasOwnProperty.call(message, "congestionLevel"))
                object.congestionLevel = options.enums === $String ? $root.transit_realtime.VehiclePosition.CongestionLevel[message.congestionLevel] === $undefined ? message.congestionLevel : $root.transit_realtime.VehiclePosition.CongestionLevel[message.congestionLevel] : message.congestionLevel;
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                object.stopId = message.stopId;
            if (message.vehicle != null && $Object.hasOwnProperty.call(message, "vehicle"))
                object.vehicle = $root.transit_realtime.VehicleDescriptor.toObject(message.vehicle, options, _depth + 1);
            if (message.occupancyStatus != null && $Object.hasOwnProperty.call(message, "occupancyStatus"))
                object.occupancyStatus = options.enums === $String ? $root.transit_realtime.VehiclePosition.OccupancyStatus[message.occupancyStatus] === $undefined ? message.occupancyStatus : $root.transit_realtime.VehiclePosition.OccupancyStatus[message.occupancyStatus] : message.occupancyStatus;
            if (message.occupancyPercentage != null && $Object.hasOwnProperty.call(message, "occupancyPercentage"))
                object.occupancyPercentage = message.occupancyPercentage;
            if (message.multiCarriageDetails && message.multiCarriageDetails.length) {
                object.multiCarriageDetails = $Array(message.multiCarriageDetails.length);
                for (let j = 0; j < message.multiCarriageDetails.length; ++j)
                    object.multiCarriageDetails[j] = $root.transit_realtime.VehiclePosition.CarriageDetails.toObject(message.multiCarriageDetails[j], options, _depth + 1);
            }
            return object;
        };

        /**
         * Converts this VehiclePosition to JSON.
         * @function toJSON
         * @memberof transit_realtime.VehiclePosition
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        VehiclePosition.prototype.toJSON = function() {
            return VehiclePosition.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for VehiclePosition
         * @function getTypeUrl
         * @memberof transit_realtime.VehiclePosition
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        VehiclePosition.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.VehiclePosition";
        };

        /**
         * VehicleStopStatus enum.
         * @name transit_realtime.VehiclePosition.VehicleStopStatus
         * @enum {number}
         * @property {number} INCOMING_AT=0 INCOMING_AT value
         * @property {number} STOPPED_AT=1 STOPPED_AT value
         * @property {number} IN_TRANSIT_TO=2 IN_TRANSIT_TO value
         */
        VehiclePosition.VehicleStopStatus = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "INCOMING_AT"] = 0;
            values[valuesById[1] = "STOPPED_AT"] = 1;
            values[valuesById[2] = "IN_TRANSIT_TO"] = 2;
            return values;
        })();

        /**
         * CongestionLevel enum.
         * @name transit_realtime.VehiclePosition.CongestionLevel
         * @enum {number}
         * @property {number} UNKNOWN_CONGESTION_LEVEL=0 UNKNOWN_CONGESTION_LEVEL value
         * @property {number} RUNNING_SMOOTHLY=1 RUNNING_SMOOTHLY value
         * @property {number} STOP_AND_GO=2 STOP_AND_GO value
         * @property {number} CONGESTION=3 CONGESTION value
         * @property {number} SEVERE_CONGESTION=4 SEVERE_CONGESTION value
         */
        VehiclePosition.CongestionLevel = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "UNKNOWN_CONGESTION_LEVEL"] = 0;
            values[valuesById[1] = "RUNNING_SMOOTHLY"] = 1;
            values[valuesById[2] = "STOP_AND_GO"] = 2;
            values[valuesById[3] = "CONGESTION"] = 3;
            values[valuesById[4] = "SEVERE_CONGESTION"] = 4;
            return values;
        })();

        /**
         * OccupancyStatus enum.
         * @name transit_realtime.VehiclePosition.OccupancyStatus
         * @enum {number}
         * @property {number} EMPTY=0 EMPTY value
         * @property {number} MANY_SEATS_AVAILABLE=1 MANY_SEATS_AVAILABLE value
         * @property {number} FEW_SEATS_AVAILABLE=2 FEW_SEATS_AVAILABLE value
         * @property {number} STANDING_ROOM_ONLY=3 STANDING_ROOM_ONLY value
         * @property {number} CRUSHED_STANDING_ROOM_ONLY=4 CRUSHED_STANDING_ROOM_ONLY value
         * @property {number} FULL=5 FULL value
         * @property {number} NOT_ACCEPTING_PASSENGERS=6 NOT_ACCEPTING_PASSENGERS value
         * @property {number} NO_DATA_AVAILABLE=7 NO_DATA_AVAILABLE value
         * @property {number} NOT_BOARDABLE=8 NOT_BOARDABLE value
         */
        VehiclePosition.OccupancyStatus = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "EMPTY"] = 0;
            values[valuesById[1] = "MANY_SEATS_AVAILABLE"] = 1;
            values[valuesById[2] = "FEW_SEATS_AVAILABLE"] = 2;
            values[valuesById[3] = "STANDING_ROOM_ONLY"] = 3;
            values[valuesById[4] = "CRUSHED_STANDING_ROOM_ONLY"] = 4;
            values[valuesById[5] = "FULL"] = 5;
            values[valuesById[6] = "NOT_ACCEPTING_PASSENGERS"] = 6;
            values[valuesById[7] = "NO_DATA_AVAILABLE"] = 7;
            values[valuesById[8] = "NOT_BOARDABLE"] = 8;
            return values;
        })();

        VehiclePosition.CarriageDetails = (function() {

            /**
             * Properties of a CarriageDetails.
             * @typedef {Object} transit_realtime.VehiclePosition.CarriageDetails.$Properties
             * @property {string|null} [id] CarriageDetails id
             * @property {string|null} [label] CarriageDetails label
             * @property {transit_realtime.VehiclePosition.OccupancyStatus|null} [occupancyStatus] CarriageDetails occupancyStatus
             * @property {number|null} [occupancyPercentage] CarriageDetails occupancyPercentage
             * @property {number|null} [carriageSequence] CarriageDetails carriageSequence
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a CarriageDetails.
             * @memberof transit_realtime.VehiclePosition
             * @interface ICarriageDetails
             * @augments transit_realtime.VehiclePosition.CarriageDetails.$Properties
             * @deprecated Use transit_realtime.VehiclePosition.CarriageDetails.$Properties instead.
             */

            /**
             * Shape of a CarriageDetails.
             * @typedef {transit_realtime.VehiclePosition.CarriageDetails.$Properties} transit_realtime.VehiclePosition.CarriageDetails.$Shape
             */

            /**
             * Constructs a new CarriageDetails.
             * @memberof transit_realtime.VehiclePosition
             * @classdesc Represents a CarriageDetails.
             * @constructor
             * @param {transit_realtime.VehiclePosition.CarriageDetails.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const CarriageDetails = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * CarriageDetails id.
             * @member {string} id
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @instance
             */
            CarriageDetails.prototype.id = "";

            /**
             * CarriageDetails label.
             * @member {string} label
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @instance
             */
            CarriageDetails.prototype.label = "";

            /**
             * CarriageDetails occupancyStatus.
             * @member {transit_realtime.VehiclePosition.OccupancyStatus} occupancyStatus
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @instance
             */
            CarriageDetails.prototype.occupancyStatus = 7;

            /**
             * CarriageDetails occupancyPercentage.
             * @member {number} occupancyPercentage
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @instance
             */
            CarriageDetails.prototype.occupancyPercentage = -1;

            /**
             * CarriageDetails carriageSequence.
             * @member {number} carriageSequence
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @instance
             */
            CarriageDetails.prototype.carriageSequence = 0;

            /**
             * Creates a new CarriageDetails instance using the specified properties.
             * @function create
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @static
             * @param {transit_realtime.VehiclePosition.CarriageDetails.$Properties=} [properties] Properties to set
             * @returns {transit_realtime.VehiclePosition.CarriageDetails} CarriageDetails instance
             * @type {{
             *   (properties: transit_realtime.VehiclePosition.CarriageDetails.$Shape): transit_realtime.VehiclePosition.CarriageDetails & transit_realtime.VehiclePosition.CarriageDetails.$Shape;
             *   (properties?: transit_realtime.VehiclePosition.CarriageDetails.$Properties): transit_realtime.VehiclePosition.CarriageDetails;
             * }}
             */
            CarriageDetails.create = function(properties) {
                return new CarriageDetails(properties);
            };

            /**
             * Encodes the specified CarriageDetails message. Does not implicitly {@link transit_realtime.VehiclePosition.CarriageDetails.verify|verify} messages.
             * @function encode
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @static
             * @param {transit_realtime.VehiclePosition.CarriageDetails.$Properties} message CarriageDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CarriageDetails.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.label != null && $Object.hasOwnProperty.call(message, "label"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.label);
                if (message.occupancyStatus != null && $Object.hasOwnProperty.call(message, "occupancyStatus"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.occupancyStatus);
                if (message.occupancyPercentage != null && $Object.hasOwnProperty.call(message, "occupancyPercentage"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.occupancyPercentage);
                if (message.carriageSequence != null && $Object.hasOwnProperty.call(message, "carriageSequence"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.carriageSequence);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified CarriageDetails message, length delimited. Does not implicitly {@link transit_realtime.VehiclePosition.CarriageDetails.verify|verify} messages.
             * @function encodeDelimited
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @static
             * @param {transit_realtime.VehiclePosition.CarriageDetails.$Properties} message CarriageDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CarriageDetails.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a CarriageDetails message from the specified reader or buffer.
             * @function decode
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {transit_realtime.VehiclePosition.CarriageDetails & transit_realtime.VehiclePosition.CarriageDetails.$Shape} CarriageDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CarriageDetails.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.transit_realtime.VehiclePosition.CarriageDetails();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.id = reader.string();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.label = reader.string();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            value = reader.int32();
                            if ($root.transit_realtime.VehiclePosition.OccupancyStatus[value] !== $undefined)
                                message.occupancyStatus = value;
                            else if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                            continue;
                        }
                    case 4: {
                            if (wireType !== 0)
                                break;
                            message.occupancyPercentage = reader.int32();
                            continue;
                        }
                    case 5: {
                            if (wireType !== 0)
                                break;
                            message.carriageSequence = reader.uint32();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a CarriageDetails message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {transit_realtime.VehiclePosition.CarriageDetails & transit_realtime.VehiclePosition.CarriageDetails.$Shape} CarriageDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CarriageDetails.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CarriageDetails message.
             * @function verify
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CarriageDetails.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.label != null && $Object.hasOwnProperty.call(message, "label"))
                    if (!$util.isString(message.label))
                        return "label: string expected";
                if (message.occupancyStatus != null && $Object.hasOwnProperty.call(message, "occupancyStatus"))
                    switch (message.occupancyStatus) {
                    default:
                        return "occupancyStatus: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        break;
                    }
                if (message.occupancyPercentage != null && $Object.hasOwnProperty.call(message, "occupancyPercentage"))
                    if (!$util.isInteger(message.occupancyPercentage))
                        return "occupancyPercentage: integer expected";
                if (message.carriageSequence != null && $Object.hasOwnProperty.call(message, "carriageSequence"))
                    if (!$util.isInteger(message.carriageSequence))
                        return "carriageSequence: integer expected";
                return null;
            };

            /**
             * Creates a CarriageDetails message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {transit_realtime.VehiclePosition.CarriageDetails} CarriageDetails
             */
            CarriageDetails.fromObject = function (object, _depth) {
                if (object instanceof $root.transit_realtime.VehiclePosition.CarriageDetails)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".transit_realtime.VehiclePosition.CarriageDetails: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.transit_realtime.VehiclePosition.CarriageDetails();
                if (object.id != null)
                    message.id = $String(object.id);
                if (object.label != null)
                    message.label = $String(object.label);
                switch (object.occupancyStatus) {
                case "EMPTY":
                case 0:
                    message.occupancyStatus = 0;
                    break;
                case "MANY_SEATS_AVAILABLE":
                case 1:
                    message.occupancyStatus = 1;
                    break;
                case "FEW_SEATS_AVAILABLE":
                case 2:
                    message.occupancyStatus = 2;
                    break;
                case "STANDING_ROOM_ONLY":
                case 3:
                    message.occupancyStatus = 3;
                    break;
                case "CRUSHED_STANDING_ROOM_ONLY":
                case 4:
                    message.occupancyStatus = 4;
                    break;
                case "FULL":
                case 5:
                    message.occupancyStatus = 5;
                    break;
                case "NOT_ACCEPTING_PASSENGERS":
                case 6:
                    message.occupancyStatus = 6;
                    break;
                case "NO_DATA_AVAILABLE":
                case 7:
                    message.occupancyStatus = 7;
                    break;
                case "NOT_BOARDABLE":
                case 8:
                    message.occupancyStatus = 8;
                    break;
                default:
                }
                if (object.occupancyPercentage != null)
                    message.occupancyPercentage = object.occupancyPercentage | 0;
                if (object.carriageSequence != null)
                    message.carriageSequence = object.carriageSequence >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a CarriageDetails message. Also converts values to other types if specified.
             * @function toObject
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @static
             * @param {transit_realtime.VehiclePosition.CarriageDetails} message CarriageDetails
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CarriageDetails.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.id = "";
                    object.label = "";
                    object.occupancyStatus = options.enums === $String ? "NO_DATA_AVAILABLE" : 7;
                    object.occupancyPercentage = -1;
                    object.carriageSequence = 0;
                }
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    object.id = message.id;
                if (message.label != null && $Object.hasOwnProperty.call(message, "label"))
                    object.label = message.label;
                if (message.occupancyStatus != null && $Object.hasOwnProperty.call(message, "occupancyStatus"))
                    object.occupancyStatus = options.enums === $String ? $root.transit_realtime.VehiclePosition.OccupancyStatus[message.occupancyStatus] === $undefined ? message.occupancyStatus : $root.transit_realtime.VehiclePosition.OccupancyStatus[message.occupancyStatus] : message.occupancyStatus;
                if (message.occupancyPercentage != null && $Object.hasOwnProperty.call(message, "occupancyPercentage"))
                    object.occupancyPercentage = message.occupancyPercentage;
                if (message.carriageSequence != null && $Object.hasOwnProperty.call(message, "carriageSequence"))
                    object.carriageSequence = message.carriageSequence;
                return object;
            };

            /**
             * Converts this CarriageDetails to JSON.
             * @function toJSON
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CarriageDetails.prototype.toJSON = function() {
                return CarriageDetails.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for CarriageDetails
             * @function getTypeUrl
             * @memberof transit_realtime.VehiclePosition.CarriageDetails
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            CarriageDetails.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/transit_realtime.VehiclePosition.CarriageDetails";
            };

            return CarriageDetails;
        })();

        return VehiclePosition;
    })();

    transit_realtime.Alert = (function() {

        /**
         * Properties of an Alert.
         * @typedef {Object} transit_realtime.Alert.$Properties
         * @property {Array.<transit_realtime.TimeRange.$Properties>|null} [activePeriod] Alert activePeriod
         * @property {Array.<transit_realtime.TimeRange.$Properties>|null} [communicationPeriod] Alert communicationPeriod
         * @property {Array.<transit_realtime.TimeRange.$Properties>|null} [impactPeriod] Alert impactPeriod
         * @property {Array.<transit_realtime.EntitySelector.$Properties>|null} [informedEntity] Alert informedEntity
         * @property {transit_realtime.Alert.Cause|null} [cause] Alert cause
         * @property {transit_realtime.Alert.Effect|null} [effect] Alert effect
         * @property {transit_realtime.TranslatedString.$Properties|null} [url] Alert url
         * @property {transit_realtime.TranslatedString.$Properties|null} [headerText] Alert headerText
         * @property {transit_realtime.TranslatedString.$Properties|null} [descriptionText] Alert descriptionText
         * @property {transit_realtime.TranslatedString.$Properties|null} [ttsHeaderText] Alert ttsHeaderText
         * @property {transit_realtime.TranslatedString.$Properties|null} [ttsDescriptionText] Alert ttsDescriptionText
         * @property {transit_realtime.Alert.SeverityLevel|null} [severityLevel] Alert severityLevel
         * @property {transit_realtime.TranslatedImage.$Properties|null} [image] Alert image
         * @property {transit_realtime.TranslatedString.$Properties|null} [imageAlternativeText] Alert imageAlternativeText
         * @property {transit_realtime.TranslatedString.$Properties|null} [causeDetail] Alert causeDetail
         * @property {transit_realtime.TranslatedString.$Properties|null} [effectDetail] Alert effectDetail
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of an Alert.
         * @memberof transit_realtime
         * @interface IAlert
         * @augments transit_realtime.Alert.$Properties
         * @deprecated Use transit_realtime.Alert.$Properties instead.
         */

        /**
         * Shape of an Alert.
         * @typedef {transit_realtime.Alert.$Properties} transit_realtime.Alert.$Shape
         */

        /**
         * Constructs a new Alert.
         * @memberof transit_realtime
         * @classdesc Represents an Alert.
         * @constructor
         * @param {transit_realtime.Alert.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Alert = function (properties) {
            this.activePeriod = [];
            this.communicationPeriod = [];
            this.impactPeriod = [];
            this.informedEntity = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Alert activePeriod.
         * @member {Array.<transit_realtime.TimeRange.$Properties>} activePeriod
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.activePeriod = $util.emptyArray;

        /**
         * Alert communicationPeriod.
         * @member {Array.<transit_realtime.TimeRange.$Properties>} communicationPeriod
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.communicationPeriod = $util.emptyArray;

        /**
         * Alert impactPeriod.
         * @member {Array.<transit_realtime.TimeRange.$Properties>} impactPeriod
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.impactPeriod = $util.emptyArray;

        /**
         * Alert informedEntity.
         * @member {Array.<transit_realtime.EntitySelector.$Properties>} informedEntity
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.informedEntity = $util.emptyArray;

        /**
         * Alert cause.
         * @member {transit_realtime.Alert.Cause} cause
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.cause = 1;

        /**
         * Alert effect.
         * @member {transit_realtime.Alert.Effect} effect
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.effect = 8;

        /**
         * Alert url.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} url
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.url = null;

        /**
         * Alert headerText.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} headerText
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.headerText = null;

        /**
         * Alert descriptionText.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} descriptionText
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.descriptionText = null;

        /**
         * Alert ttsHeaderText.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} ttsHeaderText
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.ttsHeaderText = null;

        /**
         * Alert ttsDescriptionText.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} ttsDescriptionText
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.ttsDescriptionText = null;

        /**
         * Alert severityLevel.
         * @member {transit_realtime.Alert.SeverityLevel} severityLevel
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.severityLevel = 1;

        /**
         * Alert image.
         * @member {transit_realtime.TranslatedImage.$Properties|null|undefined} image
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.image = null;

        /**
         * Alert imageAlternativeText.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} imageAlternativeText
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.imageAlternativeText = null;

        /**
         * Alert causeDetail.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} causeDetail
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.causeDetail = null;

        /**
         * Alert effectDetail.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} effectDetail
         * @memberof transit_realtime.Alert
         * @instance
         */
        Alert.prototype.effectDetail = null;

        /**
         * Creates a new Alert instance using the specified properties.
         * @function create
         * @memberof transit_realtime.Alert
         * @static
         * @param {transit_realtime.Alert.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.Alert} Alert instance
         * @type {{
         *   (properties: transit_realtime.Alert.$Shape): transit_realtime.Alert & transit_realtime.Alert.$Shape;
         *   (properties?: transit_realtime.Alert.$Properties): transit_realtime.Alert;
         * }}
         */
        Alert.create = function(properties) {
            return new Alert(properties);
        };

        /**
         * Encodes the specified Alert message. Does not implicitly {@link transit_realtime.Alert.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.Alert
         * @static
         * @param {transit_realtime.Alert.$Properties} message Alert message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Alert.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.activePeriod != null && message.activePeriod.length)
                for (let i = 0; i < message.activePeriod.length; ++i)
                    $root.transit_realtime.TimeRange.encode(message.activePeriod[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.communicationPeriod != null && message.communicationPeriod.length)
                for (let i = 0; i < message.communicationPeriod.length; ++i)
                    $root.transit_realtime.TimeRange.encode(message.communicationPeriod[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
            if (message.impactPeriod != null && message.impactPeriod.length)
                for (let i = 0; i < message.impactPeriod.length; ++i)
                    $root.transit_realtime.TimeRange.encode(message.impactPeriod[i], writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
            if (message.informedEntity != null && message.informedEntity.length)
                for (let i = 0; i < message.informedEntity.length; ++i)
                    $root.transit_realtime.EntitySelector.encode(message.informedEntity[i], writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
            if (message.cause != null && $Object.hasOwnProperty.call(message, "cause"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.cause);
            if (message.effect != null && $Object.hasOwnProperty.call(message, "effect"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.effect);
            if (message.url != null && $Object.hasOwnProperty.call(message, "url"))
                $root.transit_realtime.TranslatedString.encode(message.url, writer.uint32(/* id 8, wireType 2 =*/66).fork(), _depth + 1).ldelim();
            if (message.headerText != null && $Object.hasOwnProperty.call(message, "headerText"))
                $root.transit_realtime.TranslatedString.encode(message.headerText, writer.uint32(/* id 10, wireType 2 =*/82).fork(), _depth + 1).ldelim();
            if (message.descriptionText != null && $Object.hasOwnProperty.call(message, "descriptionText"))
                $root.transit_realtime.TranslatedString.encode(message.descriptionText, writer.uint32(/* id 11, wireType 2 =*/90).fork(), _depth + 1).ldelim();
            if (message.ttsHeaderText != null && $Object.hasOwnProperty.call(message, "ttsHeaderText"))
                $root.transit_realtime.TranslatedString.encode(message.ttsHeaderText, writer.uint32(/* id 12, wireType 2 =*/98).fork(), _depth + 1).ldelim();
            if (message.ttsDescriptionText != null && $Object.hasOwnProperty.call(message, "ttsDescriptionText"))
                $root.transit_realtime.TranslatedString.encode(message.ttsDescriptionText, writer.uint32(/* id 13, wireType 2 =*/106).fork(), _depth + 1).ldelim();
            if (message.severityLevel != null && $Object.hasOwnProperty.call(message, "severityLevel"))
                writer.uint32(/* id 14, wireType 0 =*/112).int32(message.severityLevel);
            if (message.image != null && $Object.hasOwnProperty.call(message, "image"))
                $root.transit_realtime.TranslatedImage.encode(message.image, writer.uint32(/* id 15, wireType 2 =*/122).fork(), _depth + 1).ldelim();
            if (message.imageAlternativeText != null && $Object.hasOwnProperty.call(message, "imageAlternativeText"))
                $root.transit_realtime.TranslatedString.encode(message.imageAlternativeText, writer.uint32(/* id 16, wireType 2 =*/130).fork(), _depth + 1).ldelim();
            if (message.causeDetail != null && $Object.hasOwnProperty.call(message, "causeDetail"))
                $root.transit_realtime.TranslatedString.encode(message.causeDetail, writer.uint32(/* id 17, wireType 2 =*/138).fork(), _depth + 1).ldelim();
            if (message.effectDetail != null && $Object.hasOwnProperty.call(message, "effectDetail"))
                $root.transit_realtime.TranslatedString.encode(message.effectDetail, writer.uint32(/* id 18, wireType 2 =*/146).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified Alert message, length delimited. Does not implicitly {@link transit_realtime.Alert.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.Alert
         * @static
         * @param {transit_realtime.Alert.$Properties} message Alert message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Alert.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes an Alert message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.Alert
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.Alert & transit_realtime.Alert.$Shape} Alert
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Alert.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message, value;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.Alert();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (!(message.activePeriod && message.activePeriod.length))
                            message.activePeriod = [];
                        message.activePeriod.push($root.transit_realtime.TimeRange.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if (!(message.communicationPeriod && message.communicationPeriod.length))
                            message.communicationPeriod = [];
                        message.communicationPeriod.push($root.transit_realtime.TimeRange.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        if (!(message.impactPeriod && message.impactPeriod.length))
                            message.impactPeriod = [];
                        message.impactPeriod.push($root.transit_realtime.TimeRange.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        if (!(message.informedEntity && message.informedEntity.length))
                            message.informedEntity = [];
                        message.informedEntity.push($root.transit_realtime.EntitySelector.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                case 6: {
                        if (wireType !== 0)
                            break;
                        value = reader.int32();
                        if ($root.transit_realtime.Alert.Cause[value] !== $undefined)
                            message.cause = value;
                        else if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                        continue;
                    }
                case 7: {
                        if (wireType !== 0)
                            break;
                        value = reader.int32();
                        if ($root.transit_realtime.Alert.Effect[value] !== $undefined)
                            message.effect = value;
                        else if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                        continue;
                    }
                case 8: {
                        if (wireType !== 2)
                            break;
                        message.url = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.url);
                        continue;
                    }
                case 10: {
                        if (wireType !== 2)
                            break;
                        message.headerText = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.headerText);
                        continue;
                    }
                case 11: {
                        if (wireType !== 2)
                            break;
                        message.descriptionText = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.descriptionText);
                        continue;
                    }
                case 12: {
                        if (wireType !== 2)
                            break;
                        message.ttsHeaderText = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.ttsHeaderText);
                        continue;
                    }
                case 13: {
                        if (wireType !== 2)
                            break;
                        message.ttsDescriptionText = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.ttsDescriptionText);
                        continue;
                    }
                case 14: {
                        if (wireType !== 0)
                            break;
                        value = reader.int32();
                        if ($root.transit_realtime.Alert.SeverityLevel[value] !== $undefined)
                            message.severityLevel = value;
                        else if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                        continue;
                    }
                case 15: {
                        if (wireType !== 2)
                            break;
                        message.image = $root.transit_realtime.TranslatedImage.decode(reader, reader.uint32(), $undefined, _depth + 1, message.image);
                        continue;
                    }
                case 16: {
                        if (wireType !== 2)
                            break;
                        message.imageAlternativeText = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.imageAlternativeText);
                        continue;
                    }
                case 17: {
                        if (wireType !== 2)
                            break;
                        message.causeDetail = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.causeDetail);
                        continue;
                    }
                case 18: {
                        if (wireType !== 2)
                            break;
                        message.effectDetail = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.effectDetail);
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes an Alert message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.Alert
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.Alert & transit_realtime.Alert.$Shape} Alert
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Alert.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Alert message.
         * @function verify
         * @memberof transit_realtime.Alert
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Alert.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.activePeriod != null && $Object.hasOwnProperty.call(message, "activePeriod")) {
                if (!$Array.isArray(message.activePeriod))
                    return "activePeriod: array expected";
                for (let i = 0; i < message.activePeriod.length; ++i) {
                    let error = $root.transit_realtime.TimeRange.verify(message.activePeriod[i], _depth + 1);
                    if (error)
                        return "activePeriod." + error;
                }
            }
            if (message.communicationPeriod != null && $Object.hasOwnProperty.call(message, "communicationPeriod")) {
                if (!$Array.isArray(message.communicationPeriod))
                    return "communicationPeriod: array expected";
                for (let i = 0; i < message.communicationPeriod.length; ++i) {
                    let error = $root.transit_realtime.TimeRange.verify(message.communicationPeriod[i], _depth + 1);
                    if (error)
                        return "communicationPeriod." + error;
                }
            }
            if (message.impactPeriod != null && $Object.hasOwnProperty.call(message, "impactPeriod")) {
                if (!$Array.isArray(message.impactPeriod))
                    return "impactPeriod: array expected";
                for (let i = 0; i < message.impactPeriod.length; ++i) {
                    let error = $root.transit_realtime.TimeRange.verify(message.impactPeriod[i], _depth + 1);
                    if (error)
                        return "impactPeriod." + error;
                }
            }
            if (message.informedEntity != null && $Object.hasOwnProperty.call(message, "informedEntity")) {
                if (!$Array.isArray(message.informedEntity))
                    return "informedEntity: array expected";
                for (let i = 0; i < message.informedEntity.length; ++i) {
                    let error = $root.transit_realtime.EntitySelector.verify(message.informedEntity[i], _depth + 1);
                    if (error)
                        return "informedEntity." + error;
                }
            }
            if (message.cause != null && $Object.hasOwnProperty.call(message, "cause"))
                switch (message.cause) {
                default:
                    return "cause: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                    break;
                }
            if (message.effect != null && $Object.hasOwnProperty.call(message, "effect"))
                switch (message.effect) {
                default:
                    return "effect: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                    break;
                }
            if (message.url != null && $Object.hasOwnProperty.call(message, "url")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.url, _depth + 1);
                if (error)
                    return "url." + error;
            }
            if (message.headerText != null && $Object.hasOwnProperty.call(message, "headerText")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.headerText, _depth + 1);
                if (error)
                    return "headerText." + error;
            }
            if (message.descriptionText != null && $Object.hasOwnProperty.call(message, "descriptionText")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.descriptionText, _depth + 1);
                if (error)
                    return "descriptionText." + error;
            }
            if (message.ttsHeaderText != null && $Object.hasOwnProperty.call(message, "ttsHeaderText")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.ttsHeaderText, _depth + 1);
                if (error)
                    return "ttsHeaderText." + error;
            }
            if (message.ttsDescriptionText != null && $Object.hasOwnProperty.call(message, "ttsDescriptionText")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.ttsDescriptionText, _depth + 1);
                if (error)
                    return "ttsDescriptionText." + error;
            }
            if (message.severityLevel != null && $Object.hasOwnProperty.call(message, "severityLevel"))
                switch (message.severityLevel) {
                default:
                    return "severityLevel: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            if (message.image != null && $Object.hasOwnProperty.call(message, "image")) {
                let error = $root.transit_realtime.TranslatedImage.verify(message.image, _depth + 1);
                if (error)
                    return "image." + error;
            }
            if (message.imageAlternativeText != null && $Object.hasOwnProperty.call(message, "imageAlternativeText")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.imageAlternativeText, _depth + 1);
                if (error)
                    return "imageAlternativeText." + error;
            }
            if (message.causeDetail != null && $Object.hasOwnProperty.call(message, "causeDetail")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.causeDetail, _depth + 1);
                if (error)
                    return "causeDetail." + error;
            }
            if (message.effectDetail != null && $Object.hasOwnProperty.call(message, "effectDetail")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.effectDetail, _depth + 1);
                if (error)
                    return "effectDetail." + error;
            }
            return null;
        };

        /**
         * Creates an Alert message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.Alert
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.Alert} Alert
         */
        Alert.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.Alert)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.Alert: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.Alert();
            if (object.activePeriod) {
                if (!$Array.isArray(object.activePeriod))
                    throw $TypeError(".transit_realtime.Alert.activePeriod: array expected");
                message.activePeriod = $Array(object.activePeriod.length);
                for (let i = 0; i < object.activePeriod.length; ++i) {
                    if (!$util.isObject(object.activePeriod[i]))
                        throw $TypeError(".transit_realtime.Alert.activePeriod: object expected");
                    message.activePeriod[i] = $root.transit_realtime.TimeRange.fromObject(object.activePeriod[i], _depth + 1);
                }
            }
            if (object.communicationPeriod) {
                if (!$Array.isArray(object.communicationPeriod))
                    throw $TypeError(".transit_realtime.Alert.communicationPeriod: array expected");
                message.communicationPeriod = $Array(object.communicationPeriod.length);
                for (let i = 0; i < object.communicationPeriod.length; ++i) {
                    if (!$util.isObject(object.communicationPeriod[i]))
                        throw $TypeError(".transit_realtime.Alert.communicationPeriod: object expected");
                    message.communicationPeriod[i] = $root.transit_realtime.TimeRange.fromObject(object.communicationPeriod[i], _depth + 1);
                }
            }
            if (object.impactPeriod) {
                if (!$Array.isArray(object.impactPeriod))
                    throw $TypeError(".transit_realtime.Alert.impactPeriod: array expected");
                message.impactPeriod = $Array(object.impactPeriod.length);
                for (let i = 0; i < object.impactPeriod.length; ++i) {
                    if (!$util.isObject(object.impactPeriod[i]))
                        throw $TypeError(".transit_realtime.Alert.impactPeriod: object expected");
                    message.impactPeriod[i] = $root.transit_realtime.TimeRange.fromObject(object.impactPeriod[i], _depth + 1);
                }
            }
            if (object.informedEntity) {
                if (!$Array.isArray(object.informedEntity))
                    throw $TypeError(".transit_realtime.Alert.informedEntity: array expected");
                message.informedEntity = $Array(object.informedEntity.length);
                for (let i = 0; i < object.informedEntity.length; ++i) {
                    if (!$util.isObject(object.informedEntity[i]))
                        throw $TypeError(".transit_realtime.Alert.informedEntity: object expected");
                    message.informedEntity[i] = $root.transit_realtime.EntitySelector.fromObject(object.informedEntity[i], _depth + 1);
                }
            }
            switch (object.cause) {
            case "UNKNOWN_CAUSE":
            case 1:
                message.cause = 1;
                break;
            case "OTHER_CAUSE":
            case 2:
                message.cause = 2;
                break;
            case "TECHNICAL_PROBLEM":
            case 3:
                message.cause = 3;
                break;
            case "STRIKE":
            case 4:
                message.cause = 4;
                break;
            case "DEMONSTRATION":
            case 5:
                message.cause = 5;
                break;
            case "ACCIDENT":
            case 6:
                message.cause = 6;
                break;
            case "HOLIDAY":
            case 7:
                message.cause = 7;
                break;
            case "WEATHER":
            case 8:
                message.cause = 8;
                break;
            case "MAINTENANCE":
            case 9:
                message.cause = 9;
                break;
            case "CONSTRUCTION":
            case 10:
                message.cause = 10;
                break;
            case "POLICE_ACTIVITY":
            case 11:
                message.cause = 11;
                break;
            case "MEDICAL_EMERGENCY":
            case 12:
                message.cause = 12;
                break;
            case "SPECIAL_EVENT":
            case 13:
                message.cause = 13;
                break;
            default:
            }
            switch (object.effect) {
            case "NO_SERVICE":
            case 1:
                message.effect = 1;
                break;
            case "REDUCED_SERVICE":
            case 2:
                message.effect = 2;
                break;
            case "SIGNIFICANT_DELAYS":
            case 3:
                message.effect = 3;
                break;
            case "DETOUR":
            case 4:
                message.effect = 4;
                break;
            case "ADDITIONAL_SERVICE":
            case 5:
                message.effect = 5;
                break;
            case "MODIFIED_SERVICE":
            case 6:
                message.effect = 6;
                break;
            case "OTHER_EFFECT":
            case 7:
                message.effect = 7;
                break;
            case "UNKNOWN_EFFECT":
            case 8:
                message.effect = 8;
                break;
            case "STOP_MOVED":
            case 9:
                message.effect = 9;
                break;
            case "NO_EFFECT":
            case 10:
                message.effect = 10;
                break;
            case "ACCESSIBILITY_ISSUE":
            case 11:
                message.effect = 11;
                break;
            default:
            }
            if (object.url != null) {
                if (!$util.isObject(object.url))
                    throw $TypeError(".transit_realtime.Alert.url: object expected");
                message.url = $root.transit_realtime.TranslatedString.fromObject(object.url, _depth + 1);
            }
            if (object.headerText != null) {
                if (!$util.isObject(object.headerText))
                    throw $TypeError(".transit_realtime.Alert.headerText: object expected");
                message.headerText = $root.transit_realtime.TranslatedString.fromObject(object.headerText, _depth + 1);
            }
            if (object.descriptionText != null) {
                if (!$util.isObject(object.descriptionText))
                    throw $TypeError(".transit_realtime.Alert.descriptionText: object expected");
                message.descriptionText = $root.transit_realtime.TranslatedString.fromObject(object.descriptionText, _depth + 1);
            }
            if (object.ttsHeaderText != null) {
                if (!$util.isObject(object.ttsHeaderText))
                    throw $TypeError(".transit_realtime.Alert.ttsHeaderText: object expected");
                message.ttsHeaderText = $root.transit_realtime.TranslatedString.fromObject(object.ttsHeaderText, _depth + 1);
            }
            if (object.ttsDescriptionText != null) {
                if (!$util.isObject(object.ttsDescriptionText))
                    throw $TypeError(".transit_realtime.Alert.ttsDescriptionText: object expected");
                message.ttsDescriptionText = $root.transit_realtime.TranslatedString.fromObject(object.ttsDescriptionText, _depth + 1);
            }
            switch (object.severityLevel) {
            case "UNKNOWN_SEVERITY":
            case 1:
                message.severityLevel = 1;
                break;
            case "INFO":
            case 2:
                message.severityLevel = 2;
                break;
            case "WARNING":
            case 3:
                message.severityLevel = 3;
                break;
            case "SEVERE":
            case 4:
                message.severityLevel = 4;
                break;
            default:
            }
            if (object.image != null) {
                if (!$util.isObject(object.image))
                    throw $TypeError(".transit_realtime.Alert.image: object expected");
                message.image = $root.transit_realtime.TranslatedImage.fromObject(object.image, _depth + 1);
            }
            if (object.imageAlternativeText != null) {
                if (!$util.isObject(object.imageAlternativeText))
                    throw $TypeError(".transit_realtime.Alert.imageAlternativeText: object expected");
                message.imageAlternativeText = $root.transit_realtime.TranslatedString.fromObject(object.imageAlternativeText, _depth + 1);
            }
            if (object.causeDetail != null) {
                if (!$util.isObject(object.causeDetail))
                    throw $TypeError(".transit_realtime.Alert.causeDetail: object expected");
                message.causeDetail = $root.transit_realtime.TranslatedString.fromObject(object.causeDetail, _depth + 1);
            }
            if (object.effectDetail != null) {
                if (!$util.isObject(object.effectDetail))
                    throw $TypeError(".transit_realtime.Alert.effectDetail: object expected");
                message.effectDetail = $root.transit_realtime.TranslatedString.fromObject(object.effectDetail, _depth + 1);
            }
            return message;
        };

        /**
         * Creates a plain object from an Alert message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.Alert
         * @static
         * @param {transit_realtime.Alert} message Alert
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Alert.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults) {
                object.activePeriod = [];
                object.communicationPeriod = [];
                object.impactPeriod = [];
                object.informedEntity = [];
            }
            if (options.defaults) {
                object.cause = options.enums === $String ? "UNKNOWN_CAUSE" : 1;
                object.effect = options.enums === $String ? "UNKNOWN_EFFECT" : 8;
                object.url = null;
                object.headerText = null;
                object.descriptionText = null;
                object.ttsHeaderText = null;
                object.ttsDescriptionText = null;
                object.severityLevel = options.enums === $String ? "UNKNOWN_SEVERITY" : 1;
                object.image = null;
                object.imageAlternativeText = null;
                object.causeDetail = null;
                object.effectDetail = null;
            }
            if (message.activePeriod && message.activePeriod.length) {
                object.activePeriod = $Array(message.activePeriod.length);
                for (let j = 0; j < message.activePeriod.length; ++j)
                    object.activePeriod[j] = $root.transit_realtime.TimeRange.toObject(message.activePeriod[j], options, _depth + 1);
            }
            if (message.communicationPeriod && message.communicationPeriod.length) {
                object.communicationPeriod = $Array(message.communicationPeriod.length);
                for (let j = 0; j < message.communicationPeriod.length; ++j)
                    object.communicationPeriod[j] = $root.transit_realtime.TimeRange.toObject(message.communicationPeriod[j], options, _depth + 1);
            }
            if (message.impactPeriod && message.impactPeriod.length) {
                object.impactPeriod = $Array(message.impactPeriod.length);
                for (let j = 0; j < message.impactPeriod.length; ++j)
                    object.impactPeriod[j] = $root.transit_realtime.TimeRange.toObject(message.impactPeriod[j], options, _depth + 1);
            }
            if (message.informedEntity && message.informedEntity.length) {
                object.informedEntity = $Array(message.informedEntity.length);
                for (let j = 0; j < message.informedEntity.length; ++j)
                    object.informedEntity[j] = $root.transit_realtime.EntitySelector.toObject(message.informedEntity[j], options, _depth + 1);
            }
            if (message.cause != null && $Object.hasOwnProperty.call(message, "cause"))
                object.cause = options.enums === $String ? $root.transit_realtime.Alert.Cause[message.cause] === $undefined ? message.cause : $root.transit_realtime.Alert.Cause[message.cause] : message.cause;
            if (message.effect != null && $Object.hasOwnProperty.call(message, "effect"))
                object.effect = options.enums === $String ? $root.transit_realtime.Alert.Effect[message.effect] === $undefined ? message.effect : $root.transit_realtime.Alert.Effect[message.effect] : message.effect;
            if (message.url != null && $Object.hasOwnProperty.call(message, "url"))
                object.url = $root.transit_realtime.TranslatedString.toObject(message.url, options, _depth + 1);
            if (message.headerText != null && $Object.hasOwnProperty.call(message, "headerText"))
                object.headerText = $root.transit_realtime.TranslatedString.toObject(message.headerText, options, _depth + 1);
            if (message.descriptionText != null && $Object.hasOwnProperty.call(message, "descriptionText"))
                object.descriptionText = $root.transit_realtime.TranslatedString.toObject(message.descriptionText, options, _depth + 1);
            if (message.ttsHeaderText != null && $Object.hasOwnProperty.call(message, "ttsHeaderText"))
                object.ttsHeaderText = $root.transit_realtime.TranslatedString.toObject(message.ttsHeaderText, options, _depth + 1);
            if (message.ttsDescriptionText != null && $Object.hasOwnProperty.call(message, "ttsDescriptionText"))
                object.ttsDescriptionText = $root.transit_realtime.TranslatedString.toObject(message.ttsDescriptionText, options, _depth + 1);
            if (message.severityLevel != null && $Object.hasOwnProperty.call(message, "severityLevel"))
                object.severityLevel = options.enums === $String ? $root.transit_realtime.Alert.SeverityLevel[message.severityLevel] === $undefined ? message.severityLevel : $root.transit_realtime.Alert.SeverityLevel[message.severityLevel] : message.severityLevel;
            if (message.image != null && $Object.hasOwnProperty.call(message, "image"))
                object.image = $root.transit_realtime.TranslatedImage.toObject(message.image, options, _depth + 1);
            if (message.imageAlternativeText != null && $Object.hasOwnProperty.call(message, "imageAlternativeText"))
                object.imageAlternativeText = $root.transit_realtime.TranslatedString.toObject(message.imageAlternativeText, options, _depth + 1);
            if (message.causeDetail != null && $Object.hasOwnProperty.call(message, "causeDetail"))
                object.causeDetail = $root.transit_realtime.TranslatedString.toObject(message.causeDetail, options, _depth + 1);
            if (message.effectDetail != null && $Object.hasOwnProperty.call(message, "effectDetail"))
                object.effectDetail = $root.transit_realtime.TranslatedString.toObject(message.effectDetail, options, _depth + 1);
            return object;
        };

        /**
         * Converts this Alert to JSON.
         * @function toJSON
         * @memberof transit_realtime.Alert
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Alert.prototype.toJSON = function() {
            return Alert.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for Alert
         * @function getTypeUrl
         * @memberof transit_realtime.Alert
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Alert.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.Alert";
        };

        /**
         * Cause enum.
         * @name transit_realtime.Alert.Cause
         * @enum {number}
         * @property {number} UNKNOWN_CAUSE=1 UNKNOWN_CAUSE value
         * @property {number} OTHER_CAUSE=2 OTHER_CAUSE value
         * @property {number} TECHNICAL_PROBLEM=3 TECHNICAL_PROBLEM value
         * @property {number} STRIKE=4 STRIKE value
         * @property {number} DEMONSTRATION=5 DEMONSTRATION value
         * @property {number} ACCIDENT=6 ACCIDENT value
         * @property {number} HOLIDAY=7 HOLIDAY value
         * @property {number} WEATHER=8 WEATHER value
         * @property {number} MAINTENANCE=9 MAINTENANCE value
         * @property {number} CONSTRUCTION=10 CONSTRUCTION value
         * @property {number} POLICE_ACTIVITY=11 POLICE_ACTIVITY value
         * @property {number} MEDICAL_EMERGENCY=12 MEDICAL_EMERGENCY value
         * @property {number} SPECIAL_EVENT=13 SPECIAL_EVENT value
         */
        Alert.Cause = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[1] = "UNKNOWN_CAUSE"] = 1;
            values[valuesById[2] = "OTHER_CAUSE"] = 2;
            values[valuesById[3] = "TECHNICAL_PROBLEM"] = 3;
            values[valuesById[4] = "STRIKE"] = 4;
            values[valuesById[5] = "DEMONSTRATION"] = 5;
            values[valuesById[6] = "ACCIDENT"] = 6;
            values[valuesById[7] = "HOLIDAY"] = 7;
            values[valuesById[8] = "WEATHER"] = 8;
            values[valuesById[9] = "MAINTENANCE"] = 9;
            values[valuesById[10] = "CONSTRUCTION"] = 10;
            values[valuesById[11] = "POLICE_ACTIVITY"] = 11;
            values[valuesById[12] = "MEDICAL_EMERGENCY"] = 12;
            values[valuesById[13] = "SPECIAL_EVENT"] = 13;
            return values;
        })();

        /**
         * Effect enum.
         * @name transit_realtime.Alert.Effect
         * @enum {number}
         * @property {number} NO_SERVICE=1 NO_SERVICE value
         * @property {number} REDUCED_SERVICE=2 REDUCED_SERVICE value
         * @property {number} SIGNIFICANT_DELAYS=3 SIGNIFICANT_DELAYS value
         * @property {number} DETOUR=4 DETOUR value
         * @property {number} ADDITIONAL_SERVICE=5 ADDITIONAL_SERVICE value
         * @property {number} MODIFIED_SERVICE=6 MODIFIED_SERVICE value
         * @property {number} OTHER_EFFECT=7 OTHER_EFFECT value
         * @property {number} UNKNOWN_EFFECT=8 UNKNOWN_EFFECT value
         * @property {number} STOP_MOVED=9 STOP_MOVED value
         * @property {number} NO_EFFECT=10 NO_EFFECT value
         * @property {number} ACCESSIBILITY_ISSUE=11 ACCESSIBILITY_ISSUE value
         */
        Alert.Effect = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[1] = "NO_SERVICE"] = 1;
            values[valuesById[2] = "REDUCED_SERVICE"] = 2;
            values[valuesById[3] = "SIGNIFICANT_DELAYS"] = 3;
            values[valuesById[4] = "DETOUR"] = 4;
            values[valuesById[5] = "ADDITIONAL_SERVICE"] = 5;
            values[valuesById[6] = "MODIFIED_SERVICE"] = 6;
            values[valuesById[7] = "OTHER_EFFECT"] = 7;
            values[valuesById[8] = "UNKNOWN_EFFECT"] = 8;
            values[valuesById[9] = "STOP_MOVED"] = 9;
            values[valuesById[10] = "NO_EFFECT"] = 10;
            values[valuesById[11] = "ACCESSIBILITY_ISSUE"] = 11;
            return values;
        })();

        /**
         * SeverityLevel enum.
         * @name transit_realtime.Alert.SeverityLevel
         * @enum {number}
         * @property {number} UNKNOWN_SEVERITY=1 UNKNOWN_SEVERITY value
         * @property {number} INFO=2 INFO value
         * @property {number} WARNING=3 WARNING value
         * @property {number} SEVERE=4 SEVERE value
         */
        Alert.SeverityLevel = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[1] = "UNKNOWN_SEVERITY"] = 1;
            values[valuesById[2] = "INFO"] = 2;
            values[valuesById[3] = "WARNING"] = 3;
            values[valuesById[4] = "SEVERE"] = 4;
            return values;
        })();

        return Alert;
    })();

    transit_realtime.TimeRange = (function() {

        /**
         * Properties of a TimeRange.
         * @typedef {Object} transit_realtime.TimeRange.$Properties
         * @property {number|Long|null} [start] TimeRange start
         * @property {number|Long|null} [end] TimeRange end
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a TimeRange.
         * @memberof transit_realtime
         * @interface ITimeRange
         * @augments transit_realtime.TimeRange.$Properties
         * @deprecated Use transit_realtime.TimeRange.$Properties instead.
         */

        /**
         * Shape of a TimeRange.
         * @typedef {transit_realtime.TimeRange.$Properties} transit_realtime.TimeRange.$Shape
         */

        /**
         * Constructs a new TimeRange.
         * @memberof transit_realtime
         * @classdesc Represents a TimeRange.
         * @constructor
         * @param {transit_realtime.TimeRange.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const TimeRange = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * TimeRange start.
         * @member {number|Long} start
         * @memberof transit_realtime.TimeRange
         * @instance
         */
        TimeRange.prototype.start = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * TimeRange end.
         * @member {number|Long} end
         * @memberof transit_realtime.TimeRange
         * @instance
         */
        TimeRange.prototype.end = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new TimeRange instance using the specified properties.
         * @function create
         * @memberof transit_realtime.TimeRange
         * @static
         * @param {transit_realtime.TimeRange.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.TimeRange} TimeRange instance
         * @type {{
         *   (properties: transit_realtime.TimeRange.$Shape): transit_realtime.TimeRange & transit_realtime.TimeRange.$Shape;
         *   (properties?: transit_realtime.TimeRange.$Properties): transit_realtime.TimeRange;
         * }}
         */
        TimeRange.create = function(properties) {
            return new TimeRange(properties);
        };

        /**
         * Encodes the specified TimeRange message. Does not implicitly {@link transit_realtime.TimeRange.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.TimeRange
         * @static
         * @param {transit_realtime.TimeRange.$Properties} message TimeRange message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TimeRange.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.start != null && $Object.hasOwnProperty.call(message, "start"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.start);
            if (message.end != null && $Object.hasOwnProperty.call(message, "end"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.end);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified TimeRange message, length delimited. Does not implicitly {@link transit_realtime.TimeRange.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.TimeRange
         * @static
         * @param {transit_realtime.TimeRange.$Properties} message TimeRange message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TimeRange.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a TimeRange message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.TimeRange
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.TimeRange & transit_realtime.TimeRange.$Shape} TimeRange
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TimeRange.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.TimeRange();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.start = reader.uint64();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.end = reader.uint64();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a TimeRange message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.TimeRange
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.TimeRange & transit_realtime.TimeRange.$Shape} TimeRange
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TimeRange.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TimeRange message.
         * @function verify
         * @memberof transit_realtime.TimeRange
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TimeRange.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.start != null && $Object.hasOwnProperty.call(message, "start"))
                if (!$util.isInteger(message.start) && !(message.start && $util.isInteger(message.start.low) && $util.isInteger(message.start.high)))
                    return "start: integer|Long expected";
            if (message.end != null && $Object.hasOwnProperty.call(message, "end"))
                if (!$util.isInteger(message.end) && !(message.end && $util.isInteger(message.end.low) && $util.isInteger(message.end.high)))
                    return "end: integer|Long expected";
            return null;
        };

        /**
         * Creates a TimeRange message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.TimeRange
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.TimeRange} TimeRange
         */
        TimeRange.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.TimeRange)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.TimeRange: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.TimeRange();
            if (object.start != null)
                if ($util.Long)
                    message.start = $util.Long.fromValue(object.start, true);
                else if (typeof object.start === "string")
                    message.start = $parseInt(object.start, 10);
                else if (typeof object.start === "number")
                    message.start = object.start;
                else if (typeof object.start === "object")
                    message.start = new $util.LongBits(object.start.low >>> 0, object.start.high >>> 0).toNumber(true);
            if (object.end != null)
                if ($util.Long)
                    message.end = $util.Long.fromValue(object.end, true);
                else if (typeof object.end === "string")
                    message.end = $parseInt(object.end, 10);
                else if (typeof object.end === "number")
                    message.end = object.end;
                else if (typeof object.end === "object")
                    message.end = new $util.LongBits(object.end.low >>> 0, object.end.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a TimeRange message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.TimeRange
         * @static
         * @param {transit_realtime.TimeRange} message TimeRange
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TimeRange.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.start = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.start = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.end = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.end = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
            }
            if (message.start != null && $Object.hasOwnProperty.call(message, "start"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.start = typeof message.start === "number" ? $BigInt(message.start) : $util.Long.fromBits(message.start.low >>> 0, message.start.high >>> 0, true).toBigInt();
                else if (typeof message.start === "number")
                    object.start = options.longs === $String ? $String(message.start) : message.start;
                else
                    object.start = options.longs === $String ? $util.Long.prototype.toString.call(message.start) : options.longs === $Number ? new $util.LongBits(message.start.low >>> 0, message.start.high >>> 0).toNumber(true) : message.start;
            if (message.end != null && $Object.hasOwnProperty.call(message, "end"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.end = typeof message.end === "number" ? $BigInt(message.end) : $util.Long.fromBits(message.end.low >>> 0, message.end.high >>> 0, true).toBigInt();
                else if (typeof message.end === "number")
                    object.end = options.longs === $String ? $String(message.end) : message.end;
                else
                    object.end = options.longs === $String ? $util.Long.prototype.toString.call(message.end) : options.longs === $Number ? new $util.LongBits(message.end.low >>> 0, message.end.high >>> 0).toNumber(true) : message.end;
            return object;
        };

        /**
         * Converts this TimeRange to JSON.
         * @function toJSON
         * @memberof transit_realtime.TimeRange
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TimeRange.prototype.toJSON = function() {
            return TimeRange.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for TimeRange
         * @function getTypeUrl
         * @memberof transit_realtime.TimeRange
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TimeRange.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.TimeRange";
        };

        return TimeRange;
    })();

    transit_realtime.Position = (function() {

        /**
         * Properties of a Position.
         * @typedef {Object} transit_realtime.Position.$Properties
         * @property {number} latitude Position latitude
         * @property {number} longitude Position longitude
         * @property {number|null} [bearing] Position bearing
         * @property {number|null} [odometer] Position odometer
         * @property {number|null} [speed] Position speed
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Position.
         * @memberof transit_realtime
         * @interface IPosition
         * @augments transit_realtime.Position.$Properties
         * @deprecated Use transit_realtime.Position.$Properties instead.
         */

        /**
         * Shape of a Position.
         * @typedef {transit_realtime.Position.$Properties} transit_realtime.Position.$Shape
         */

        /**
         * Constructs a new Position.
         * @memberof transit_realtime
         * @classdesc Represents a Position.
         * @constructor
         * @param {transit_realtime.Position.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Position = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Position latitude.
         * @member {number} latitude
         * @memberof transit_realtime.Position
         * @instance
         */
        Position.prototype.latitude = 0;

        /**
         * Position longitude.
         * @member {number} longitude
         * @memberof transit_realtime.Position
         * @instance
         */
        Position.prototype.longitude = 0;

        /**
         * Position bearing.
         * @member {number} bearing
         * @memberof transit_realtime.Position
         * @instance
         */
        Position.prototype.bearing = 0;

        /**
         * Position odometer.
         * @member {number} odometer
         * @memberof transit_realtime.Position
         * @instance
         */
        Position.prototype.odometer = 0;

        /**
         * Position speed.
         * @member {number} speed
         * @memberof transit_realtime.Position
         * @instance
         */
        Position.prototype.speed = 0;

        /**
         * Creates a new Position instance using the specified properties.
         * @function create
         * @memberof transit_realtime.Position
         * @static
         * @param {transit_realtime.Position.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.Position} Position instance
         * @type {{
         *   (properties: transit_realtime.Position.$Shape): transit_realtime.Position & transit_realtime.Position.$Shape;
         *   (properties?: transit_realtime.Position.$Properties): transit_realtime.Position;
         * }}
         */
        Position.create = function(properties) {
            return new Position(properties);
        };

        /**
         * Encodes the specified Position message. Does not implicitly {@link transit_realtime.Position.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.Position
         * @static
         * @param {transit_realtime.Position.$Properties} message Position message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Position.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            writer.uint32(/* id 1, wireType 5 =*/13).float(message.latitude);
            writer.uint32(/* id 2, wireType 5 =*/21).float(message.longitude);
            if (message.bearing != null && $Object.hasOwnProperty.call(message, "bearing"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.bearing);
            if (message.odometer != null && $Object.hasOwnProperty.call(message, "odometer"))
                writer.uint32(/* id 4, wireType 1 =*/33).double(message.odometer);
            if (message.speed != null && $Object.hasOwnProperty.call(message, "speed"))
                writer.uint32(/* id 5, wireType 5 =*/45).float(message.speed);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified Position message, length delimited. Does not implicitly {@link transit_realtime.Position.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.Position
         * @static
         * @param {transit_realtime.Position.$Properties} message Position message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Position.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a Position message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.Position
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.Position & transit_realtime.Position.$Shape} Position
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Position.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.Position();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 5)
                            break;
                        message.latitude = reader.float();
                        continue;
                    }
                case 2: {
                        if (wireType !== 5)
                            break;
                        message.longitude = reader.float();
                        continue;
                    }
                case 3: {
                        if (wireType !== 5)
                            break;
                        message.bearing = reader.float();
                        continue;
                    }
                case 4: {
                        if (wireType !== 1)
                            break;
                        message.odometer = reader.double();
                        continue;
                    }
                case 5: {
                        if (wireType !== 5)
                            break;
                        message.speed = reader.float();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            if (!$Object.hasOwnProperty.call(message, "latitude"))
                throw $util.ProtocolError("missing required 'latitude'", { instance: message });
            if (!$Object.hasOwnProperty.call(message, "longitude"))
                throw $util.ProtocolError("missing required 'longitude'", { instance: message });
            return message;
        };

        /**
         * Decodes a Position message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.Position
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.Position & transit_realtime.Position.$Shape} Position
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Position.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Position message.
         * @function verify
         * @memberof transit_realtime.Position
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Position.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (typeof message.latitude !== "number")
                return "latitude: number expected";
            if (typeof message.longitude !== "number")
                return "longitude: number expected";
            if (message.bearing != null && $Object.hasOwnProperty.call(message, "bearing"))
                if (typeof message.bearing !== "number")
                    return "bearing: number expected";
            if (message.odometer != null && $Object.hasOwnProperty.call(message, "odometer"))
                if (typeof message.odometer !== "number")
                    return "odometer: number expected";
            if (message.speed != null && $Object.hasOwnProperty.call(message, "speed"))
                if (typeof message.speed !== "number")
                    return "speed: number expected";
            return null;
        };

        /**
         * Creates a Position message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.Position
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.Position} Position
         */
        Position.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.Position)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.Position: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.Position();
            if (object.latitude != null)
                message.latitude = $Number(object.latitude);
            if (object.longitude != null)
                message.longitude = $Number(object.longitude);
            if (object.bearing != null)
                message.bearing = $Number(object.bearing);
            if (object.odometer != null)
                message.odometer = $Number(object.odometer);
            if (object.speed != null)
                message.speed = $Number(object.speed);
            return message;
        };

        /**
         * Creates a plain object from a Position message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.Position
         * @static
         * @param {transit_realtime.Position} message Position
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Position.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.latitude = 0;
                object.longitude = 0;
                object.bearing = 0;
                object.odometer = 0;
                object.speed = 0;
            }
            if (message.latitude != null && $Object.hasOwnProperty.call(message, "latitude"))
                object.latitude = options.json && !$isFinite(message.latitude) ? $String(message.latitude) : message.latitude;
            if (message.longitude != null && $Object.hasOwnProperty.call(message, "longitude"))
                object.longitude = options.json && !$isFinite(message.longitude) ? $String(message.longitude) : message.longitude;
            if (message.bearing != null && $Object.hasOwnProperty.call(message, "bearing"))
                object.bearing = options.json && !$isFinite(message.bearing) ? $String(message.bearing) : message.bearing;
            if (message.odometer != null && $Object.hasOwnProperty.call(message, "odometer"))
                object.odometer = options.json && !$isFinite(message.odometer) ? $String(message.odometer) : message.odometer;
            if (message.speed != null && $Object.hasOwnProperty.call(message, "speed"))
                object.speed = options.json && !$isFinite(message.speed) ? $String(message.speed) : message.speed;
            return object;
        };

        /**
         * Converts this Position to JSON.
         * @function toJSON
         * @memberof transit_realtime.Position
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Position.prototype.toJSON = function() {
            return Position.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for Position
         * @function getTypeUrl
         * @memberof transit_realtime.Position
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Position.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.Position";
        };

        return Position;
    })();

    transit_realtime.TripDescriptor = (function() {

        /**
         * Properties of a TripDescriptor.
         * @typedef {Object} transit_realtime.TripDescriptor.$Properties
         * @property {string|null} [tripId] TripDescriptor tripId
         * @property {string|null} [routeId] TripDescriptor routeId
         * @property {number|null} [directionId] TripDescriptor directionId
         * @property {string|null} [startTime] TripDescriptor startTime
         * @property {string|null} [startDate] TripDescriptor startDate
         * @property {transit_realtime.TripDescriptor.ScheduleRelationship|null} [scheduleRelationship] TripDescriptor scheduleRelationship
         * @property {transit_realtime.TripDescriptor.ModifiedTripSelector.$Properties|null} [modifiedTrip] TripDescriptor modifiedTrip
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a TripDescriptor.
         * @memberof transit_realtime
         * @interface ITripDescriptor
         * @augments transit_realtime.TripDescriptor.$Properties
         * @deprecated Use transit_realtime.TripDescriptor.$Properties instead.
         */

        /**
         * Shape of a TripDescriptor.
         * @typedef {transit_realtime.TripDescriptor.$Properties} transit_realtime.TripDescriptor.$Shape
         */

        /**
         * Constructs a new TripDescriptor.
         * @memberof transit_realtime
         * @classdesc Represents a TripDescriptor.
         * @constructor
         * @param {transit_realtime.TripDescriptor.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const TripDescriptor = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * TripDescriptor tripId.
         * @member {string} tripId
         * @memberof transit_realtime.TripDescriptor
         * @instance
         */
        TripDescriptor.prototype.tripId = "";

        /**
         * TripDescriptor routeId.
         * @member {string} routeId
         * @memberof transit_realtime.TripDescriptor
         * @instance
         */
        TripDescriptor.prototype.routeId = "";

        /**
         * TripDescriptor directionId.
         * @member {number} directionId
         * @memberof transit_realtime.TripDescriptor
         * @instance
         */
        TripDescriptor.prototype.directionId = 0;

        /**
         * TripDescriptor startTime.
         * @member {string} startTime
         * @memberof transit_realtime.TripDescriptor
         * @instance
         */
        TripDescriptor.prototype.startTime = "";

        /**
         * TripDescriptor startDate.
         * @member {string} startDate
         * @memberof transit_realtime.TripDescriptor
         * @instance
         */
        TripDescriptor.prototype.startDate = "";

        /**
         * TripDescriptor scheduleRelationship.
         * @member {transit_realtime.TripDescriptor.ScheduleRelationship} scheduleRelationship
         * @memberof transit_realtime.TripDescriptor
         * @instance
         */
        TripDescriptor.prototype.scheduleRelationship = 0;

        /**
         * TripDescriptor modifiedTrip.
         * @member {transit_realtime.TripDescriptor.ModifiedTripSelector.$Properties|null|undefined} modifiedTrip
         * @memberof transit_realtime.TripDescriptor
         * @instance
         */
        TripDescriptor.prototype.modifiedTrip = null;

        /**
         * Creates a new TripDescriptor instance using the specified properties.
         * @function create
         * @memberof transit_realtime.TripDescriptor
         * @static
         * @param {transit_realtime.TripDescriptor.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.TripDescriptor} TripDescriptor instance
         * @type {{
         *   (properties: transit_realtime.TripDescriptor.$Shape): transit_realtime.TripDescriptor & transit_realtime.TripDescriptor.$Shape;
         *   (properties?: transit_realtime.TripDescriptor.$Properties): transit_realtime.TripDescriptor;
         * }}
         */
        TripDescriptor.create = function(properties) {
            return new TripDescriptor(properties);
        };

        /**
         * Encodes the specified TripDescriptor message. Does not implicitly {@link transit_realtime.TripDescriptor.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.TripDescriptor
         * @static
         * @param {transit_realtime.TripDescriptor.$Properties} message TripDescriptor message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TripDescriptor.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.tripId != null && $Object.hasOwnProperty.call(message, "tripId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.tripId);
            if (message.startTime != null && $Object.hasOwnProperty.call(message, "startTime"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.startTime);
            if (message.startDate != null && $Object.hasOwnProperty.call(message, "startDate"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.startDate);
            if (message.scheduleRelationship != null && $Object.hasOwnProperty.call(message, "scheduleRelationship"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.scheduleRelationship);
            if (message.routeId != null && $Object.hasOwnProperty.call(message, "routeId"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.routeId);
            if (message.directionId != null && $Object.hasOwnProperty.call(message, "directionId"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.directionId);
            if (message.modifiedTrip != null && $Object.hasOwnProperty.call(message, "modifiedTrip"))
                $root.transit_realtime.TripDescriptor.ModifiedTripSelector.encode(message.modifiedTrip, writer.uint32(/* id 7, wireType 2 =*/58).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified TripDescriptor message, length delimited. Does not implicitly {@link transit_realtime.TripDescriptor.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.TripDescriptor
         * @static
         * @param {transit_realtime.TripDescriptor.$Properties} message TripDescriptor message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TripDescriptor.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a TripDescriptor message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.TripDescriptor
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.TripDescriptor & transit_realtime.TripDescriptor.$Shape} TripDescriptor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TripDescriptor.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message, value;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.TripDescriptor();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.tripId = reader.string();
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        message.routeId = reader.string();
                        continue;
                    }
                case 6: {
                        if (wireType !== 0)
                            break;
                        message.directionId = reader.uint32();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.startTime = reader.string();
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.startDate = reader.string();
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        value = reader.int32();
                        if ($root.transit_realtime.TripDescriptor.ScheduleRelationship[value] !== $undefined)
                            message.scheduleRelationship = value;
                        else if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                        continue;
                    }
                case 7: {
                        if (wireType !== 2)
                            break;
                        message.modifiedTrip = $root.transit_realtime.TripDescriptor.ModifiedTripSelector.decode(reader, reader.uint32(), $undefined, _depth + 1, message.modifiedTrip);
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a TripDescriptor message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.TripDescriptor
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.TripDescriptor & transit_realtime.TripDescriptor.$Shape} TripDescriptor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TripDescriptor.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TripDescriptor message.
         * @function verify
         * @memberof transit_realtime.TripDescriptor
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TripDescriptor.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.tripId != null && $Object.hasOwnProperty.call(message, "tripId"))
                if (!$util.isString(message.tripId))
                    return "tripId: string expected";
            if (message.routeId != null && $Object.hasOwnProperty.call(message, "routeId"))
                if (!$util.isString(message.routeId))
                    return "routeId: string expected";
            if (message.directionId != null && $Object.hasOwnProperty.call(message, "directionId"))
                if (!$util.isInteger(message.directionId))
                    return "directionId: integer expected";
            if (message.startTime != null && $Object.hasOwnProperty.call(message, "startTime"))
                if (!$util.isString(message.startTime))
                    return "startTime: string expected";
            if (message.startDate != null && $Object.hasOwnProperty.call(message, "startDate"))
                if (!$util.isString(message.startDate))
                    return "startDate: string expected";
            if (message.scheduleRelationship != null && $Object.hasOwnProperty.call(message, "scheduleRelationship"))
                switch (message.scheduleRelationship) {
                default:
                    return "scheduleRelationship: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 5:
                case 6:
                case 7:
                case 8:
                    break;
                }
            if (message.modifiedTrip != null && $Object.hasOwnProperty.call(message, "modifiedTrip")) {
                let error = $root.transit_realtime.TripDescriptor.ModifiedTripSelector.verify(message.modifiedTrip, _depth + 1);
                if (error)
                    return "modifiedTrip." + error;
            }
            return null;
        };

        /**
         * Creates a TripDescriptor message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.TripDescriptor
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.TripDescriptor} TripDescriptor
         */
        TripDescriptor.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.TripDescriptor)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.TripDescriptor: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.TripDescriptor();
            if (object.tripId != null)
                message.tripId = $String(object.tripId);
            if (object.routeId != null)
                message.routeId = $String(object.routeId);
            if (object.directionId != null)
                message.directionId = object.directionId >>> 0;
            if (object.startTime != null)
                message.startTime = $String(object.startTime);
            if (object.startDate != null)
                message.startDate = $String(object.startDate);
            switch (object.scheduleRelationship) {
            case "SCHEDULED":
            case 0:
                message.scheduleRelationship = 0;
                break;
            case "ADDED":
            case 1:
                message.scheduleRelationship = 1;
                break;
            case "UNSCHEDULED":
            case 2:
                message.scheduleRelationship = 2;
                break;
            case "CANCELED":
            case 3:
                message.scheduleRelationship = 3;
                break;
            case "REPLACEMENT":
            case 5:
                message.scheduleRelationship = 5;
                break;
            case "DUPLICATED":
            case 6:
                message.scheduleRelationship = 6;
                break;
            case "DELETED":
            case 7:
                message.scheduleRelationship = 7;
                break;
            case "NEW":
            case 8:
                message.scheduleRelationship = 8;
                break;
            default:
            }
            if (object.modifiedTrip != null) {
                if (!$util.isObject(object.modifiedTrip))
                    throw $TypeError(".transit_realtime.TripDescriptor.modifiedTrip: object expected");
                message.modifiedTrip = $root.transit_realtime.TripDescriptor.ModifiedTripSelector.fromObject(object.modifiedTrip, _depth + 1);
            }
            return message;
        };

        /**
         * Creates a plain object from a TripDescriptor message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.TripDescriptor
         * @static
         * @param {transit_realtime.TripDescriptor} message TripDescriptor
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TripDescriptor.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.tripId = "";
                object.startTime = "";
                object.startDate = "";
                object.scheduleRelationship = options.enums === $String ? "SCHEDULED" : 0;
                object.routeId = "";
                object.directionId = 0;
                object.modifiedTrip = null;
            }
            if (message.tripId != null && $Object.hasOwnProperty.call(message, "tripId"))
                object.tripId = message.tripId;
            if (message.startTime != null && $Object.hasOwnProperty.call(message, "startTime"))
                object.startTime = message.startTime;
            if (message.startDate != null && $Object.hasOwnProperty.call(message, "startDate"))
                object.startDate = message.startDate;
            if (message.scheduleRelationship != null && $Object.hasOwnProperty.call(message, "scheduleRelationship"))
                object.scheduleRelationship = options.enums === $String ? $root.transit_realtime.TripDescriptor.ScheduleRelationship[message.scheduleRelationship] === $undefined ? message.scheduleRelationship : $root.transit_realtime.TripDescriptor.ScheduleRelationship[message.scheduleRelationship] : message.scheduleRelationship;
            if (message.routeId != null && $Object.hasOwnProperty.call(message, "routeId"))
                object.routeId = message.routeId;
            if (message.directionId != null && $Object.hasOwnProperty.call(message, "directionId"))
                object.directionId = message.directionId;
            if (message.modifiedTrip != null && $Object.hasOwnProperty.call(message, "modifiedTrip"))
                object.modifiedTrip = $root.transit_realtime.TripDescriptor.ModifiedTripSelector.toObject(message.modifiedTrip, options, _depth + 1);
            return object;
        };

        /**
         * Converts this TripDescriptor to JSON.
         * @function toJSON
         * @memberof transit_realtime.TripDescriptor
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TripDescriptor.prototype.toJSON = function() {
            return TripDescriptor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for TripDescriptor
         * @function getTypeUrl
         * @memberof transit_realtime.TripDescriptor
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TripDescriptor.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.TripDescriptor";
        };

        /**
         * ScheduleRelationship enum.
         * @name transit_realtime.TripDescriptor.ScheduleRelationship
         * @enum {number}
         * @property {number} SCHEDULED=0 SCHEDULED value
         * @property {number} ADDED=1 ADDED value
         * @property {number} UNSCHEDULED=2 UNSCHEDULED value
         * @property {number} CANCELED=3 CANCELED value
         * @property {number} REPLACEMENT=5 REPLACEMENT value
         * @property {number} DUPLICATED=6 DUPLICATED value
         * @property {number} DELETED=7 DELETED value
         * @property {number} NEW=8 NEW value
         */
        TripDescriptor.ScheduleRelationship = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "SCHEDULED"] = 0;
            values[valuesById[1] = "ADDED"] = 1;
            values[valuesById[2] = "UNSCHEDULED"] = 2;
            values[valuesById[3] = "CANCELED"] = 3;
            values[valuesById[5] = "REPLACEMENT"] = 5;
            values[valuesById[6] = "DUPLICATED"] = 6;
            values[valuesById[7] = "DELETED"] = 7;
            values[valuesById[8] = "NEW"] = 8;
            return values;
        })();

        TripDescriptor.ModifiedTripSelector = (function() {

            /**
             * Properties of a ModifiedTripSelector.
             * @typedef {Object} transit_realtime.TripDescriptor.ModifiedTripSelector.$Properties
             * @property {string|null} [modificationsId] ModifiedTripSelector modificationsId
             * @property {string|null} [affectedTripId] ModifiedTripSelector affectedTripId
             * @property {string|null} [startTime] ModifiedTripSelector startTime
             * @property {string|null} [startDate] ModifiedTripSelector startDate
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a ModifiedTripSelector.
             * @memberof transit_realtime.TripDescriptor
             * @interface IModifiedTripSelector
             * @augments transit_realtime.TripDescriptor.ModifiedTripSelector.$Properties
             * @deprecated Use transit_realtime.TripDescriptor.ModifiedTripSelector.$Properties instead.
             */

            /**
             * Shape of a ModifiedTripSelector.
             * @typedef {transit_realtime.TripDescriptor.ModifiedTripSelector.$Properties} transit_realtime.TripDescriptor.ModifiedTripSelector.$Shape
             */

            /**
             * Constructs a new ModifiedTripSelector.
             * @memberof transit_realtime.TripDescriptor
             * @classdesc Represents a ModifiedTripSelector.
             * @constructor
             * @param {transit_realtime.TripDescriptor.ModifiedTripSelector.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const ModifiedTripSelector = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * ModifiedTripSelector modificationsId.
             * @member {string} modificationsId
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @instance
             */
            ModifiedTripSelector.prototype.modificationsId = "";

            /**
             * ModifiedTripSelector affectedTripId.
             * @member {string} affectedTripId
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @instance
             */
            ModifiedTripSelector.prototype.affectedTripId = "";

            /**
             * ModifiedTripSelector startTime.
             * @member {string} startTime
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @instance
             */
            ModifiedTripSelector.prototype.startTime = "";

            /**
             * ModifiedTripSelector startDate.
             * @member {string} startDate
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @instance
             */
            ModifiedTripSelector.prototype.startDate = "";

            /**
             * Creates a new ModifiedTripSelector instance using the specified properties.
             * @function create
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @static
             * @param {transit_realtime.TripDescriptor.ModifiedTripSelector.$Properties=} [properties] Properties to set
             * @returns {transit_realtime.TripDescriptor.ModifiedTripSelector} ModifiedTripSelector instance
             * @type {{
             *   (properties: transit_realtime.TripDescriptor.ModifiedTripSelector.$Shape): transit_realtime.TripDescriptor.ModifiedTripSelector & transit_realtime.TripDescriptor.ModifiedTripSelector.$Shape;
             *   (properties?: transit_realtime.TripDescriptor.ModifiedTripSelector.$Properties): transit_realtime.TripDescriptor.ModifiedTripSelector;
             * }}
             */
            ModifiedTripSelector.create = function(properties) {
                return new ModifiedTripSelector(properties);
            };

            /**
             * Encodes the specified ModifiedTripSelector message. Does not implicitly {@link transit_realtime.TripDescriptor.ModifiedTripSelector.verify|verify} messages.
             * @function encode
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @static
             * @param {transit_realtime.TripDescriptor.ModifiedTripSelector.$Properties} message ModifiedTripSelector message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ModifiedTripSelector.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.modificationsId != null && $Object.hasOwnProperty.call(message, "modificationsId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.modificationsId);
                if (message.affectedTripId != null && $Object.hasOwnProperty.call(message, "affectedTripId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.affectedTripId);
                if (message.startTime != null && $Object.hasOwnProperty.call(message, "startTime"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.startTime);
                if (message.startDate != null && $Object.hasOwnProperty.call(message, "startDate"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.startDate);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified ModifiedTripSelector message, length delimited. Does not implicitly {@link transit_realtime.TripDescriptor.ModifiedTripSelector.verify|verify} messages.
             * @function encodeDelimited
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @static
             * @param {transit_realtime.TripDescriptor.ModifiedTripSelector.$Properties} message ModifiedTripSelector message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ModifiedTripSelector.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a ModifiedTripSelector message from the specified reader or buffer.
             * @function decode
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {transit_realtime.TripDescriptor.ModifiedTripSelector & transit_realtime.TripDescriptor.ModifiedTripSelector.$Shape} ModifiedTripSelector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ModifiedTripSelector.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.transit_realtime.TripDescriptor.ModifiedTripSelector();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.modificationsId = reader.string();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.affectedTripId = reader.string();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.startTime = reader.string();
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            message.startDate = reader.string();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a ModifiedTripSelector message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {transit_realtime.TripDescriptor.ModifiedTripSelector & transit_realtime.TripDescriptor.ModifiedTripSelector.$Shape} ModifiedTripSelector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ModifiedTripSelector.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ModifiedTripSelector message.
             * @function verify
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ModifiedTripSelector.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.modificationsId != null && $Object.hasOwnProperty.call(message, "modificationsId"))
                    if (!$util.isString(message.modificationsId))
                        return "modificationsId: string expected";
                if (message.affectedTripId != null && $Object.hasOwnProperty.call(message, "affectedTripId"))
                    if (!$util.isString(message.affectedTripId))
                        return "affectedTripId: string expected";
                if (message.startTime != null && $Object.hasOwnProperty.call(message, "startTime"))
                    if (!$util.isString(message.startTime))
                        return "startTime: string expected";
                if (message.startDate != null && $Object.hasOwnProperty.call(message, "startDate"))
                    if (!$util.isString(message.startDate))
                        return "startDate: string expected";
                return null;
            };

            /**
             * Creates a ModifiedTripSelector message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {transit_realtime.TripDescriptor.ModifiedTripSelector} ModifiedTripSelector
             */
            ModifiedTripSelector.fromObject = function (object, _depth) {
                if (object instanceof $root.transit_realtime.TripDescriptor.ModifiedTripSelector)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".transit_realtime.TripDescriptor.ModifiedTripSelector: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.transit_realtime.TripDescriptor.ModifiedTripSelector();
                if (object.modificationsId != null)
                    message.modificationsId = $String(object.modificationsId);
                if (object.affectedTripId != null)
                    message.affectedTripId = $String(object.affectedTripId);
                if (object.startTime != null)
                    message.startTime = $String(object.startTime);
                if (object.startDate != null)
                    message.startDate = $String(object.startDate);
                return message;
            };

            /**
             * Creates a plain object from a ModifiedTripSelector message. Also converts values to other types if specified.
             * @function toObject
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @static
             * @param {transit_realtime.TripDescriptor.ModifiedTripSelector} message ModifiedTripSelector
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ModifiedTripSelector.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.modificationsId = "";
                    object.affectedTripId = "";
                    object.startTime = "";
                    object.startDate = "";
                }
                if (message.modificationsId != null && $Object.hasOwnProperty.call(message, "modificationsId"))
                    object.modificationsId = message.modificationsId;
                if (message.affectedTripId != null && $Object.hasOwnProperty.call(message, "affectedTripId"))
                    object.affectedTripId = message.affectedTripId;
                if (message.startTime != null && $Object.hasOwnProperty.call(message, "startTime"))
                    object.startTime = message.startTime;
                if (message.startDate != null && $Object.hasOwnProperty.call(message, "startDate"))
                    object.startDate = message.startDate;
                return object;
            };

            /**
             * Converts this ModifiedTripSelector to JSON.
             * @function toJSON
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ModifiedTripSelector.prototype.toJSON = function() {
                return ModifiedTripSelector.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for ModifiedTripSelector
             * @function getTypeUrl
             * @memberof transit_realtime.TripDescriptor.ModifiedTripSelector
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            ModifiedTripSelector.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/transit_realtime.TripDescriptor.ModifiedTripSelector";
            };

            return ModifiedTripSelector;
        })();

        return TripDescriptor;
    })();

    transit_realtime.VehicleDescriptor = (function() {

        /**
         * Properties of a VehicleDescriptor.
         * @typedef {Object} transit_realtime.VehicleDescriptor.$Properties
         * @property {string|null} [id] VehicleDescriptor id
         * @property {string|null} [label] VehicleDescriptor label
         * @property {string|null} [licensePlate] VehicleDescriptor licensePlate
         * @property {transit_realtime.VehicleDescriptor.WheelchairAccessible|null} [wheelchairAccessible] VehicleDescriptor wheelchairAccessible
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a VehicleDescriptor.
         * @memberof transit_realtime
         * @interface IVehicleDescriptor
         * @augments transit_realtime.VehicleDescriptor.$Properties
         * @deprecated Use transit_realtime.VehicleDescriptor.$Properties instead.
         */

        /**
         * Shape of a VehicleDescriptor.
         * @typedef {transit_realtime.VehicleDescriptor.$Properties} transit_realtime.VehicleDescriptor.$Shape
         */

        /**
         * Constructs a new VehicleDescriptor.
         * @memberof transit_realtime
         * @classdesc Represents a VehicleDescriptor.
         * @constructor
         * @param {transit_realtime.VehicleDescriptor.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const VehicleDescriptor = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * VehicleDescriptor id.
         * @member {string} id
         * @memberof transit_realtime.VehicleDescriptor
         * @instance
         */
        VehicleDescriptor.prototype.id = "";

        /**
         * VehicleDescriptor label.
         * @member {string} label
         * @memberof transit_realtime.VehicleDescriptor
         * @instance
         */
        VehicleDescriptor.prototype.label = "";

        /**
         * VehicleDescriptor licensePlate.
         * @member {string} licensePlate
         * @memberof transit_realtime.VehicleDescriptor
         * @instance
         */
        VehicleDescriptor.prototype.licensePlate = "";

        /**
         * VehicleDescriptor wheelchairAccessible.
         * @member {transit_realtime.VehicleDescriptor.WheelchairAccessible} wheelchairAccessible
         * @memberof transit_realtime.VehicleDescriptor
         * @instance
         */
        VehicleDescriptor.prototype.wheelchairAccessible = 0;

        /**
         * Creates a new VehicleDescriptor instance using the specified properties.
         * @function create
         * @memberof transit_realtime.VehicleDescriptor
         * @static
         * @param {transit_realtime.VehicleDescriptor.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.VehicleDescriptor} VehicleDescriptor instance
         * @type {{
         *   (properties: transit_realtime.VehicleDescriptor.$Shape): transit_realtime.VehicleDescriptor & transit_realtime.VehicleDescriptor.$Shape;
         *   (properties?: transit_realtime.VehicleDescriptor.$Properties): transit_realtime.VehicleDescriptor;
         * }}
         */
        VehicleDescriptor.create = function(properties) {
            return new VehicleDescriptor(properties);
        };

        /**
         * Encodes the specified VehicleDescriptor message. Does not implicitly {@link transit_realtime.VehicleDescriptor.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.VehicleDescriptor
         * @static
         * @param {transit_realtime.VehicleDescriptor.$Properties} message VehicleDescriptor message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VehicleDescriptor.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.label != null && $Object.hasOwnProperty.call(message, "label"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.label);
            if (message.licensePlate != null && $Object.hasOwnProperty.call(message, "licensePlate"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.licensePlate);
            if (message.wheelchairAccessible != null && $Object.hasOwnProperty.call(message, "wheelchairAccessible"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.wheelchairAccessible);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified VehicleDescriptor message, length delimited. Does not implicitly {@link transit_realtime.VehicleDescriptor.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.VehicleDescriptor
         * @static
         * @param {transit_realtime.VehicleDescriptor.$Properties} message VehicleDescriptor message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VehicleDescriptor.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a VehicleDescriptor message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.VehicleDescriptor
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.VehicleDescriptor & transit_realtime.VehicleDescriptor.$Shape} VehicleDescriptor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VehicleDescriptor.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message, value;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.VehicleDescriptor();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.id = reader.string();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.label = reader.string();
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.licensePlate = reader.string();
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        value = reader.int32();
                        if ($root.transit_realtime.VehicleDescriptor.WheelchairAccessible[value] !== $undefined)
                            message.wheelchairAccessible = value;
                        else if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a VehicleDescriptor message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.VehicleDescriptor
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.VehicleDescriptor & transit_realtime.VehicleDescriptor.$Shape} VehicleDescriptor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VehicleDescriptor.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a VehicleDescriptor message.
         * @function verify
         * @memberof transit_realtime.VehicleDescriptor
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        VehicleDescriptor.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.label != null && $Object.hasOwnProperty.call(message, "label"))
                if (!$util.isString(message.label))
                    return "label: string expected";
            if (message.licensePlate != null && $Object.hasOwnProperty.call(message, "licensePlate"))
                if (!$util.isString(message.licensePlate))
                    return "licensePlate: string expected";
            if (message.wheelchairAccessible != null && $Object.hasOwnProperty.call(message, "wheelchairAccessible"))
                switch (message.wheelchairAccessible) {
                default:
                    return "wheelchairAccessible: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            return null;
        };

        /**
         * Creates a VehicleDescriptor message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.VehicleDescriptor
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.VehicleDescriptor} VehicleDescriptor
         */
        VehicleDescriptor.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.VehicleDescriptor)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.VehicleDescriptor: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.VehicleDescriptor();
            if (object.id != null)
                message.id = $String(object.id);
            if (object.label != null)
                message.label = $String(object.label);
            if (object.licensePlate != null)
                message.licensePlate = $String(object.licensePlate);
            switch (object.wheelchairAccessible) {
            case "NO_VALUE":
            case 0:
                message.wheelchairAccessible = 0;
                break;
            case "UNKNOWN":
            case 1:
                message.wheelchairAccessible = 1;
                break;
            case "WHEELCHAIR_ACCESSIBLE":
            case 2:
                message.wheelchairAccessible = 2;
                break;
            case "WHEELCHAIR_INACCESSIBLE":
            case 3:
                message.wheelchairAccessible = 3;
                break;
            default:
            }
            return message;
        };

        /**
         * Creates a plain object from a VehicleDescriptor message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.VehicleDescriptor
         * @static
         * @param {transit_realtime.VehicleDescriptor} message VehicleDescriptor
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        VehicleDescriptor.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.label = "";
                object.licensePlate = "";
                object.wheelchairAccessible = options.enums === $String ? "NO_VALUE" : 0;
            }
            if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                object.id = message.id;
            if (message.label != null && $Object.hasOwnProperty.call(message, "label"))
                object.label = message.label;
            if (message.licensePlate != null && $Object.hasOwnProperty.call(message, "licensePlate"))
                object.licensePlate = message.licensePlate;
            if (message.wheelchairAccessible != null && $Object.hasOwnProperty.call(message, "wheelchairAccessible"))
                object.wheelchairAccessible = options.enums === $String ? $root.transit_realtime.VehicleDescriptor.WheelchairAccessible[message.wheelchairAccessible] === $undefined ? message.wheelchairAccessible : $root.transit_realtime.VehicleDescriptor.WheelchairAccessible[message.wheelchairAccessible] : message.wheelchairAccessible;
            return object;
        };

        /**
         * Converts this VehicleDescriptor to JSON.
         * @function toJSON
         * @memberof transit_realtime.VehicleDescriptor
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        VehicleDescriptor.prototype.toJSON = function() {
            return VehicleDescriptor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for VehicleDescriptor
         * @function getTypeUrl
         * @memberof transit_realtime.VehicleDescriptor
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        VehicleDescriptor.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.VehicleDescriptor";
        };

        /**
         * WheelchairAccessible enum.
         * @name transit_realtime.VehicleDescriptor.WheelchairAccessible
         * @enum {number}
         * @property {number} NO_VALUE=0 NO_VALUE value
         * @property {number} UNKNOWN=1 UNKNOWN value
         * @property {number} WHEELCHAIR_ACCESSIBLE=2 WHEELCHAIR_ACCESSIBLE value
         * @property {number} WHEELCHAIR_INACCESSIBLE=3 WHEELCHAIR_INACCESSIBLE value
         */
        VehicleDescriptor.WheelchairAccessible = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "NO_VALUE"] = 0;
            values[valuesById[1] = "UNKNOWN"] = 1;
            values[valuesById[2] = "WHEELCHAIR_ACCESSIBLE"] = 2;
            values[valuesById[3] = "WHEELCHAIR_INACCESSIBLE"] = 3;
            return values;
        })();

        return VehicleDescriptor;
    })();

    transit_realtime.EntitySelector = (function() {

        /**
         * Properties of an EntitySelector.
         * @typedef {Object} transit_realtime.EntitySelector.$Properties
         * @property {string|null} [agencyId] EntitySelector agencyId
         * @property {string|null} [routeId] EntitySelector routeId
         * @property {number|null} [routeType] EntitySelector routeType
         * @property {transit_realtime.TripDescriptor.$Properties|null} [trip] EntitySelector trip
         * @property {string|null} [stopId] EntitySelector stopId
         * @property {number|null} [directionId] EntitySelector directionId
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of an EntitySelector.
         * @memberof transit_realtime
         * @interface IEntitySelector
         * @augments transit_realtime.EntitySelector.$Properties
         * @deprecated Use transit_realtime.EntitySelector.$Properties instead.
         */

        /**
         * Shape of an EntitySelector.
         * @typedef {transit_realtime.EntitySelector.$Properties} transit_realtime.EntitySelector.$Shape
         */

        /**
         * Constructs a new EntitySelector.
         * @memberof transit_realtime
         * @classdesc Represents an EntitySelector.
         * @constructor
         * @param {transit_realtime.EntitySelector.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const EntitySelector = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * EntitySelector agencyId.
         * @member {string} agencyId
         * @memberof transit_realtime.EntitySelector
         * @instance
         */
        EntitySelector.prototype.agencyId = "";

        /**
         * EntitySelector routeId.
         * @member {string} routeId
         * @memberof transit_realtime.EntitySelector
         * @instance
         */
        EntitySelector.prototype.routeId = "";

        /**
         * EntitySelector routeType.
         * @member {number} routeType
         * @memberof transit_realtime.EntitySelector
         * @instance
         */
        EntitySelector.prototype.routeType = 0;

        /**
         * EntitySelector trip.
         * @member {transit_realtime.TripDescriptor.$Properties|null|undefined} trip
         * @memberof transit_realtime.EntitySelector
         * @instance
         */
        EntitySelector.prototype.trip = null;

        /**
         * EntitySelector stopId.
         * @member {string} stopId
         * @memberof transit_realtime.EntitySelector
         * @instance
         */
        EntitySelector.prototype.stopId = "";

        /**
         * EntitySelector directionId.
         * @member {number} directionId
         * @memberof transit_realtime.EntitySelector
         * @instance
         */
        EntitySelector.prototype.directionId = 0;

        /**
         * Creates a new EntitySelector instance using the specified properties.
         * @function create
         * @memberof transit_realtime.EntitySelector
         * @static
         * @param {transit_realtime.EntitySelector.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.EntitySelector} EntitySelector instance
         * @type {{
         *   (properties: transit_realtime.EntitySelector.$Shape): transit_realtime.EntitySelector & transit_realtime.EntitySelector.$Shape;
         *   (properties?: transit_realtime.EntitySelector.$Properties): transit_realtime.EntitySelector;
         * }}
         */
        EntitySelector.create = function(properties) {
            return new EntitySelector(properties);
        };

        /**
         * Encodes the specified EntitySelector message. Does not implicitly {@link transit_realtime.EntitySelector.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.EntitySelector
         * @static
         * @param {transit_realtime.EntitySelector.$Properties} message EntitySelector message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EntitySelector.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.agencyId != null && $Object.hasOwnProperty.call(message, "agencyId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.agencyId);
            if (message.routeId != null && $Object.hasOwnProperty.call(message, "routeId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.routeId);
            if (message.routeType != null && $Object.hasOwnProperty.call(message, "routeType"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.routeType);
            if (message.trip != null && $Object.hasOwnProperty.call(message, "trip"))
                $root.transit_realtime.TripDescriptor.encode(message.trip, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.stopId);
            if (message.directionId != null && $Object.hasOwnProperty.call(message, "directionId"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.directionId);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified EntitySelector message, length delimited. Does not implicitly {@link transit_realtime.EntitySelector.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.EntitySelector
         * @static
         * @param {transit_realtime.EntitySelector.$Properties} message EntitySelector message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EntitySelector.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes an EntitySelector message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.EntitySelector
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.EntitySelector & transit_realtime.EntitySelector.$Shape} EntitySelector
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EntitySelector.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.EntitySelector();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.agencyId = reader.string();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.routeId = reader.string();
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        message.routeType = reader.int32();
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.trip = $root.transit_realtime.TripDescriptor.decode(reader, reader.uint32(), $undefined, _depth + 1, message.trip);
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        message.stopId = reader.string();
                        continue;
                    }
                case 6: {
                        if (wireType !== 0)
                            break;
                        message.directionId = reader.uint32();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes an EntitySelector message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.EntitySelector
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.EntitySelector & transit_realtime.EntitySelector.$Shape} EntitySelector
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EntitySelector.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an EntitySelector message.
         * @function verify
         * @memberof transit_realtime.EntitySelector
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        EntitySelector.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.agencyId != null && $Object.hasOwnProperty.call(message, "agencyId"))
                if (!$util.isString(message.agencyId))
                    return "agencyId: string expected";
            if (message.routeId != null && $Object.hasOwnProperty.call(message, "routeId"))
                if (!$util.isString(message.routeId))
                    return "routeId: string expected";
            if (message.routeType != null && $Object.hasOwnProperty.call(message, "routeType"))
                if (!$util.isInteger(message.routeType))
                    return "routeType: integer expected";
            if (message.trip != null && $Object.hasOwnProperty.call(message, "trip")) {
                let error = $root.transit_realtime.TripDescriptor.verify(message.trip, _depth + 1);
                if (error)
                    return "trip." + error;
            }
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                if (!$util.isString(message.stopId))
                    return "stopId: string expected";
            if (message.directionId != null && $Object.hasOwnProperty.call(message, "directionId"))
                if (!$util.isInteger(message.directionId))
                    return "directionId: integer expected";
            return null;
        };

        /**
         * Creates an EntitySelector message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.EntitySelector
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.EntitySelector} EntitySelector
         */
        EntitySelector.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.EntitySelector)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.EntitySelector: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.EntitySelector();
            if (object.agencyId != null)
                message.agencyId = $String(object.agencyId);
            if (object.routeId != null)
                message.routeId = $String(object.routeId);
            if (object.routeType != null)
                message.routeType = object.routeType | 0;
            if (object.trip != null) {
                if (!$util.isObject(object.trip))
                    throw $TypeError(".transit_realtime.EntitySelector.trip: object expected");
                message.trip = $root.transit_realtime.TripDescriptor.fromObject(object.trip, _depth + 1);
            }
            if (object.stopId != null)
                message.stopId = $String(object.stopId);
            if (object.directionId != null)
                message.directionId = object.directionId >>> 0;
            return message;
        };

        /**
         * Creates a plain object from an EntitySelector message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.EntitySelector
         * @static
         * @param {transit_realtime.EntitySelector} message EntitySelector
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        EntitySelector.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.agencyId = "";
                object.routeId = "";
                object.routeType = 0;
                object.trip = null;
                object.stopId = "";
                object.directionId = 0;
            }
            if (message.agencyId != null && $Object.hasOwnProperty.call(message, "agencyId"))
                object.agencyId = message.agencyId;
            if (message.routeId != null && $Object.hasOwnProperty.call(message, "routeId"))
                object.routeId = message.routeId;
            if (message.routeType != null && $Object.hasOwnProperty.call(message, "routeType"))
                object.routeType = message.routeType;
            if (message.trip != null && $Object.hasOwnProperty.call(message, "trip"))
                object.trip = $root.transit_realtime.TripDescriptor.toObject(message.trip, options, _depth + 1);
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                object.stopId = message.stopId;
            if (message.directionId != null && $Object.hasOwnProperty.call(message, "directionId"))
                object.directionId = message.directionId;
            return object;
        };

        /**
         * Converts this EntitySelector to JSON.
         * @function toJSON
         * @memberof transit_realtime.EntitySelector
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        EntitySelector.prototype.toJSON = function() {
            return EntitySelector.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for EntitySelector
         * @function getTypeUrl
         * @memberof transit_realtime.EntitySelector
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        EntitySelector.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.EntitySelector";
        };

        return EntitySelector;
    })();

    transit_realtime.TranslatedString = (function() {

        /**
         * Properties of a TranslatedString.
         * @typedef {Object} transit_realtime.TranslatedString.$Properties
         * @property {Array.<transit_realtime.TranslatedString.Translation.$Properties>|null} [translation] TranslatedString translation
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a TranslatedString.
         * @memberof transit_realtime
         * @interface ITranslatedString
         * @augments transit_realtime.TranslatedString.$Properties
         * @deprecated Use transit_realtime.TranslatedString.$Properties instead.
         */

        /**
         * Shape of a TranslatedString.
         * @typedef {transit_realtime.TranslatedString.$Properties} transit_realtime.TranslatedString.$Shape
         */

        /**
         * Constructs a new TranslatedString.
         * @memberof transit_realtime
         * @classdesc Represents a TranslatedString.
         * @constructor
         * @param {transit_realtime.TranslatedString.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const TranslatedString = function (properties) {
            this.translation = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * TranslatedString translation.
         * @member {Array.<transit_realtime.TranslatedString.Translation.$Properties>} translation
         * @memberof transit_realtime.TranslatedString
         * @instance
         */
        TranslatedString.prototype.translation = $util.emptyArray;

        /**
         * Creates a new TranslatedString instance using the specified properties.
         * @function create
         * @memberof transit_realtime.TranslatedString
         * @static
         * @param {transit_realtime.TranslatedString.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.TranslatedString} TranslatedString instance
         * @type {{
         *   (properties: transit_realtime.TranslatedString.$Shape): transit_realtime.TranslatedString & transit_realtime.TranslatedString.$Shape;
         *   (properties?: transit_realtime.TranslatedString.$Properties): transit_realtime.TranslatedString;
         * }}
         */
        TranslatedString.create = function(properties) {
            return new TranslatedString(properties);
        };

        /**
         * Encodes the specified TranslatedString message. Does not implicitly {@link transit_realtime.TranslatedString.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.TranslatedString
         * @static
         * @param {transit_realtime.TranslatedString.$Properties} message TranslatedString message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TranslatedString.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.translation != null && message.translation.length)
                for (let i = 0; i < message.translation.length; ++i)
                    $root.transit_realtime.TranslatedString.Translation.encode(message.translation[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified TranslatedString message, length delimited. Does not implicitly {@link transit_realtime.TranslatedString.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.TranslatedString
         * @static
         * @param {transit_realtime.TranslatedString.$Properties} message TranslatedString message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TranslatedString.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a TranslatedString message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.TranslatedString
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.TranslatedString & transit_realtime.TranslatedString.$Shape} TranslatedString
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TranslatedString.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.TranslatedString();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (!(message.translation && message.translation.length))
                            message.translation = [];
                        message.translation.push($root.transit_realtime.TranslatedString.Translation.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a TranslatedString message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.TranslatedString
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.TranslatedString & transit_realtime.TranslatedString.$Shape} TranslatedString
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TranslatedString.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TranslatedString message.
         * @function verify
         * @memberof transit_realtime.TranslatedString
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TranslatedString.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.translation != null && $Object.hasOwnProperty.call(message, "translation")) {
                if (!$Array.isArray(message.translation))
                    return "translation: array expected";
                for (let i = 0; i < message.translation.length; ++i) {
                    let error = $root.transit_realtime.TranslatedString.Translation.verify(message.translation[i], _depth + 1);
                    if (error)
                        return "translation." + error;
                }
            }
            return null;
        };

        /**
         * Creates a TranslatedString message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.TranslatedString
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.TranslatedString} TranslatedString
         */
        TranslatedString.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.TranslatedString)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.TranslatedString: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.TranslatedString();
            if (object.translation) {
                if (!$Array.isArray(object.translation))
                    throw $TypeError(".transit_realtime.TranslatedString.translation: array expected");
                message.translation = $Array(object.translation.length);
                for (let i = 0; i < object.translation.length; ++i) {
                    if (!$util.isObject(object.translation[i]))
                        throw $TypeError(".transit_realtime.TranslatedString.translation: object expected");
                    message.translation[i] = $root.transit_realtime.TranslatedString.Translation.fromObject(object.translation[i], _depth + 1);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a TranslatedString message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.TranslatedString
         * @static
         * @param {transit_realtime.TranslatedString} message TranslatedString
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TranslatedString.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults)
                object.translation = [];
            if (message.translation && message.translation.length) {
                object.translation = $Array(message.translation.length);
                for (let j = 0; j < message.translation.length; ++j)
                    object.translation[j] = $root.transit_realtime.TranslatedString.Translation.toObject(message.translation[j], options, _depth + 1);
            }
            return object;
        };

        /**
         * Converts this TranslatedString to JSON.
         * @function toJSON
         * @memberof transit_realtime.TranslatedString
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TranslatedString.prototype.toJSON = function() {
            return TranslatedString.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for TranslatedString
         * @function getTypeUrl
         * @memberof transit_realtime.TranslatedString
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TranslatedString.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.TranslatedString";
        };

        TranslatedString.Translation = (function() {

            /**
             * Properties of a Translation.
             * @typedef {Object} transit_realtime.TranslatedString.Translation.$Properties
             * @property {string} text Translation text
             * @property {string|null} [language] Translation language
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Translation.
             * @memberof transit_realtime.TranslatedString
             * @interface ITranslation
             * @augments transit_realtime.TranslatedString.Translation.$Properties
             * @deprecated Use transit_realtime.TranslatedString.Translation.$Properties instead.
             */

            /**
             * Shape of a Translation.
             * @typedef {transit_realtime.TranslatedString.Translation.$Properties} transit_realtime.TranslatedString.Translation.$Shape
             */

            /**
             * Constructs a new Translation.
             * @memberof transit_realtime.TranslatedString
             * @classdesc Represents a Translation.
             * @constructor
             * @param {transit_realtime.TranslatedString.Translation.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Translation = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Translation text.
             * @member {string} text
             * @memberof transit_realtime.TranslatedString.Translation
             * @instance
             */
            Translation.prototype.text = "";

            /**
             * Translation language.
             * @member {string} language
             * @memberof transit_realtime.TranslatedString.Translation
             * @instance
             */
            Translation.prototype.language = "";

            /**
             * Creates a new Translation instance using the specified properties.
             * @function create
             * @memberof transit_realtime.TranslatedString.Translation
             * @static
             * @param {transit_realtime.TranslatedString.Translation.$Properties=} [properties] Properties to set
             * @returns {transit_realtime.TranslatedString.Translation} Translation instance
             * @type {{
             *   (properties: transit_realtime.TranslatedString.Translation.$Shape): transit_realtime.TranslatedString.Translation & transit_realtime.TranslatedString.Translation.$Shape;
             *   (properties?: transit_realtime.TranslatedString.Translation.$Properties): transit_realtime.TranslatedString.Translation;
             * }}
             */
            Translation.create = function(properties) {
                return new Translation(properties);
            };

            /**
             * Encodes the specified Translation message. Does not implicitly {@link transit_realtime.TranslatedString.Translation.verify|verify} messages.
             * @function encode
             * @memberof transit_realtime.TranslatedString.Translation
             * @static
             * @param {transit_realtime.TranslatedString.Translation.$Properties} message Translation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Translation.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.text);
                if (message.language != null && $Object.hasOwnProperty.call(message, "language"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.language);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Translation message, length delimited. Does not implicitly {@link transit_realtime.TranslatedString.Translation.verify|verify} messages.
             * @function encodeDelimited
             * @memberof transit_realtime.TranslatedString.Translation
             * @static
             * @param {transit_realtime.TranslatedString.Translation.$Properties} message Translation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Translation.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a Translation message from the specified reader or buffer.
             * @function decode
             * @memberof transit_realtime.TranslatedString.Translation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {transit_realtime.TranslatedString.Translation & transit_realtime.TranslatedString.Translation.$Shape} Translation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Translation.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.transit_realtime.TranslatedString.Translation();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.text = reader.string();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.language = reader.string();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                if (!$Object.hasOwnProperty.call(message, "text"))
                    throw $util.ProtocolError("missing required 'text'", { instance: message });
                return message;
            };

            /**
             * Decodes a Translation message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof transit_realtime.TranslatedString.Translation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {transit_realtime.TranslatedString.Translation & transit_realtime.TranslatedString.Translation.$Shape} Translation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Translation.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Translation message.
             * @function verify
             * @memberof transit_realtime.TranslatedString.Translation
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Translation.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (!$util.isString(message.text))
                    return "text: string expected";
                if (message.language != null && $Object.hasOwnProperty.call(message, "language"))
                    if (!$util.isString(message.language))
                        return "language: string expected";
                return null;
            };

            /**
             * Creates a Translation message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof transit_realtime.TranslatedString.Translation
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {transit_realtime.TranslatedString.Translation} Translation
             */
            Translation.fromObject = function (object, _depth) {
                if (object instanceof $root.transit_realtime.TranslatedString.Translation)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".transit_realtime.TranslatedString.Translation: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.transit_realtime.TranslatedString.Translation();
                if (object.text != null)
                    message.text = $String(object.text);
                if (object.language != null)
                    message.language = $String(object.language);
                return message;
            };

            /**
             * Creates a plain object from a Translation message. Also converts values to other types if specified.
             * @function toObject
             * @memberof transit_realtime.TranslatedString.Translation
             * @static
             * @param {transit_realtime.TranslatedString.Translation} message Translation
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Translation.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.text = "";
                    object.language = "";
                }
                if (message.text != null && $Object.hasOwnProperty.call(message, "text"))
                    object.text = message.text;
                if (message.language != null && $Object.hasOwnProperty.call(message, "language"))
                    object.language = message.language;
                return object;
            };

            /**
             * Converts this Translation to JSON.
             * @function toJSON
             * @memberof transit_realtime.TranslatedString.Translation
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Translation.prototype.toJSON = function() {
                return Translation.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Translation
             * @function getTypeUrl
             * @memberof transit_realtime.TranslatedString.Translation
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Translation.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/transit_realtime.TranslatedString.Translation";
            };

            return Translation;
        })();

        return TranslatedString;
    })();

    transit_realtime.TranslatedImage = (function() {

        /**
         * Properties of a TranslatedImage.
         * @typedef {Object} transit_realtime.TranslatedImage.$Properties
         * @property {Array.<transit_realtime.TranslatedImage.LocalizedImage.$Properties>|null} [localizedImage] TranslatedImage localizedImage
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a TranslatedImage.
         * @memberof transit_realtime
         * @interface ITranslatedImage
         * @augments transit_realtime.TranslatedImage.$Properties
         * @deprecated Use transit_realtime.TranslatedImage.$Properties instead.
         */

        /**
         * Shape of a TranslatedImage.
         * @typedef {transit_realtime.TranslatedImage.$Properties} transit_realtime.TranslatedImage.$Shape
         */

        /**
         * Constructs a new TranslatedImage.
         * @memberof transit_realtime
         * @classdesc Represents a TranslatedImage.
         * @constructor
         * @param {transit_realtime.TranslatedImage.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const TranslatedImage = function (properties) {
            this.localizedImage = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * TranslatedImage localizedImage.
         * @member {Array.<transit_realtime.TranslatedImage.LocalizedImage.$Properties>} localizedImage
         * @memberof transit_realtime.TranslatedImage
         * @instance
         */
        TranslatedImage.prototype.localizedImage = $util.emptyArray;

        /**
         * Creates a new TranslatedImage instance using the specified properties.
         * @function create
         * @memberof transit_realtime.TranslatedImage
         * @static
         * @param {transit_realtime.TranslatedImage.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.TranslatedImage} TranslatedImage instance
         * @type {{
         *   (properties: transit_realtime.TranslatedImage.$Shape): transit_realtime.TranslatedImage & transit_realtime.TranslatedImage.$Shape;
         *   (properties?: transit_realtime.TranslatedImage.$Properties): transit_realtime.TranslatedImage;
         * }}
         */
        TranslatedImage.create = function(properties) {
            return new TranslatedImage(properties);
        };

        /**
         * Encodes the specified TranslatedImage message. Does not implicitly {@link transit_realtime.TranslatedImage.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.TranslatedImage
         * @static
         * @param {transit_realtime.TranslatedImage.$Properties} message TranslatedImage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TranslatedImage.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.localizedImage != null && message.localizedImage.length)
                for (let i = 0; i < message.localizedImage.length; ++i)
                    $root.transit_realtime.TranslatedImage.LocalizedImage.encode(message.localizedImage[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified TranslatedImage message, length delimited. Does not implicitly {@link transit_realtime.TranslatedImage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.TranslatedImage
         * @static
         * @param {transit_realtime.TranslatedImage.$Properties} message TranslatedImage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TranslatedImage.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a TranslatedImage message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.TranslatedImage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.TranslatedImage & transit_realtime.TranslatedImage.$Shape} TranslatedImage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TranslatedImage.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.TranslatedImage();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (!(message.localizedImage && message.localizedImage.length))
                            message.localizedImage = [];
                        message.localizedImage.push($root.transit_realtime.TranslatedImage.LocalizedImage.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a TranslatedImage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.TranslatedImage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.TranslatedImage & transit_realtime.TranslatedImage.$Shape} TranslatedImage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TranslatedImage.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TranslatedImage message.
         * @function verify
         * @memberof transit_realtime.TranslatedImage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TranslatedImage.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.localizedImage != null && $Object.hasOwnProperty.call(message, "localizedImage")) {
                if (!$Array.isArray(message.localizedImage))
                    return "localizedImage: array expected";
                for (let i = 0; i < message.localizedImage.length; ++i) {
                    let error = $root.transit_realtime.TranslatedImage.LocalizedImage.verify(message.localizedImage[i], _depth + 1);
                    if (error)
                        return "localizedImage." + error;
                }
            }
            return null;
        };

        /**
         * Creates a TranslatedImage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.TranslatedImage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.TranslatedImage} TranslatedImage
         */
        TranslatedImage.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.TranslatedImage)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.TranslatedImage: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.TranslatedImage();
            if (object.localizedImage) {
                if (!$Array.isArray(object.localizedImage))
                    throw $TypeError(".transit_realtime.TranslatedImage.localizedImage: array expected");
                message.localizedImage = $Array(object.localizedImage.length);
                for (let i = 0; i < object.localizedImage.length; ++i) {
                    if (!$util.isObject(object.localizedImage[i]))
                        throw $TypeError(".transit_realtime.TranslatedImage.localizedImage: object expected");
                    message.localizedImage[i] = $root.transit_realtime.TranslatedImage.LocalizedImage.fromObject(object.localizedImage[i], _depth + 1);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a TranslatedImage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.TranslatedImage
         * @static
         * @param {transit_realtime.TranslatedImage} message TranslatedImage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TranslatedImage.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults)
                object.localizedImage = [];
            if (message.localizedImage && message.localizedImage.length) {
                object.localizedImage = $Array(message.localizedImage.length);
                for (let j = 0; j < message.localizedImage.length; ++j)
                    object.localizedImage[j] = $root.transit_realtime.TranslatedImage.LocalizedImage.toObject(message.localizedImage[j], options, _depth + 1);
            }
            return object;
        };

        /**
         * Converts this TranslatedImage to JSON.
         * @function toJSON
         * @memberof transit_realtime.TranslatedImage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TranslatedImage.prototype.toJSON = function() {
            return TranslatedImage.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for TranslatedImage
         * @function getTypeUrl
         * @memberof transit_realtime.TranslatedImage
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TranslatedImage.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.TranslatedImage";
        };

        TranslatedImage.LocalizedImage = (function() {

            /**
             * Properties of a LocalizedImage.
             * @typedef {Object} transit_realtime.TranslatedImage.LocalizedImage.$Properties
             * @property {string} url LocalizedImage url
             * @property {string} mediaType LocalizedImage mediaType
             * @property {string|null} [language] LocalizedImage language
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a LocalizedImage.
             * @memberof transit_realtime.TranslatedImage
             * @interface ILocalizedImage
             * @augments transit_realtime.TranslatedImage.LocalizedImage.$Properties
             * @deprecated Use transit_realtime.TranslatedImage.LocalizedImage.$Properties instead.
             */

            /**
             * Shape of a LocalizedImage.
             * @typedef {transit_realtime.TranslatedImage.LocalizedImage.$Properties} transit_realtime.TranslatedImage.LocalizedImage.$Shape
             */

            /**
             * Constructs a new LocalizedImage.
             * @memberof transit_realtime.TranslatedImage
             * @classdesc Represents a LocalizedImage.
             * @constructor
             * @param {transit_realtime.TranslatedImage.LocalizedImage.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const LocalizedImage = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * LocalizedImage url.
             * @member {string} url
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @instance
             */
            LocalizedImage.prototype.url = "";

            /**
             * LocalizedImage mediaType.
             * @member {string} mediaType
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @instance
             */
            LocalizedImage.prototype.mediaType = "";

            /**
             * LocalizedImage language.
             * @member {string} language
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @instance
             */
            LocalizedImage.prototype.language = "";

            /**
             * Creates a new LocalizedImage instance using the specified properties.
             * @function create
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @static
             * @param {transit_realtime.TranslatedImage.LocalizedImage.$Properties=} [properties] Properties to set
             * @returns {transit_realtime.TranslatedImage.LocalizedImage} LocalizedImage instance
             * @type {{
             *   (properties: transit_realtime.TranslatedImage.LocalizedImage.$Shape): transit_realtime.TranslatedImage.LocalizedImage & transit_realtime.TranslatedImage.LocalizedImage.$Shape;
             *   (properties?: transit_realtime.TranslatedImage.LocalizedImage.$Properties): transit_realtime.TranslatedImage.LocalizedImage;
             * }}
             */
            LocalizedImage.create = function(properties) {
                return new LocalizedImage(properties);
            };

            /**
             * Encodes the specified LocalizedImage message. Does not implicitly {@link transit_realtime.TranslatedImage.LocalizedImage.verify|verify} messages.
             * @function encode
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @static
             * @param {transit_realtime.TranslatedImage.LocalizedImage.$Properties} message LocalizedImage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            LocalizedImage.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.url);
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.mediaType);
                if (message.language != null && $Object.hasOwnProperty.call(message, "language"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.language);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified LocalizedImage message, length delimited. Does not implicitly {@link transit_realtime.TranslatedImage.LocalizedImage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @static
             * @param {transit_realtime.TranslatedImage.LocalizedImage.$Properties} message LocalizedImage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            LocalizedImage.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a LocalizedImage message from the specified reader or buffer.
             * @function decode
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {transit_realtime.TranslatedImage.LocalizedImage & transit_realtime.TranslatedImage.LocalizedImage.$Shape} LocalizedImage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            LocalizedImage.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.transit_realtime.TranslatedImage.LocalizedImage();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.url = reader.string();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.mediaType = reader.string();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.language = reader.string();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                if (!$Object.hasOwnProperty.call(message, "url"))
                    throw $util.ProtocolError("missing required 'url'", { instance: message });
                if (!$Object.hasOwnProperty.call(message, "mediaType"))
                    throw $util.ProtocolError("missing required 'mediaType'", { instance: message });
                return message;
            };

            /**
             * Decodes a LocalizedImage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {transit_realtime.TranslatedImage.LocalizedImage & transit_realtime.TranslatedImage.LocalizedImage.$Shape} LocalizedImage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            LocalizedImage.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a LocalizedImage message.
             * @function verify
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            LocalizedImage.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (!$util.isString(message.url))
                    return "url: string expected";
                if (!$util.isString(message.mediaType))
                    return "mediaType: string expected";
                if (message.language != null && $Object.hasOwnProperty.call(message, "language"))
                    if (!$util.isString(message.language))
                        return "language: string expected";
                return null;
            };

            /**
             * Creates a LocalizedImage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {transit_realtime.TranslatedImage.LocalizedImage} LocalizedImage
             */
            LocalizedImage.fromObject = function (object, _depth) {
                if (object instanceof $root.transit_realtime.TranslatedImage.LocalizedImage)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".transit_realtime.TranslatedImage.LocalizedImage: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.transit_realtime.TranslatedImage.LocalizedImage();
                if (object.url != null)
                    message.url = $String(object.url);
                if (object.mediaType != null)
                    message.mediaType = $String(object.mediaType);
                if (object.language != null)
                    message.language = $String(object.language);
                return message;
            };

            /**
             * Creates a plain object from a LocalizedImage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @static
             * @param {transit_realtime.TranslatedImage.LocalizedImage} message LocalizedImage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            LocalizedImage.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.url = "";
                    object.mediaType = "";
                    object.language = "";
                }
                if (message.url != null && $Object.hasOwnProperty.call(message, "url"))
                    object.url = message.url;
                if (message.mediaType != null && $Object.hasOwnProperty.call(message, "mediaType"))
                    object.mediaType = message.mediaType;
                if (message.language != null && $Object.hasOwnProperty.call(message, "language"))
                    object.language = message.language;
                return object;
            };

            /**
             * Converts this LocalizedImage to JSON.
             * @function toJSON
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            LocalizedImage.prototype.toJSON = function() {
                return LocalizedImage.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for LocalizedImage
             * @function getTypeUrl
             * @memberof transit_realtime.TranslatedImage.LocalizedImage
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            LocalizedImage.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/transit_realtime.TranslatedImage.LocalizedImage";
            };

            return LocalizedImage;
        })();

        return TranslatedImage;
    })();

    transit_realtime.Shape = (function() {

        /**
         * Properties of a Shape.
         * @typedef {Object} transit_realtime.Shape.$Properties
         * @property {string|null} [shapeId] Shape shapeId
         * @property {string|null} [encodedPolyline] Shape encodedPolyline
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Shape.
         * @memberof transit_realtime
         * @interface IShape
         * @augments transit_realtime.Shape.$Properties
         * @deprecated Use transit_realtime.Shape.$Properties instead.
         */

        /**
         * Shape of a Shape.
         * @typedef {transit_realtime.Shape.$Properties} transit_realtime.Shape.$Shape
         */

        /**
         * Constructs a new Shape.
         * @memberof transit_realtime
         * @classdesc Represents a Shape.
         * @constructor
         * @param {transit_realtime.Shape.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Shape = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Shape shapeId.
         * @member {string} shapeId
         * @memberof transit_realtime.Shape
         * @instance
         */
        Shape.prototype.shapeId = "";

        /**
         * Shape encodedPolyline.
         * @member {string} encodedPolyline
         * @memberof transit_realtime.Shape
         * @instance
         */
        Shape.prototype.encodedPolyline = "";

        /**
         * Creates a new Shape instance using the specified properties.
         * @function create
         * @memberof transit_realtime.Shape
         * @static
         * @param {transit_realtime.Shape.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.Shape} Shape instance
         * @type {{
         *   (properties: transit_realtime.Shape.$Shape): transit_realtime.Shape & transit_realtime.Shape.$Shape;
         *   (properties?: transit_realtime.Shape.$Properties): transit_realtime.Shape;
         * }}
         */
        Shape.create = function(properties) {
            return new Shape(properties);
        };

        /**
         * Encodes the specified Shape message. Does not implicitly {@link transit_realtime.Shape.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.Shape
         * @static
         * @param {transit_realtime.Shape.$Properties} message Shape message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Shape.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.shapeId != null && $Object.hasOwnProperty.call(message, "shapeId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.shapeId);
            if (message.encodedPolyline != null && $Object.hasOwnProperty.call(message, "encodedPolyline"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.encodedPolyline);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified Shape message, length delimited. Does not implicitly {@link transit_realtime.Shape.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.Shape
         * @static
         * @param {transit_realtime.Shape.$Properties} message Shape message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Shape.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a Shape message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.Shape
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.Shape & transit_realtime.Shape.$Shape} Shape
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Shape.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.Shape();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.shapeId = reader.string();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.encodedPolyline = reader.string();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a Shape message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.Shape
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.Shape & transit_realtime.Shape.$Shape} Shape
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Shape.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Shape message.
         * @function verify
         * @memberof transit_realtime.Shape
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Shape.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.shapeId != null && $Object.hasOwnProperty.call(message, "shapeId"))
                if (!$util.isString(message.shapeId))
                    return "shapeId: string expected";
            if (message.encodedPolyline != null && $Object.hasOwnProperty.call(message, "encodedPolyline"))
                if (!$util.isString(message.encodedPolyline))
                    return "encodedPolyline: string expected";
            return null;
        };

        /**
         * Creates a Shape message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.Shape
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.Shape} Shape
         */
        Shape.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.Shape)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.Shape: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.Shape();
            if (object.shapeId != null)
                message.shapeId = $String(object.shapeId);
            if (object.encodedPolyline != null)
                message.encodedPolyline = $String(object.encodedPolyline);
            return message;
        };

        /**
         * Creates a plain object from a Shape message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.Shape
         * @static
         * @param {transit_realtime.Shape} message Shape
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Shape.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.shapeId = "";
                object.encodedPolyline = "";
            }
            if (message.shapeId != null && $Object.hasOwnProperty.call(message, "shapeId"))
                object.shapeId = message.shapeId;
            if (message.encodedPolyline != null && $Object.hasOwnProperty.call(message, "encodedPolyline"))
                object.encodedPolyline = message.encodedPolyline;
            return object;
        };

        /**
         * Converts this Shape to JSON.
         * @function toJSON
         * @memberof transit_realtime.Shape
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Shape.prototype.toJSON = function() {
            return Shape.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for Shape
         * @function getTypeUrl
         * @memberof transit_realtime.Shape
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Shape.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.Shape";
        };

        return Shape;
    })();

    transit_realtime.Stop = (function() {

        /**
         * Properties of a Stop.
         * @typedef {Object} transit_realtime.Stop.$Properties
         * @property {string|null} [stopId] Stop stopId
         * @property {transit_realtime.TranslatedString.$Properties|null} [stopCode] Stop stopCode
         * @property {transit_realtime.TranslatedString.$Properties|null} [stopName] Stop stopName
         * @property {transit_realtime.TranslatedString.$Properties|null} [ttsStopName] Stop ttsStopName
         * @property {transit_realtime.TranslatedString.$Properties|null} [stopDesc] Stop stopDesc
         * @property {number|null} [stopLat] Stop stopLat
         * @property {number|null} [stopLon] Stop stopLon
         * @property {string|null} [zoneId] Stop zoneId
         * @property {transit_realtime.TranslatedString.$Properties|null} [stopUrl] Stop stopUrl
         * @property {string|null} [parentStation] Stop parentStation
         * @property {string|null} [stopTimezone] Stop stopTimezone
         * @property {transit_realtime.Stop.WheelchairBoarding|null} [wheelchairBoarding] Stop wheelchairBoarding
         * @property {string|null} [levelId] Stop levelId
         * @property {transit_realtime.TranslatedString.$Properties|null} [platformCode] Stop platformCode
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Stop.
         * @memberof transit_realtime
         * @interface IStop
         * @augments transit_realtime.Stop.$Properties
         * @deprecated Use transit_realtime.Stop.$Properties instead.
         */

        /**
         * Shape of a Stop.
         * @typedef {transit_realtime.Stop.$Properties} transit_realtime.Stop.$Shape
         */

        /**
         * Constructs a new Stop.
         * @memberof transit_realtime
         * @classdesc Represents a Stop.
         * @constructor
         * @param {transit_realtime.Stop.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Stop = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Stop stopId.
         * @member {string} stopId
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.stopId = "";

        /**
         * Stop stopCode.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} stopCode
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.stopCode = null;

        /**
         * Stop stopName.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} stopName
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.stopName = null;

        /**
         * Stop ttsStopName.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} ttsStopName
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.ttsStopName = null;

        /**
         * Stop stopDesc.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} stopDesc
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.stopDesc = null;

        /**
         * Stop stopLat.
         * @member {number} stopLat
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.stopLat = 0;

        /**
         * Stop stopLon.
         * @member {number} stopLon
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.stopLon = 0;

        /**
         * Stop zoneId.
         * @member {string} zoneId
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.zoneId = "";

        /**
         * Stop stopUrl.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} stopUrl
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.stopUrl = null;

        /**
         * Stop parentStation.
         * @member {string} parentStation
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.parentStation = "";

        /**
         * Stop stopTimezone.
         * @member {string} stopTimezone
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.stopTimezone = "";

        /**
         * Stop wheelchairBoarding.
         * @member {transit_realtime.Stop.WheelchairBoarding} wheelchairBoarding
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.wheelchairBoarding = 0;

        /**
         * Stop levelId.
         * @member {string} levelId
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.levelId = "";

        /**
         * Stop platformCode.
         * @member {transit_realtime.TranslatedString.$Properties|null|undefined} platformCode
         * @memberof transit_realtime.Stop
         * @instance
         */
        Stop.prototype.platformCode = null;

        /**
         * Creates a new Stop instance using the specified properties.
         * @function create
         * @memberof transit_realtime.Stop
         * @static
         * @param {transit_realtime.Stop.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.Stop} Stop instance
         * @type {{
         *   (properties: transit_realtime.Stop.$Shape): transit_realtime.Stop & transit_realtime.Stop.$Shape;
         *   (properties?: transit_realtime.Stop.$Properties): transit_realtime.Stop;
         * }}
         */
        Stop.create = function(properties) {
            return new Stop(properties);
        };

        /**
         * Encodes the specified Stop message. Does not implicitly {@link transit_realtime.Stop.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.Stop
         * @static
         * @param {transit_realtime.Stop.$Properties} message Stop message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Stop.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.stopId);
            if (message.stopCode != null && $Object.hasOwnProperty.call(message, "stopCode"))
                $root.transit_realtime.TranslatedString.encode(message.stopCode, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
            if (message.stopName != null && $Object.hasOwnProperty.call(message, "stopName"))
                $root.transit_realtime.TranslatedString.encode(message.stopName, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
            if (message.ttsStopName != null && $Object.hasOwnProperty.call(message, "ttsStopName"))
                $root.transit_realtime.TranslatedString.encode(message.ttsStopName, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
            if (message.stopDesc != null && $Object.hasOwnProperty.call(message, "stopDesc"))
                $root.transit_realtime.TranslatedString.encode(message.stopDesc, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
            if (message.stopLat != null && $Object.hasOwnProperty.call(message, "stopLat"))
                writer.uint32(/* id 6, wireType 5 =*/53).float(message.stopLat);
            if (message.stopLon != null && $Object.hasOwnProperty.call(message, "stopLon"))
                writer.uint32(/* id 7, wireType 5 =*/61).float(message.stopLon);
            if (message.zoneId != null && $Object.hasOwnProperty.call(message, "zoneId"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.zoneId);
            if (message.stopUrl != null && $Object.hasOwnProperty.call(message, "stopUrl"))
                $root.transit_realtime.TranslatedString.encode(message.stopUrl, writer.uint32(/* id 9, wireType 2 =*/74).fork(), _depth + 1).ldelim();
            if (message.parentStation != null && $Object.hasOwnProperty.call(message, "parentStation"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.parentStation);
            if (message.stopTimezone != null && $Object.hasOwnProperty.call(message, "stopTimezone"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.stopTimezone);
            if (message.wheelchairBoarding != null && $Object.hasOwnProperty.call(message, "wheelchairBoarding"))
                writer.uint32(/* id 13, wireType 0 =*/104).int32(message.wheelchairBoarding);
            if (message.levelId != null && $Object.hasOwnProperty.call(message, "levelId"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.levelId);
            if (message.platformCode != null && $Object.hasOwnProperty.call(message, "platformCode"))
                $root.transit_realtime.TranslatedString.encode(message.platformCode, writer.uint32(/* id 15, wireType 2 =*/122).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified Stop message, length delimited. Does not implicitly {@link transit_realtime.Stop.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.Stop
         * @static
         * @param {transit_realtime.Stop.$Properties} message Stop message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Stop.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a Stop message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.Stop
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.Stop & transit_realtime.Stop.$Shape} Stop
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Stop.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message, value;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.Stop();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.stopId = reader.string();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.stopCode = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.stopCode);
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.stopName = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.stopName);
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.ttsStopName = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.ttsStopName);
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        message.stopDesc = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.stopDesc);
                        continue;
                    }
                case 6: {
                        if (wireType !== 5)
                            break;
                        message.stopLat = reader.float();
                        continue;
                    }
                case 7: {
                        if (wireType !== 5)
                            break;
                        message.stopLon = reader.float();
                        continue;
                    }
                case 8: {
                        if (wireType !== 2)
                            break;
                        message.zoneId = reader.string();
                        continue;
                    }
                case 9: {
                        if (wireType !== 2)
                            break;
                        message.stopUrl = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.stopUrl);
                        continue;
                    }
                case 11: {
                        if (wireType !== 2)
                            break;
                        message.parentStation = reader.string();
                        continue;
                    }
                case 12: {
                        if (wireType !== 2)
                            break;
                        message.stopTimezone = reader.string();
                        continue;
                    }
                case 13: {
                        if (wireType !== 0)
                            break;
                        value = reader.int32();
                        if ($root.transit_realtime.Stop.WheelchairBoarding[value] !== $undefined)
                            message.wheelchairBoarding = value;
                        else if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                        continue;
                    }
                case 14: {
                        if (wireType !== 2)
                            break;
                        message.levelId = reader.string();
                        continue;
                    }
                case 15: {
                        if (wireType !== 2)
                            break;
                        message.platformCode = $root.transit_realtime.TranslatedString.decode(reader, reader.uint32(), $undefined, _depth + 1, message.platformCode);
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a Stop message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.Stop
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.Stop & transit_realtime.Stop.$Shape} Stop
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Stop.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Stop message.
         * @function verify
         * @memberof transit_realtime.Stop
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Stop.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                if (!$util.isString(message.stopId))
                    return "stopId: string expected";
            if (message.stopCode != null && $Object.hasOwnProperty.call(message, "stopCode")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.stopCode, _depth + 1);
                if (error)
                    return "stopCode." + error;
            }
            if (message.stopName != null && $Object.hasOwnProperty.call(message, "stopName")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.stopName, _depth + 1);
                if (error)
                    return "stopName." + error;
            }
            if (message.ttsStopName != null && $Object.hasOwnProperty.call(message, "ttsStopName")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.ttsStopName, _depth + 1);
                if (error)
                    return "ttsStopName." + error;
            }
            if (message.stopDesc != null && $Object.hasOwnProperty.call(message, "stopDesc")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.stopDesc, _depth + 1);
                if (error)
                    return "stopDesc." + error;
            }
            if (message.stopLat != null && $Object.hasOwnProperty.call(message, "stopLat"))
                if (typeof message.stopLat !== "number")
                    return "stopLat: number expected";
            if (message.stopLon != null && $Object.hasOwnProperty.call(message, "stopLon"))
                if (typeof message.stopLon !== "number")
                    return "stopLon: number expected";
            if (message.zoneId != null && $Object.hasOwnProperty.call(message, "zoneId"))
                if (!$util.isString(message.zoneId))
                    return "zoneId: string expected";
            if (message.stopUrl != null && $Object.hasOwnProperty.call(message, "stopUrl")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.stopUrl, _depth + 1);
                if (error)
                    return "stopUrl." + error;
            }
            if (message.parentStation != null && $Object.hasOwnProperty.call(message, "parentStation"))
                if (!$util.isString(message.parentStation))
                    return "parentStation: string expected";
            if (message.stopTimezone != null && $Object.hasOwnProperty.call(message, "stopTimezone"))
                if (!$util.isString(message.stopTimezone))
                    return "stopTimezone: string expected";
            if (message.wheelchairBoarding != null && $Object.hasOwnProperty.call(message, "wheelchairBoarding"))
                switch (message.wheelchairBoarding) {
                default:
                    return "wheelchairBoarding: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.levelId != null && $Object.hasOwnProperty.call(message, "levelId"))
                if (!$util.isString(message.levelId))
                    return "levelId: string expected";
            if (message.platformCode != null && $Object.hasOwnProperty.call(message, "platformCode")) {
                let error = $root.transit_realtime.TranslatedString.verify(message.platformCode, _depth + 1);
                if (error)
                    return "platformCode." + error;
            }
            return null;
        };

        /**
         * Creates a Stop message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.Stop
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.Stop} Stop
         */
        Stop.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.Stop)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.Stop: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.Stop();
            if (object.stopId != null)
                message.stopId = $String(object.stopId);
            if (object.stopCode != null) {
                if (!$util.isObject(object.stopCode))
                    throw $TypeError(".transit_realtime.Stop.stopCode: object expected");
                message.stopCode = $root.transit_realtime.TranslatedString.fromObject(object.stopCode, _depth + 1);
            }
            if (object.stopName != null) {
                if (!$util.isObject(object.stopName))
                    throw $TypeError(".transit_realtime.Stop.stopName: object expected");
                message.stopName = $root.transit_realtime.TranslatedString.fromObject(object.stopName, _depth + 1);
            }
            if (object.ttsStopName != null) {
                if (!$util.isObject(object.ttsStopName))
                    throw $TypeError(".transit_realtime.Stop.ttsStopName: object expected");
                message.ttsStopName = $root.transit_realtime.TranslatedString.fromObject(object.ttsStopName, _depth + 1);
            }
            if (object.stopDesc != null) {
                if (!$util.isObject(object.stopDesc))
                    throw $TypeError(".transit_realtime.Stop.stopDesc: object expected");
                message.stopDesc = $root.transit_realtime.TranslatedString.fromObject(object.stopDesc, _depth + 1);
            }
            if (object.stopLat != null)
                message.stopLat = $Number(object.stopLat);
            if (object.stopLon != null)
                message.stopLon = $Number(object.stopLon);
            if (object.zoneId != null)
                message.zoneId = $String(object.zoneId);
            if (object.stopUrl != null) {
                if (!$util.isObject(object.stopUrl))
                    throw $TypeError(".transit_realtime.Stop.stopUrl: object expected");
                message.stopUrl = $root.transit_realtime.TranslatedString.fromObject(object.stopUrl, _depth + 1);
            }
            if (object.parentStation != null)
                message.parentStation = $String(object.parentStation);
            if (object.stopTimezone != null)
                message.stopTimezone = $String(object.stopTimezone);
            switch (object.wheelchairBoarding) {
            case "UNKNOWN":
            case 0:
                message.wheelchairBoarding = 0;
                break;
            case "AVAILABLE":
            case 1:
                message.wheelchairBoarding = 1;
                break;
            case "NOT_AVAILABLE":
            case 2:
                message.wheelchairBoarding = 2;
                break;
            default:
            }
            if (object.levelId != null)
                message.levelId = $String(object.levelId);
            if (object.platformCode != null) {
                if (!$util.isObject(object.platformCode))
                    throw $TypeError(".transit_realtime.Stop.platformCode: object expected");
                message.platformCode = $root.transit_realtime.TranslatedString.fromObject(object.platformCode, _depth + 1);
            }
            return message;
        };

        /**
         * Creates a plain object from a Stop message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.Stop
         * @static
         * @param {transit_realtime.Stop} message Stop
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Stop.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.stopId = "";
                object.stopCode = null;
                object.stopName = null;
                object.ttsStopName = null;
                object.stopDesc = null;
                object.stopLat = 0;
                object.stopLon = 0;
                object.zoneId = "";
                object.stopUrl = null;
                object.parentStation = "";
                object.stopTimezone = "";
                object.wheelchairBoarding = options.enums === $String ? "UNKNOWN" : 0;
                object.levelId = "";
                object.platformCode = null;
            }
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                object.stopId = message.stopId;
            if (message.stopCode != null && $Object.hasOwnProperty.call(message, "stopCode"))
                object.stopCode = $root.transit_realtime.TranslatedString.toObject(message.stopCode, options, _depth + 1);
            if (message.stopName != null && $Object.hasOwnProperty.call(message, "stopName"))
                object.stopName = $root.transit_realtime.TranslatedString.toObject(message.stopName, options, _depth + 1);
            if (message.ttsStopName != null && $Object.hasOwnProperty.call(message, "ttsStopName"))
                object.ttsStopName = $root.transit_realtime.TranslatedString.toObject(message.ttsStopName, options, _depth + 1);
            if (message.stopDesc != null && $Object.hasOwnProperty.call(message, "stopDesc"))
                object.stopDesc = $root.transit_realtime.TranslatedString.toObject(message.stopDesc, options, _depth + 1);
            if (message.stopLat != null && $Object.hasOwnProperty.call(message, "stopLat"))
                object.stopLat = options.json && !$isFinite(message.stopLat) ? $String(message.stopLat) : message.stopLat;
            if (message.stopLon != null && $Object.hasOwnProperty.call(message, "stopLon"))
                object.stopLon = options.json && !$isFinite(message.stopLon) ? $String(message.stopLon) : message.stopLon;
            if (message.zoneId != null && $Object.hasOwnProperty.call(message, "zoneId"))
                object.zoneId = message.zoneId;
            if (message.stopUrl != null && $Object.hasOwnProperty.call(message, "stopUrl"))
                object.stopUrl = $root.transit_realtime.TranslatedString.toObject(message.stopUrl, options, _depth + 1);
            if (message.parentStation != null && $Object.hasOwnProperty.call(message, "parentStation"))
                object.parentStation = message.parentStation;
            if (message.stopTimezone != null && $Object.hasOwnProperty.call(message, "stopTimezone"))
                object.stopTimezone = message.stopTimezone;
            if (message.wheelchairBoarding != null && $Object.hasOwnProperty.call(message, "wheelchairBoarding"))
                object.wheelchairBoarding = options.enums === $String ? $root.transit_realtime.Stop.WheelchairBoarding[message.wheelchairBoarding] === $undefined ? message.wheelchairBoarding : $root.transit_realtime.Stop.WheelchairBoarding[message.wheelchairBoarding] : message.wheelchairBoarding;
            if (message.levelId != null && $Object.hasOwnProperty.call(message, "levelId"))
                object.levelId = message.levelId;
            if (message.platformCode != null && $Object.hasOwnProperty.call(message, "platformCode"))
                object.platformCode = $root.transit_realtime.TranslatedString.toObject(message.platformCode, options, _depth + 1);
            return object;
        };

        /**
         * Converts this Stop to JSON.
         * @function toJSON
         * @memberof transit_realtime.Stop
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Stop.prototype.toJSON = function() {
            return Stop.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for Stop
         * @function getTypeUrl
         * @memberof transit_realtime.Stop
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Stop.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.Stop";
        };

        /**
         * WheelchairBoarding enum.
         * @name transit_realtime.Stop.WheelchairBoarding
         * @enum {number}
         * @property {number} UNKNOWN=0 UNKNOWN value
         * @property {number} AVAILABLE=1 AVAILABLE value
         * @property {number} NOT_AVAILABLE=2 NOT_AVAILABLE value
         */
        Stop.WheelchairBoarding = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "UNKNOWN"] = 0;
            values[valuesById[1] = "AVAILABLE"] = 1;
            values[valuesById[2] = "NOT_AVAILABLE"] = 2;
            return values;
        })();

        return Stop;
    })();

    transit_realtime.TripModifications = (function() {

        /**
         * Properties of a TripModifications.
         * @typedef {Object} transit_realtime.TripModifications.$Properties
         * @property {Array.<transit_realtime.TripModifications.SelectedTrips.$Properties>|null} [selectedTrips] TripModifications selectedTrips
         * @property {Array.<string>|null} [startTimes] TripModifications startTimes
         * @property {Array.<string>|null} [serviceDates] TripModifications serviceDates
         * @property {Array.<transit_realtime.TripModifications.Modification.$Properties>|null} [modifications] TripModifications modifications
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a TripModifications.
         * @memberof transit_realtime
         * @interface ITripModifications
         * @augments transit_realtime.TripModifications.$Properties
         * @deprecated Use transit_realtime.TripModifications.$Properties instead.
         */

        /**
         * Shape of a TripModifications.
         * @typedef {transit_realtime.TripModifications.$Properties} transit_realtime.TripModifications.$Shape
         */

        /**
         * Constructs a new TripModifications.
         * @memberof transit_realtime
         * @classdesc Represents a TripModifications.
         * @constructor
         * @param {transit_realtime.TripModifications.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const TripModifications = function (properties) {
            this.selectedTrips = [];
            this.startTimes = [];
            this.serviceDates = [];
            this.modifications = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * TripModifications selectedTrips.
         * @member {Array.<transit_realtime.TripModifications.SelectedTrips.$Properties>} selectedTrips
         * @memberof transit_realtime.TripModifications
         * @instance
         */
        TripModifications.prototype.selectedTrips = $util.emptyArray;

        /**
         * TripModifications startTimes.
         * @member {Array.<string>} startTimes
         * @memberof transit_realtime.TripModifications
         * @instance
         */
        TripModifications.prototype.startTimes = $util.emptyArray;

        /**
         * TripModifications serviceDates.
         * @member {Array.<string>} serviceDates
         * @memberof transit_realtime.TripModifications
         * @instance
         */
        TripModifications.prototype.serviceDates = $util.emptyArray;

        /**
         * TripModifications modifications.
         * @member {Array.<transit_realtime.TripModifications.Modification.$Properties>} modifications
         * @memberof transit_realtime.TripModifications
         * @instance
         */
        TripModifications.prototype.modifications = $util.emptyArray;

        /**
         * Creates a new TripModifications instance using the specified properties.
         * @function create
         * @memberof transit_realtime.TripModifications
         * @static
         * @param {transit_realtime.TripModifications.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.TripModifications} TripModifications instance
         * @type {{
         *   (properties: transit_realtime.TripModifications.$Shape): transit_realtime.TripModifications & transit_realtime.TripModifications.$Shape;
         *   (properties?: transit_realtime.TripModifications.$Properties): transit_realtime.TripModifications;
         * }}
         */
        TripModifications.create = function(properties) {
            return new TripModifications(properties);
        };

        /**
         * Encodes the specified TripModifications message. Does not implicitly {@link transit_realtime.TripModifications.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.TripModifications
         * @static
         * @param {transit_realtime.TripModifications.$Properties} message TripModifications message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TripModifications.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.selectedTrips != null && message.selectedTrips.length)
                for (let i = 0; i < message.selectedTrips.length; ++i)
                    $root.transit_realtime.TripModifications.SelectedTrips.encode(message.selectedTrips[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.startTimes != null && message.startTimes.length)
                for (let i = 0; i < message.startTimes.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.startTimes[i]);
            if (message.serviceDates != null && message.serviceDates.length)
                for (let i = 0; i < message.serviceDates.length; ++i)
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.serviceDates[i]);
            if (message.modifications != null && message.modifications.length)
                for (let i = 0; i < message.modifications.length; ++i)
                    $root.transit_realtime.TripModifications.Modification.encode(message.modifications[i], writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified TripModifications message, length delimited. Does not implicitly {@link transit_realtime.TripModifications.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.TripModifications
         * @static
         * @param {transit_realtime.TripModifications.$Properties} message TripModifications message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TripModifications.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a TripModifications message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.TripModifications
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.TripModifications & transit_realtime.TripModifications.$Shape} TripModifications
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TripModifications.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.TripModifications();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (!(message.selectedTrips && message.selectedTrips.length))
                            message.selectedTrips = [];
                        message.selectedTrips.push($root.transit_realtime.TripModifications.SelectedTrips.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if (!(message.startTimes && message.startTimes.length))
                            message.startTimes = [];
                        message.startTimes.push(reader.string());
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        if (!(message.serviceDates && message.serviceDates.length))
                            message.serviceDates = [];
                        message.serviceDates.push(reader.string());
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        if (!(message.modifications && message.modifications.length))
                            message.modifications = [];
                        message.modifications.push($root.transit_realtime.TripModifications.Modification.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a TripModifications message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.TripModifications
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.TripModifications & transit_realtime.TripModifications.$Shape} TripModifications
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TripModifications.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TripModifications message.
         * @function verify
         * @memberof transit_realtime.TripModifications
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TripModifications.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.selectedTrips != null && $Object.hasOwnProperty.call(message, "selectedTrips")) {
                if (!$Array.isArray(message.selectedTrips))
                    return "selectedTrips: array expected";
                for (let i = 0; i < message.selectedTrips.length; ++i) {
                    let error = $root.transit_realtime.TripModifications.SelectedTrips.verify(message.selectedTrips[i], _depth + 1);
                    if (error)
                        return "selectedTrips." + error;
                }
            }
            if (message.startTimes != null && $Object.hasOwnProperty.call(message, "startTimes")) {
                if (!$Array.isArray(message.startTimes))
                    return "startTimes: array expected";
                for (let i = 0; i < message.startTimes.length; ++i)
                    if (!$util.isString(message.startTimes[i]))
                        return "startTimes: string[] expected";
            }
            if (message.serviceDates != null && $Object.hasOwnProperty.call(message, "serviceDates")) {
                if (!$Array.isArray(message.serviceDates))
                    return "serviceDates: array expected";
                for (let i = 0; i < message.serviceDates.length; ++i)
                    if (!$util.isString(message.serviceDates[i]))
                        return "serviceDates: string[] expected";
            }
            if (message.modifications != null && $Object.hasOwnProperty.call(message, "modifications")) {
                if (!$Array.isArray(message.modifications))
                    return "modifications: array expected";
                for (let i = 0; i < message.modifications.length; ++i) {
                    let error = $root.transit_realtime.TripModifications.Modification.verify(message.modifications[i], _depth + 1);
                    if (error)
                        return "modifications." + error;
                }
            }
            return null;
        };

        /**
         * Creates a TripModifications message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.TripModifications
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.TripModifications} TripModifications
         */
        TripModifications.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.TripModifications)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.TripModifications: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.TripModifications();
            if (object.selectedTrips) {
                if (!$Array.isArray(object.selectedTrips))
                    throw $TypeError(".transit_realtime.TripModifications.selectedTrips: array expected");
                message.selectedTrips = $Array(object.selectedTrips.length);
                for (let i = 0; i < object.selectedTrips.length; ++i) {
                    if (!$util.isObject(object.selectedTrips[i]))
                        throw $TypeError(".transit_realtime.TripModifications.selectedTrips: object expected");
                    message.selectedTrips[i] = $root.transit_realtime.TripModifications.SelectedTrips.fromObject(object.selectedTrips[i], _depth + 1);
                }
            }
            if (object.startTimes) {
                if (!$Array.isArray(object.startTimes))
                    throw $TypeError(".transit_realtime.TripModifications.startTimes: array expected");
                message.startTimes = $Array(object.startTimes.length);
                for (let i = 0; i < object.startTimes.length; ++i)
                    message.startTimes[i] = $String(object.startTimes[i]);
            }
            if (object.serviceDates) {
                if (!$Array.isArray(object.serviceDates))
                    throw $TypeError(".transit_realtime.TripModifications.serviceDates: array expected");
                message.serviceDates = $Array(object.serviceDates.length);
                for (let i = 0; i < object.serviceDates.length; ++i)
                    message.serviceDates[i] = $String(object.serviceDates[i]);
            }
            if (object.modifications) {
                if (!$Array.isArray(object.modifications))
                    throw $TypeError(".transit_realtime.TripModifications.modifications: array expected");
                message.modifications = $Array(object.modifications.length);
                for (let i = 0; i < object.modifications.length; ++i) {
                    if (!$util.isObject(object.modifications[i]))
                        throw $TypeError(".transit_realtime.TripModifications.modifications: object expected");
                    message.modifications[i] = $root.transit_realtime.TripModifications.Modification.fromObject(object.modifications[i], _depth + 1);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a TripModifications message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.TripModifications
         * @static
         * @param {transit_realtime.TripModifications} message TripModifications
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TripModifications.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults) {
                object.selectedTrips = [];
                object.startTimes = [];
                object.serviceDates = [];
                object.modifications = [];
            }
            if (message.selectedTrips && message.selectedTrips.length) {
                object.selectedTrips = $Array(message.selectedTrips.length);
                for (let j = 0; j < message.selectedTrips.length; ++j)
                    object.selectedTrips[j] = $root.transit_realtime.TripModifications.SelectedTrips.toObject(message.selectedTrips[j], options, _depth + 1);
            }
            if (message.startTimes && message.startTimes.length) {
                object.startTimes = $Array(message.startTimes.length);
                for (let j = 0; j < message.startTimes.length; ++j)
                    object.startTimes[j] = message.startTimes[j];
            }
            if (message.serviceDates && message.serviceDates.length) {
                object.serviceDates = $Array(message.serviceDates.length);
                for (let j = 0; j < message.serviceDates.length; ++j)
                    object.serviceDates[j] = message.serviceDates[j];
            }
            if (message.modifications && message.modifications.length) {
                object.modifications = $Array(message.modifications.length);
                for (let j = 0; j < message.modifications.length; ++j)
                    object.modifications[j] = $root.transit_realtime.TripModifications.Modification.toObject(message.modifications[j], options, _depth + 1);
            }
            return object;
        };

        /**
         * Converts this TripModifications to JSON.
         * @function toJSON
         * @memberof transit_realtime.TripModifications
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TripModifications.prototype.toJSON = function() {
            return TripModifications.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for TripModifications
         * @function getTypeUrl
         * @memberof transit_realtime.TripModifications
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TripModifications.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.TripModifications";
        };

        TripModifications.Modification = (function() {

            /**
             * Properties of a Modification.
             * @typedef {Object} transit_realtime.TripModifications.Modification.$Properties
             * @property {transit_realtime.StopSelector.$Properties|null} [startStopSelector] Modification startStopSelector
             * @property {transit_realtime.StopSelector.$Properties|null} [endStopSelector] Modification endStopSelector
             * @property {number|null} [propagatedModificationDelay] Modification propagatedModificationDelay
             * @property {Array.<transit_realtime.ReplacementStop.$Properties>|null} [replacementStops] Modification replacementStops
             * @property {string|null} [serviceAlertId] Modification serviceAlertId
             * @property {number|Long|null} [lastModifiedTime] Modification lastModifiedTime
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Modification.
             * @memberof transit_realtime.TripModifications
             * @interface IModification
             * @augments transit_realtime.TripModifications.Modification.$Properties
             * @deprecated Use transit_realtime.TripModifications.Modification.$Properties instead.
             */

            /**
             * Shape of a Modification.
             * @typedef {transit_realtime.TripModifications.Modification.$Properties} transit_realtime.TripModifications.Modification.$Shape
             */

            /**
             * Constructs a new Modification.
             * @memberof transit_realtime.TripModifications
             * @classdesc Represents a Modification.
             * @constructor
             * @param {transit_realtime.TripModifications.Modification.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Modification = function (properties) {
                this.replacementStops = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Modification startStopSelector.
             * @member {transit_realtime.StopSelector.$Properties|null|undefined} startStopSelector
             * @memberof transit_realtime.TripModifications.Modification
             * @instance
             */
            Modification.prototype.startStopSelector = null;

            /**
             * Modification endStopSelector.
             * @member {transit_realtime.StopSelector.$Properties|null|undefined} endStopSelector
             * @memberof transit_realtime.TripModifications.Modification
             * @instance
             */
            Modification.prototype.endStopSelector = null;

            /**
             * Modification propagatedModificationDelay.
             * @member {number} propagatedModificationDelay
             * @memberof transit_realtime.TripModifications.Modification
             * @instance
             */
            Modification.prototype.propagatedModificationDelay = 0;

            /**
             * Modification replacementStops.
             * @member {Array.<transit_realtime.ReplacementStop.$Properties>} replacementStops
             * @memberof transit_realtime.TripModifications.Modification
             * @instance
             */
            Modification.prototype.replacementStops = $util.emptyArray;

            /**
             * Modification serviceAlertId.
             * @member {string} serviceAlertId
             * @memberof transit_realtime.TripModifications.Modification
             * @instance
             */
            Modification.prototype.serviceAlertId = "";

            /**
             * Modification lastModifiedTime.
             * @member {number|Long} lastModifiedTime
             * @memberof transit_realtime.TripModifications.Modification
             * @instance
             */
            Modification.prototype.lastModifiedTime = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * Creates a new Modification instance using the specified properties.
             * @function create
             * @memberof transit_realtime.TripModifications.Modification
             * @static
             * @param {transit_realtime.TripModifications.Modification.$Properties=} [properties] Properties to set
             * @returns {transit_realtime.TripModifications.Modification} Modification instance
             * @type {{
             *   (properties: transit_realtime.TripModifications.Modification.$Shape): transit_realtime.TripModifications.Modification & transit_realtime.TripModifications.Modification.$Shape;
             *   (properties?: transit_realtime.TripModifications.Modification.$Properties): transit_realtime.TripModifications.Modification;
             * }}
             */
            Modification.create = function(properties) {
                return new Modification(properties);
            };

            /**
             * Encodes the specified Modification message. Does not implicitly {@link transit_realtime.TripModifications.Modification.verify|verify} messages.
             * @function encode
             * @memberof transit_realtime.TripModifications.Modification
             * @static
             * @param {transit_realtime.TripModifications.Modification.$Properties} message Modification message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Modification.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.startStopSelector != null && $Object.hasOwnProperty.call(message, "startStopSelector"))
                    $root.transit_realtime.StopSelector.encode(message.startStopSelector, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.endStopSelector != null && $Object.hasOwnProperty.call(message, "endStopSelector"))
                    $root.transit_realtime.StopSelector.encode(message.endStopSelector, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                if (message.propagatedModificationDelay != null && $Object.hasOwnProperty.call(message, "propagatedModificationDelay"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.propagatedModificationDelay);
                if (message.replacementStops != null && message.replacementStops.length)
                    for (let i = 0; i < message.replacementStops.length; ++i)
                        $root.transit_realtime.ReplacementStop.encode(message.replacementStops[i], writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                if (message.serviceAlertId != null && $Object.hasOwnProperty.call(message, "serviceAlertId"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.serviceAlertId);
                if (message.lastModifiedTime != null && $Object.hasOwnProperty.call(message, "lastModifiedTime"))
                    writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.lastModifiedTime);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Modification message, length delimited. Does not implicitly {@link transit_realtime.TripModifications.Modification.verify|verify} messages.
             * @function encodeDelimited
             * @memberof transit_realtime.TripModifications.Modification
             * @static
             * @param {transit_realtime.TripModifications.Modification.$Properties} message Modification message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Modification.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a Modification message from the specified reader or buffer.
             * @function decode
             * @memberof transit_realtime.TripModifications.Modification
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {transit_realtime.TripModifications.Modification & transit_realtime.TripModifications.Modification.$Shape} Modification
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Modification.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.transit_realtime.TripModifications.Modification();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.startStopSelector = $root.transit_realtime.StopSelector.decode(reader, reader.uint32(), $undefined, _depth + 1, message.startStopSelector);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.endStopSelector = $root.transit_realtime.StopSelector.decode(reader, reader.uint32(), $undefined, _depth + 1, message.endStopSelector);
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.propagatedModificationDelay = reader.int32();
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            if (!(message.replacementStops && message.replacementStops.length))
                                message.replacementStops = [];
                            message.replacementStops.push($root.transit_realtime.ReplacementStop.decode(reader, reader.uint32(), $undefined, _depth + 1));
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            message.serviceAlertId = reader.string();
                            continue;
                        }
                    case 6: {
                            if (wireType !== 0)
                                break;
                            message.lastModifiedTime = reader.uint64();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a Modification message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof transit_realtime.TripModifications.Modification
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {transit_realtime.TripModifications.Modification & transit_realtime.TripModifications.Modification.$Shape} Modification
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Modification.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Modification message.
             * @function verify
             * @memberof transit_realtime.TripModifications.Modification
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Modification.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.startStopSelector != null && $Object.hasOwnProperty.call(message, "startStopSelector")) {
                    let error = $root.transit_realtime.StopSelector.verify(message.startStopSelector, _depth + 1);
                    if (error)
                        return "startStopSelector." + error;
                }
                if (message.endStopSelector != null && $Object.hasOwnProperty.call(message, "endStopSelector")) {
                    let error = $root.transit_realtime.StopSelector.verify(message.endStopSelector, _depth + 1);
                    if (error)
                        return "endStopSelector." + error;
                }
                if (message.propagatedModificationDelay != null && $Object.hasOwnProperty.call(message, "propagatedModificationDelay"))
                    if (!$util.isInteger(message.propagatedModificationDelay))
                        return "propagatedModificationDelay: integer expected";
                if (message.replacementStops != null && $Object.hasOwnProperty.call(message, "replacementStops")) {
                    if (!$Array.isArray(message.replacementStops))
                        return "replacementStops: array expected";
                    for (let i = 0; i < message.replacementStops.length; ++i) {
                        let error = $root.transit_realtime.ReplacementStop.verify(message.replacementStops[i], _depth + 1);
                        if (error)
                            return "replacementStops." + error;
                    }
                }
                if (message.serviceAlertId != null && $Object.hasOwnProperty.call(message, "serviceAlertId"))
                    if (!$util.isString(message.serviceAlertId))
                        return "serviceAlertId: string expected";
                if (message.lastModifiedTime != null && $Object.hasOwnProperty.call(message, "lastModifiedTime"))
                    if (!$util.isInteger(message.lastModifiedTime) && !(message.lastModifiedTime && $util.isInteger(message.lastModifiedTime.low) && $util.isInteger(message.lastModifiedTime.high)))
                        return "lastModifiedTime: integer|Long expected";
                return null;
            };

            /**
             * Creates a Modification message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof transit_realtime.TripModifications.Modification
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {transit_realtime.TripModifications.Modification} Modification
             */
            Modification.fromObject = function (object, _depth) {
                if (object instanceof $root.transit_realtime.TripModifications.Modification)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".transit_realtime.TripModifications.Modification: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.transit_realtime.TripModifications.Modification();
                if (object.startStopSelector != null) {
                    if (!$util.isObject(object.startStopSelector))
                        throw $TypeError(".transit_realtime.TripModifications.Modification.startStopSelector: object expected");
                    message.startStopSelector = $root.transit_realtime.StopSelector.fromObject(object.startStopSelector, _depth + 1);
                }
                if (object.endStopSelector != null) {
                    if (!$util.isObject(object.endStopSelector))
                        throw $TypeError(".transit_realtime.TripModifications.Modification.endStopSelector: object expected");
                    message.endStopSelector = $root.transit_realtime.StopSelector.fromObject(object.endStopSelector, _depth + 1);
                }
                if (object.propagatedModificationDelay != null)
                    message.propagatedModificationDelay = object.propagatedModificationDelay | 0;
                if (object.replacementStops) {
                    if (!$Array.isArray(object.replacementStops))
                        throw $TypeError(".transit_realtime.TripModifications.Modification.replacementStops: array expected");
                    message.replacementStops = $Array(object.replacementStops.length);
                    for (let i = 0; i < object.replacementStops.length; ++i) {
                        if (!$util.isObject(object.replacementStops[i]))
                            throw $TypeError(".transit_realtime.TripModifications.Modification.replacementStops: object expected");
                        message.replacementStops[i] = $root.transit_realtime.ReplacementStop.fromObject(object.replacementStops[i], _depth + 1);
                    }
                }
                if (object.serviceAlertId != null)
                    message.serviceAlertId = $String(object.serviceAlertId);
                if (object.lastModifiedTime != null)
                    if ($util.Long)
                        message.lastModifiedTime = $util.Long.fromValue(object.lastModifiedTime, true);
                    else if (typeof object.lastModifiedTime === "string")
                        message.lastModifiedTime = $parseInt(object.lastModifiedTime, 10);
                    else if (typeof object.lastModifiedTime === "number")
                        message.lastModifiedTime = object.lastModifiedTime;
                    else if (typeof object.lastModifiedTime === "object")
                        message.lastModifiedTime = new $util.LongBits(object.lastModifiedTime.low >>> 0, object.lastModifiedTime.high >>> 0).toNumber(true);
                return message;
            };

            /**
             * Creates a plain object from a Modification message. Also converts values to other types if specified.
             * @function toObject
             * @memberof transit_realtime.TripModifications.Modification
             * @static
             * @param {transit_realtime.TripModifications.Modification} message Modification
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Modification.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.arrays || options.defaults)
                    object.replacementStops = [];
                if (options.defaults) {
                    object.startStopSelector = null;
                    object.endStopSelector = null;
                    object.propagatedModificationDelay = 0;
                    object.serviceAlertId = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.lastModifiedTime = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.lastModifiedTime = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                }
                if (message.startStopSelector != null && $Object.hasOwnProperty.call(message, "startStopSelector"))
                    object.startStopSelector = $root.transit_realtime.StopSelector.toObject(message.startStopSelector, options, _depth + 1);
                if (message.endStopSelector != null && $Object.hasOwnProperty.call(message, "endStopSelector"))
                    object.endStopSelector = $root.transit_realtime.StopSelector.toObject(message.endStopSelector, options, _depth + 1);
                if (message.propagatedModificationDelay != null && $Object.hasOwnProperty.call(message, "propagatedModificationDelay"))
                    object.propagatedModificationDelay = message.propagatedModificationDelay;
                if (message.replacementStops && message.replacementStops.length) {
                    object.replacementStops = $Array(message.replacementStops.length);
                    for (let j = 0; j < message.replacementStops.length; ++j)
                        object.replacementStops[j] = $root.transit_realtime.ReplacementStop.toObject(message.replacementStops[j], options, _depth + 1);
                }
                if (message.serviceAlertId != null && $Object.hasOwnProperty.call(message, "serviceAlertId"))
                    object.serviceAlertId = message.serviceAlertId;
                if (message.lastModifiedTime != null && $Object.hasOwnProperty.call(message, "lastModifiedTime"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.lastModifiedTime = typeof message.lastModifiedTime === "number" ? $BigInt(message.lastModifiedTime) : $util.Long.fromBits(message.lastModifiedTime.low >>> 0, message.lastModifiedTime.high >>> 0, true).toBigInt();
                    else if (typeof message.lastModifiedTime === "number")
                        object.lastModifiedTime = options.longs === $String ? $String(message.lastModifiedTime) : message.lastModifiedTime;
                    else
                        object.lastModifiedTime = options.longs === $String ? $util.Long.prototype.toString.call(message.lastModifiedTime) : options.longs === $Number ? new $util.LongBits(message.lastModifiedTime.low >>> 0, message.lastModifiedTime.high >>> 0).toNumber(true) : message.lastModifiedTime;
                return object;
            };

            /**
             * Converts this Modification to JSON.
             * @function toJSON
             * @memberof transit_realtime.TripModifications.Modification
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Modification.prototype.toJSON = function() {
                return Modification.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Modification
             * @function getTypeUrl
             * @memberof transit_realtime.TripModifications.Modification
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Modification.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/transit_realtime.TripModifications.Modification";
            };

            return Modification;
        })();

        TripModifications.SelectedTrips = (function() {

            /**
             * Properties of a SelectedTrips.
             * @typedef {Object} transit_realtime.TripModifications.SelectedTrips.$Properties
             * @property {Array.<string>|null} [tripIds] SelectedTrips tripIds
             * @property {string|null} [shapeId] SelectedTrips shapeId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a SelectedTrips.
             * @memberof transit_realtime.TripModifications
             * @interface ISelectedTrips
             * @augments transit_realtime.TripModifications.SelectedTrips.$Properties
             * @deprecated Use transit_realtime.TripModifications.SelectedTrips.$Properties instead.
             */

            /**
             * Shape of a SelectedTrips.
             * @typedef {transit_realtime.TripModifications.SelectedTrips.$Properties} transit_realtime.TripModifications.SelectedTrips.$Shape
             */

            /**
             * Constructs a new SelectedTrips.
             * @memberof transit_realtime.TripModifications
             * @classdesc Represents a SelectedTrips.
             * @constructor
             * @param {transit_realtime.TripModifications.SelectedTrips.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const SelectedTrips = function (properties) {
                this.tripIds = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * SelectedTrips tripIds.
             * @member {Array.<string>} tripIds
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @instance
             */
            SelectedTrips.prototype.tripIds = $util.emptyArray;

            /**
             * SelectedTrips shapeId.
             * @member {string} shapeId
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @instance
             */
            SelectedTrips.prototype.shapeId = "";

            /**
             * Creates a new SelectedTrips instance using the specified properties.
             * @function create
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @static
             * @param {transit_realtime.TripModifications.SelectedTrips.$Properties=} [properties] Properties to set
             * @returns {transit_realtime.TripModifications.SelectedTrips} SelectedTrips instance
             * @type {{
             *   (properties: transit_realtime.TripModifications.SelectedTrips.$Shape): transit_realtime.TripModifications.SelectedTrips & transit_realtime.TripModifications.SelectedTrips.$Shape;
             *   (properties?: transit_realtime.TripModifications.SelectedTrips.$Properties): transit_realtime.TripModifications.SelectedTrips;
             * }}
             */
            SelectedTrips.create = function(properties) {
                return new SelectedTrips(properties);
            };

            /**
             * Encodes the specified SelectedTrips message. Does not implicitly {@link transit_realtime.TripModifications.SelectedTrips.verify|verify} messages.
             * @function encode
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @static
             * @param {transit_realtime.TripModifications.SelectedTrips.$Properties} message SelectedTrips message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SelectedTrips.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.tripIds != null && message.tripIds.length)
                    for (let i = 0; i < message.tripIds.length; ++i)
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.tripIds[i]);
                if (message.shapeId != null && $Object.hasOwnProperty.call(message, "shapeId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.shapeId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified SelectedTrips message, length delimited. Does not implicitly {@link transit_realtime.TripModifications.SelectedTrips.verify|verify} messages.
             * @function encodeDelimited
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @static
             * @param {transit_realtime.TripModifications.SelectedTrips.$Properties} message SelectedTrips message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SelectedTrips.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a SelectedTrips message from the specified reader or buffer.
             * @function decode
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {transit_realtime.TripModifications.SelectedTrips & transit_realtime.TripModifications.SelectedTrips.$Shape} SelectedTrips
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SelectedTrips.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.transit_realtime.TripModifications.SelectedTrips();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if (!(message.tripIds && message.tripIds.length))
                                message.tripIds = [];
                            message.tripIds.push(reader.string());
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.shapeId = reader.string();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a SelectedTrips message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {transit_realtime.TripModifications.SelectedTrips & transit_realtime.TripModifications.SelectedTrips.$Shape} SelectedTrips
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SelectedTrips.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SelectedTrips message.
             * @function verify
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SelectedTrips.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.tripIds != null && $Object.hasOwnProperty.call(message, "tripIds")) {
                    if (!$Array.isArray(message.tripIds))
                        return "tripIds: array expected";
                    for (let i = 0; i < message.tripIds.length; ++i)
                        if (!$util.isString(message.tripIds[i]))
                            return "tripIds: string[] expected";
                }
                if (message.shapeId != null && $Object.hasOwnProperty.call(message, "shapeId"))
                    if (!$util.isString(message.shapeId))
                        return "shapeId: string expected";
                return null;
            };

            /**
             * Creates a SelectedTrips message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {transit_realtime.TripModifications.SelectedTrips} SelectedTrips
             */
            SelectedTrips.fromObject = function (object, _depth) {
                if (object instanceof $root.transit_realtime.TripModifications.SelectedTrips)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".transit_realtime.TripModifications.SelectedTrips: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.transit_realtime.TripModifications.SelectedTrips();
                if (object.tripIds) {
                    if (!$Array.isArray(object.tripIds))
                        throw $TypeError(".transit_realtime.TripModifications.SelectedTrips.tripIds: array expected");
                    message.tripIds = $Array(object.tripIds.length);
                    for (let i = 0; i < object.tripIds.length; ++i)
                        message.tripIds[i] = $String(object.tripIds[i]);
                }
                if (object.shapeId != null)
                    message.shapeId = $String(object.shapeId);
                return message;
            };

            /**
             * Creates a plain object from a SelectedTrips message. Also converts values to other types if specified.
             * @function toObject
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @static
             * @param {transit_realtime.TripModifications.SelectedTrips} message SelectedTrips
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SelectedTrips.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.arrays || options.defaults)
                    object.tripIds = [];
                if (options.defaults)
                    object.shapeId = "";
                if (message.tripIds && message.tripIds.length) {
                    object.tripIds = $Array(message.tripIds.length);
                    for (let j = 0; j < message.tripIds.length; ++j)
                        object.tripIds[j] = message.tripIds[j];
                }
                if (message.shapeId != null && $Object.hasOwnProperty.call(message, "shapeId"))
                    object.shapeId = message.shapeId;
                return object;
            };

            /**
             * Converts this SelectedTrips to JSON.
             * @function toJSON
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SelectedTrips.prototype.toJSON = function() {
                return SelectedTrips.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for SelectedTrips
             * @function getTypeUrl
             * @memberof transit_realtime.TripModifications.SelectedTrips
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            SelectedTrips.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/transit_realtime.TripModifications.SelectedTrips";
            };

            return SelectedTrips;
        })();

        return TripModifications;
    })();

    transit_realtime.StopSelector = (function() {

        /**
         * Properties of a StopSelector.
         * @typedef {Object} transit_realtime.StopSelector.$Properties
         * @property {number|null} [stopSequence] StopSelector stopSequence
         * @property {string|null} [stopId] StopSelector stopId
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a StopSelector.
         * @memberof transit_realtime
         * @interface IStopSelector
         * @augments transit_realtime.StopSelector.$Properties
         * @deprecated Use transit_realtime.StopSelector.$Properties instead.
         */

        /**
         * Shape of a StopSelector.
         * @typedef {transit_realtime.StopSelector.$Properties} transit_realtime.StopSelector.$Shape
         */

        /**
         * Constructs a new StopSelector.
         * @memberof transit_realtime
         * @classdesc Represents a StopSelector.
         * @constructor
         * @param {transit_realtime.StopSelector.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const StopSelector = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * StopSelector stopSequence.
         * @member {number} stopSequence
         * @memberof transit_realtime.StopSelector
         * @instance
         */
        StopSelector.prototype.stopSequence = 0;

        /**
         * StopSelector stopId.
         * @member {string} stopId
         * @memberof transit_realtime.StopSelector
         * @instance
         */
        StopSelector.prototype.stopId = "";

        /**
         * Creates a new StopSelector instance using the specified properties.
         * @function create
         * @memberof transit_realtime.StopSelector
         * @static
         * @param {transit_realtime.StopSelector.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.StopSelector} StopSelector instance
         * @type {{
         *   (properties: transit_realtime.StopSelector.$Shape): transit_realtime.StopSelector & transit_realtime.StopSelector.$Shape;
         *   (properties?: transit_realtime.StopSelector.$Properties): transit_realtime.StopSelector;
         * }}
         */
        StopSelector.create = function(properties) {
            return new StopSelector(properties);
        };

        /**
         * Encodes the specified StopSelector message. Does not implicitly {@link transit_realtime.StopSelector.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.StopSelector
         * @static
         * @param {transit_realtime.StopSelector.$Properties} message StopSelector message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StopSelector.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.stopSequence != null && $Object.hasOwnProperty.call(message, "stopSequence"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.stopSequence);
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.stopId);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified StopSelector message, length delimited. Does not implicitly {@link transit_realtime.StopSelector.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.StopSelector
         * @static
         * @param {transit_realtime.StopSelector.$Properties} message StopSelector message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StopSelector.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a StopSelector message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.StopSelector
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.StopSelector & transit_realtime.StopSelector.$Shape} StopSelector
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StopSelector.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.StopSelector();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.stopSequence = reader.uint32();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.stopId = reader.string();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a StopSelector message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.StopSelector
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.StopSelector & transit_realtime.StopSelector.$Shape} StopSelector
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StopSelector.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a StopSelector message.
         * @function verify
         * @memberof transit_realtime.StopSelector
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        StopSelector.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.stopSequence != null && $Object.hasOwnProperty.call(message, "stopSequence"))
                if (!$util.isInteger(message.stopSequence))
                    return "stopSequence: integer expected";
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                if (!$util.isString(message.stopId))
                    return "stopId: string expected";
            return null;
        };

        /**
         * Creates a StopSelector message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.StopSelector
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.StopSelector} StopSelector
         */
        StopSelector.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.StopSelector)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.StopSelector: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.StopSelector();
            if (object.stopSequence != null)
                message.stopSequence = object.stopSequence >>> 0;
            if (object.stopId != null)
                message.stopId = $String(object.stopId);
            return message;
        };

        /**
         * Creates a plain object from a StopSelector message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.StopSelector
         * @static
         * @param {transit_realtime.StopSelector} message StopSelector
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        StopSelector.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.stopSequence = 0;
                object.stopId = "";
            }
            if (message.stopSequence != null && $Object.hasOwnProperty.call(message, "stopSequence"))
                object.stopSequence = message.stopSequence;
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                object.stopId = message.stopId;
            return object;
        };

        /**
         * Converts this StopSelector to JSON.
         * @function toJSON
         * @memberof transit_realtime.StopSelector
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        StopSelector.prototype.toJSON = function() {
            return StopSelector.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for StopSelector
         * @function getTypeUrl
         * @memberof transit_realtime.StopSelector
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        StopSelector.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.StopSelector";
        };

        return StopSelector;
    })();

    transit_realtime.ReplacementStop = (function() {

        /**
         * Properties of a ReplacementStop.
         * @typedef {Object} transit_realtime.ReplacementStop.$Properties
         * @property {number|null} [travelTimeToStop] ReplacementStop travelTimeToStop
         * @property {string|null} [stopId] ReplacementStop stopId
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a ReplacementStop.
         * @memberof transit_realtime
         * @interface IReplacementStop
         * @augments transit_realtime.ReplacementStop.$Properties
         * @deprecated Use transit_realtime.ReplacementStop.$Properties instead.
         */

        /**
         * Shape of a ReplacementStop.
         * @typedef {transit_realtime.ReplacementStop.$Properties} transit_realtime.ReplacementStop.$Shape
         */

        /**
         * Constructs a new ReplacementStop.
         * @memberof transit_realtime
         * @classdesc Represents a ReplacementStop.
         * @constructor
         * @param {transit_realtime.ReplacementStop.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const ReplacementStop = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * ReplacementStop travelTimeToStop.
         * @member {number} travelTimeToStop
         * @memberof transit_realtime.ReplacementStop
         * @instance
         */
        ReplacementStop.prototype.travelTimeToStop = 0;

        /**
         * ReplacementStop stopId.
         * @member {string} stopId
         * @memberof transit_realtime.ReplacementStop
         * @instance
         */
        ReplacementStop.prototype.stopId = "";

        /**
         * Creates a new ReplacementStop instance using the specified properties.
         * @function create
         * @memberof transit_realtime.ReplacementStop
         * @static
         * @param {transit_realtime.ReplacementStop.$Properties=} [properties] Properties to set
         * @returns {transit_realtime.ReplacementStop} ReplacementStop instance
         * @type {{
         *   (properties: transit_realtime.ReplacementStop.$Shape): transit_realtime.ReplacementStop & transit_realtime.ReplacementStop.$Shape;
         *   (properties?: transit_realtime.ReplacementStop.$Properties): transit_realtime.ReplacementStop;
         * }}
         */
        ReplacementStop.create = function(properties) {
            return new ReplacementStop(properties);
        };

        /**
         * Encodes the specified ReplacementStop message. Does not implicitly {@link transit_realtime.ReplacementStop.verify|verify} messages.
         * @function encode
         * @memberof transit_realtime.ReplacementStop
         * @static
         * @param {transit_realtime.ReplacementStop.$Properties} message ReplacementStop message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReplacementStop.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.travelTimeToStop != null && $Object.hasOwnProperty.call(message, "travelTimeToStop"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.travelTimeToStop);
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.stopId);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified ReplacementStop message, length delimited. Does not implicitly {@link transit_realtime.ReplacementStop.verify|verify} messages.
         * @function encodeDelimited
         * @memberof transit_realtime.ReplacementStop
         * @static
         * @param {transit_realtime.ReplacementStop.$Properties} message ReplacementStop message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReplacementStop.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a ReplacementStop message from the specified reader or buffer.
         * @function decode
         * @memberof transit_realtime.ReplacementStop
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {transit_realtime.ReplacementStop & transit_realtime.ReplacementStop.$Shape} ReplacementStop
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReplacementStop.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.transit_realtime.ReplacementStop();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.travelTimeToStop = reader.int32();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.stopId = reader.string();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a ReplacementStop message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof transit_realtime.ReplacementStop
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {transit_realtime.ReplacementStop & transit_realtime.ReplacementStop.$Shape} ReplacementStop
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReplacementStop.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ReplacementStop message.
         * @function verify
         * @memberof transit_realtime.ReplacementStop
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ReplacementStop.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.travelTimeToStop != null && $Object.hasOwnProperty.call(message, "travelTimeToStop"))
                if (!$util.isInteger(message.travelTimeToStop))
                    return "travelTimeToStop: integer expected";
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                if (!$util.isString(message.stopId))
                    return "stopId: string expected";
            return null;
        };

        /**
         * Creates a ReplacementStop message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof transit_realtime.ReplacementStop
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {transit_realtime.ReplacementStop} ReplacementStop
         */
        ReplacementStop.fromObject = function (object, _depth) {
            if (object instanceof $root.transit_realtime.ReplacementStop)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".transit_realtime.ReplacementStop: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.transit_realtime.ReplacementStop();
            if (object.travelTimeToStop != null)
                message.travelTimeToStop = object.travelTimeToStop | 0;
            if (object.stopId != null)
                message.stopId = $String(object.stopId);
            return message;
        };

        /**
         * Creates a plain object from a ReplacementStop message. Also converts values to other types if specified.
         * @function toObject
         * @memberof transit_realtime.ReplacementStop
         * @static
         * @param {transit_realtime.ReplacementStop} message ReplacementStop
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ReplacementStop.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.travelTimeToStop = 0;
                object.stopId = "";
            }
            if (message.travelTimeToStop != null && $Object.hasOwnProperty.call(message, "travelTimeToStop"))
                object.travelTimeToStop = message.travelTimeToStop;
            if (message.stopId != null && $Object.hasOwnProperty.call(message, "stopId"))
                object.stopId = message.stopId;
            return object;
        };

        /**
         * Converts this ReplacementStop to JSON.
         * @function toJSON
         * @memberof transit_realtime.ReplacementStop
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ReplacementStop.prototype.toJSON = function() {
            return ReplacementStop.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for ReplacementStop
         * @function getTypeUrl
         * @memberof transit_realtime.ReplacementStop
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        ReplacementStop.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/transit_realtime.ReplacementStop";
        };

        return ReplacementStop;
    })();

    return transit_realtime;
})();

export {
  $root as default
};
