function ShpReader(src) {
	if (this instanceof ShpReader === false) {
		return new ShpReader(src);
	}
	var file = MapShaper.utils.isString(src) ? new FileBytes(src) : new BufferBytes(src);
	var header = parseHeader(file.readBytes(100, 0));
	var fileSize = file.size();
	var RecordClass = new ShpRecordClass(header.type);
	var recordOffs, i, skippedBytes;

	reset();

	this.header = function() {
		return header;
	};

	// Callback interface: for each record in a .shp file, pass a
	// record object to a callback function
	//
	this.forEachShape = function(callback) {
		var shape = this.nextShape();
		while (shape) {
			callback(shape);
			shape = this.nextShape();
		}
	};

	// Iterator interface for reading shape records
	this.nextShape = function() {
		var shape = readShapeAtOffset(recordOffs, i), offs2, skipped;
		if (!shape && recordOffs + 12 <= fileSize) {
			// Very rarely, in-the-wild .shp files may contain junk bytes
			// between
			// records; it may be possible to scan past the junk to find the
			// next record.
			shape = huntForNextShape(recordOffs + 4, i);
		}
		if (shape) {
			recordOffs += shape.byteLength;
			if (shape.id < i) {
				// Encountered in ne_10m_railroads.shp from natural earth
				// v2.0.0
				message("[shp] Record " + shape.id + " appears more than once -- possible file corruption.");
				return this.nextShape();
			}
			i++;
		} else {
			if (skippedBytes > 0) {
				// Encountered in ne_10m_railroads.shp from natural earth
				// v2.0.0
				message("[shp] Skipped " + skippedBytes + " bytes in .shp file -- possible data loss.");
			}
			file.close();
			reset();
		}
		return shape;
	};

	function reset() {
		recordOffs = 100;
		skippedBytes = 0;
		i = 1; // Shapefile id of first record
	}

	function parseHeader(bin) {
		var header = {
			signature : bin.bigEndian().readUint32(),
			byteLength : bin.skipBytes(20).readUint32() * 2,
			version : bin.littleEndian().readUint32(),
			type : bin.readUint32(),
			bounds : bin.readFloat64Array(4), // xmin, ymin, xmax, ymax
			zbounds : bin.readFloat64Array(2),
			mbounds : bin.readFloat64Array(2)
		};

		if (header.signature != 9994) {
			error("Not a valid .shp file");
		}

		if (!MapShaper.isSupportedShapefileType(header.type)) {
			error("Unsupported .shp type:", header.type);
		}

		if (header.byteLength != file.size()) {
			error("File size of .shp doesn't match size in header");
		}

		return header;
	}

	function readShapeAtOffset(recordOffs, i) {
		var shape = null, recordSize, recordType, recordId, goodId, goodSize, goodType, bin;

		if (recordOffs + 12 <= fileSize) {
			bin = file.readBytes(12, recordOffs);
			recordId = bin.bigEndian().readUint32();
			// record size is bytes in content section + 8 header bytes
			recordSize = bin.readUint32() * 2 + 8;
			recordType = bin.littleEndian().readUint32();
			goodId = recordId == i; // not checking id ...
			goodSize = recordOffs + recordSize <= fileSize && recordSize >= 12;
			goodType = recordType === 0 || recordType == header.type;
			if (goodSize && goodType) {
				bin = file.readBytes(recordSize, recordOffs);
				shape = new RecordClass(bin, recordSize);
			}
		}
		return shape;
	}

	// TODO: add tests
	// Try to scan past unreadable content to find next record
	function huntForNextShape(start, id) {
		var offset = start, shape = null, bin, recordId, recordType;
		while (offset + 12 <= fileSize) {
			bin = file.readBytes(12, offset);
			recordId = bin.bigEndian().readUint32();
			recordType = bin.littleEndian().skipBytes(4).readUint32();
			if (recordId == id && (recordType == header.type || recordType === 0)) {
				// we have a likely position, but may still be unparsable
				shape = readShapeAtOffset(offset, id);
				break;
			}
			offset += 4; // try next integer position
		}
		skippedBytes += shape ? offset - start : fileSize - start;
		return shape;
	}
}

ShpReader.prototype.type = function() {
	return this.header().type;
};

ShpReader.prototype.getCounts = function() {
	var counts = {
		nullCount : 0,
		partCount : 0,
		shapeCount : 0,
		pointCount : 0
	};
	this.forEachShape(function(shp) {
		if (shp.isNull)
			counts.nullCount++;
		counts.pointCount += shp.pointCount;
		counts.partCount += shp.partCount;
		counts.shapeCount++;
	});
	return counts;
};

var ShpType = {
	NULL : 0,
	POINT : 1,
	POLYLINE : 3,
	POLYGON : 5,
	MULTIPOINT : 8,
	POINTZ : 11,
	POLYLINEZ : 13,
	POLYGONZ : 15,
	MULTIPOINTZ : 18,
	POINTM : 21,
	POLYLINEM : 23,
	POLYGONM : 25,
	MULIPOINTM : 28,
	MULTIPATCH : 31
// not supported
};

ShpType.isPolygonType = function(t) {
	return t == 5 || t == 15 || t == 25;
};

ShpType.isPolylineType = function(t) {
	return t == 3 || t == 13 || t == 23;
};

ShpType.isMultiPartType = function(t) {
	return ShpType.isPolygonType(t) || ShpType.isPolylineType(t);
};

ShpType.isMultiPointType = function(t) {
	return t == 8 || t == 18 || t == 28;
};

ShpType.isZType = function(t) {
	return MapShaper.utils.contains([ 11, 13, 15, 18 ], t);
};

ShpType.isMType = function(t) {
	return ShpType.isZType(t) || MapShaper.utils.contains([ 21, 23, 25, 28 ], t);
};

ShpType.hasBounds = function(t) {
	return ShpType.isMultiPartType(t) || ShpType.isMultiPointType(t);
};

function ShpRecordClass(type) {
	var hasBounds = ShpType.hasBounds(type), hasParts = ShpType.isMultiPartType(type), hasZ = ShpType.isZType(type), hasM = ShpType
			.isMType(type), singlePoint = !hasBounds, mzRangeBytes = singlePoint ? 0 : 16, constructor;

	if (type === 0) {
		return NullRecord;
	}

	// @bin is a BinArray set to the first data byte of a shape record
	constructor = function ShapeRecord(bin, bytes) {
		var pos = bin.position();
		this.id = bin.bigEndian().readUint32();
		this.type = bin.littleEndian().skipBytes(4).readUint32();
		if (this.type === 0) {
			return new NullRecord();
		}
		if (bytes > 0 !== true || (this.type != type && this.type !== 0)) {
			error("Unable to read a shape -- .shp file may be corrupted");
		}
		this.byteLength = bytes; // bin.readUint32() * 2 + 8; // bytes in
		// content section + 8 header bytes
		if (singlePoint) {
			this.pointCount = 1;
			this.partCount = 1;
		} else {
			bin.skipBytes(32); // skip bbox
			this.partCount = hasParts ? bin.readUint32() : 1;
			this.pointCount = bin.readUint32();
		}
		this._data = function() {
			return bin.position(pos);
		};
	};

	// base prototype has methods shared by all Shapefile types except NULL type
	// (Type-specific methods are mixed in below)
	var proto = {
		// return offset of [x, y] point data in the record
		_xypos : function() {
			var offs = 12; // skip header & record type
			if (!singlePoint)
				offs += 4; // skip point count
			if (hasBounds)
				offs += 32;
			if (hasParts)
				offs += 4 * this.partCount + 4; // skip part count & index
			return offs;
		},

		readCoords : function() {
			if (this.pointCount === 0)
				return null;
			var partSizes = this.readPartSizes(), xy = this._data().skipBytes(this._xypos());

			return partSizes.map(function(pointCount) {
				return xy.readFloat64Array(pointCount * 2);
			});
		},

		readXY : function() {
			if (this.pointCount === 0)
				return new Float64Array(0);
			return this._data().skipBytes(this._xypos()).readFloat64Array(this.pointCount * 2);
		},

		readPoints : function() {
			var xy = this.readXY(), zz = hasZ ? this.readZ() : null, mm = hasM && this.hasM() ? this.readM() : null, points = [], p;

			for (var i = 0, n = xy.length / 2; i < n; i++) {
				p = [ xy[i * 2], xy[i * 2 + 1] ];
				if (zz)
					p.push(zz[i]);
				if (mm)
					p.push(mm[i]);
				points.push(p);
			}
			return points;
		},

		// Return an array of point counts in each part
		// Parts containing zero points are skipped (Shapefiles with zero-point
		// parts are out-of-spec but exist in the wild).
		readPartSizes : function() {
			var sizes = [];
			var partLen, startId, bin;
			if (this.pointCount === 0) {
				// no parts
			} else if (this.partCount == 1) {
				// single-part type or multi-part type with one part
				sizes.push(this.pointCount);
			} else {
				// more than one part
				startId = 0;
				bin = this._data().skipBytes(56); // skip to second entry in
				// part index
				for (var i = 0, n = this.partCount; i < n; i++) {
					partLen = (i < n - 1 ? bin.readUint32() : this.pointCount) - startId;
					if (partLen > 0) {
						sizes.push(partLen);
						startId += partLen;
					}
				}
			}
			return sizes;
		}
	};

	var singlePointProto = {
		read : function() {
			var n = 2;
			if (hasZ)
				n++;
			if (this.hasM())
				n++;
			return this._data().skipBytes(12).readFloat64Array(n);
		},

		stream : function(sink) {
			var src = this._data().skipBytes(12);
			sink.addPoint(src.readFloat64(), src.readFloat64());
			sink.endPath();
		}
	};

	var multiCoordProto = {
		readBounds : function() {
			return this._data().skipBytes(12).readFloat64Array(4);
		},

		stream : function(sink) {
			var sizes = this.readPartSizes(), xy = this.readXY(), i = 0, j = 0, n;
			while (i < sizes.length) {
				n = sizes[i];
				while (n-- > 0) {
					sink.addPoint(xy[j++], xy[j++]);
				}
				sink.endPath();
				i++;
			}
			if (xy.length != j)
				error('Counting error');
		},

		read : function() {
			var parts = [], sizes = this.readPartSizes(), points = this.readPoints();
			for (var i = 0, n = sizes.length - 1; i < n; i++) {
				parts.push(points.splice(0, sizes[i]));
			}
			parts.push(points);
			return parts;
		}
	};

	var mProto = {
		_mpos : function() {
			var pos = this._xypos() + this.pointCount * 16;
			if (hasZ) {
				pos += this.pointCount * 8 + mzRangeBytes;
			}
			return pos;
		},

		readMBounds : function() {
			return this.hasM() ? this._data().skipBytes(this._mpos()).readFloat64Array(2) : null;
		},

		// TODO: group into parts, like readCoords()
		readM : function() {
			return this.hasM() ? this._data().skipBytes(this._mpos() + mzRangeBytes).readFloat64Array(this.pointCount)
					: null;
		},

		// Test if this record contains M data
		// (according to the Shapefile spec, M data is optional in a record)
		//
		hasM : function() {
			var bytesWithoutM = this._mpos(), bytesWithM = bytesWithoutM + this.pointCount * 8 + mzRangeBytes;
			if (this.byteLength == bytesWithoutM) {
				return false;
			} else if (this.byteLength == bytesWithM) {
				return true;
			} else {
				error("#hasM() Counting error");
			}
		}
	};

	var zProto = {
		_zpos : function() {
			return this._xypos() + this.pointCount * 16;
		},

		readZBounds : function() {
			return this._data().skipBytes(this._zpos()).readFloat64Array(2);
		},

		// TODO: group into parts, like readCoords()
		readZ : function() {
			return this._data().skipBytes(this._zpos() + mzRangeBytes).readFloat64Array(this.pointCount);
		}
	};

	if (singlePoint) {
		MapShaper.utils.extend(proto, singlePointProto);
	} else {
		MapShaper.utils.extend(proto, multiCoordProto);
	}
	if (hasZ)
		MapShaper.utils.extend(proto, zProto);
	if (hasM)
		MapShaper.utils.extend(proto, mProto);

	constructor.prototype = proto;
	proto.constructor = constructor;
	return constructor;
}

// Same interface as FileBytes, for reading from a buffer instead of a file.
function BufferBytes(buf) {
	var bin = new BinArray(buf), bufSize = bin.size();
	this.readBytes = function(len, offset) {
		if (bufSize < offset + len)
			error("Out-of-range error");
		bin.position(offset);
		return bin;
	};

	this.size = function() {
		return bufSize;
	};

	this.close = function() {
	};
}

// Read a binary file in chunks, to support files > 1GB in Node
function FileBytes(path) {
	var DEFAULT_BUF_SIZE = 0xffffff, // 16 MB
	fs = require('fs'), fileSize = cli.fileSize(path), cacheOffs = 0, cache, fd;

	this.readBytes = function(len, start) {
		if (fileSize < start + len)
			error("Out-of-range error");
		if (!cache || start < cacheOffs || start + len > cacheOffs + cache.size()) {
			updateCache(len, start);
		}
		cache.position(start - cacheOffs);
		return cache;
	};

	this.size = function() {
		return fileSize;
	};

	this.close = function() {
		if (fd) {
			fs.closeSync(fd);
			fd = null;
			cache = null;
			cacheOffs = 0;
		}
	};

	function updateCache(len, start) {
		var headroom = fileSize - start, bufSize = Math.min(headroom, Math.max(DEFAULT_BUF_SIZE, len)), buf = new Buffer(
				bufSize), bytesRead;
		if (!fd)
			fd = fs.openSync(path, 'r');
		bytesRead = fs.readSync(fd, buf, 0, bufSize, start);
		if (bytesRead < bufSize)
			error("Error reading file");
		cacheOffs = start;
		cache = new BinArray(buf);
	}
}
