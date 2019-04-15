var Env = (function() {
	var inNode = typeof module !== 'undefined' && !!module.exports;
	var inBrowser = typeof window !== 'undefined' && !inNode;
	var inPhantom = inBrowser && !!(window.phantom && window.phantom.exit);
	var ieVersion = inBrowser && /MSIE ([0-9]+)/.exec(navigator.appVersion) && parseInt(RegExp.$1) || NaN;

	return {
		iPhone : inBrowser && !!(navigator.userAgent.match(/iPhone/i)),
		iPad : inBrowser && !!(navigator.userAgent.match(/iPad/i)),
		canvas : inBrowser && !!document.createElement('canvas').getContext,
		inNode : inNode,
		inPhantom : inPhantom,
		inBrowser : inBrowser,
		ieVersion : ieVersion,
		ie : !isNaN(ieVersion)
	};
})();

(function() {
	var MapShaper = {};
	if (typeof window != 'undefined') {
		window.MapShaper = MapShaper;
	}

	var utils = {
		getUniqueName : function(prefix) {
			var n = Utils.__uniqcount || 0;
			Utils.__uniqcount = n + 1;
			return (prefix || "__id_") + n;
		},

		isFunction : function(obj) {
			return typeof obj == 'function';
		},

		isObject : function(obj) {
			return obj === Object(obj); // via underscore
		},

		clamp : function(val, min, max) {
			return val < min ? min : (val > max ? max : val);
		},

		interpolate : function(val1, val2, pct) {
			return val1 * (1 - pct) + val2 * pct;
		},

		isArray : function(obj) {
			return Array.isArray(obj);
		},

		// NaN -> true
		isNumber : function(obj) {
			// return toString.call(obj) == '[object Number]'; // ie8 breaks?
			return obj != null && obj.constructor == Number;
		},

		isInteger : function(obj) {
			return Utils.isNumber(obj) && ((obj | 0) === obj);
		},

		isString : function(obj) {
			return obj != null && obj.toString === String.prototype.toString;
			// TODO: replace w/ something better.
		},

		isBoolean : function(obj) {
			return obj === true || obj === false;
		},

		// Convert an array-like object to an Array, or make a copy if @obj is
		// an Array
		toArray : function(obj) {
			var arr;
			if (!Utils.isArrayLike(obj))
				error("Utils.toArray() requires an array-like object");
			try {
				arr = Array.prototype.slice.call(obj, 0); // breaks in ie8
			} catch (e) {
				// support ie8
				arr = [];
				for (var i = 0, n = obj.length; i < n; i++) {
					arr[i] = obj[i];
				}
			}
			return arr;
		},

		// Array like: has length property, is numerically indexed and mutable.
		// TODO: try to detect objects with length property but no indexed data
		// elements
		isArrayLike : function(obj) {
			if (!obj)
				return false;
			if (Utils.isArray(obj))
				return true;
			if (Utils.isString(obj))
				return false;
			if (obj.length === 0)
				return true;
			if (obj.length > 0)
				return true;
			return false;
		},

		// See
		// https://raw.github.com/kvz/phpjs/master/functions/strings/addslashes.js
		addslashes : function(str) {
			return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
		},

		// Escape a literal string to use in a regexp.
		// Ref.: http://simonwillison.net/2006/Jan/20/escape/
		regexEscape : function(str) {
			return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
		},

		defaults : function(dest) {
			for (var i = 1, n = arguments.length; i < n; i++) {
				var src = arguments[i] || {};
				for ( var key in src) {
					if (key in dest === false && src.hasOwnProperty(key)) {
						dest[key] = src[key];
					}
				}
			}
			return dest;
		},

		extend : function(o) {
			var dest = o || {}, n = arguments.length, key, i, src;
			for (i = 1; i < n; i++) {
				src = arguments[i] || {};
				for (key in src) {
					if (src.hasOwnProperty(key)) {
						dest[key] = src[key];
					}
				}
			}
			return dest;
		},

		// Pseudoclassical inheritance
		//
		// Inherit from a Parent function:
		// Utils.inherit(Child, Parent);
		// Call parent's constructor (inside child constructor):
		// this.__super__([args...]);
		inherit : function(targ, src) {
			var f = function() {
				if (this.__super__ == f) {
					// add __super__ of parent to front of lookup chain
					// so parent class constructor can call its parent using
					// this.__super__
					this.__super__ = src.prototype.__super__;
					// call parent constructor function. this.__super__ now
					// points to parent-of-parent
					src.apply(this, arguments);
					// remove temp __super__, expose targ.prototype.__super__
					// again
					delete this.__super__;
				}
			};

			f.prototype = src.prototype || src; // added || src to allow
			// inheriting from objects as
			// well as functions
			// Extend targ prototype instead of wiping it out --
			// in case inherit() is called after targ.prototype = {stuff};
			// statement
			targ.prototype = Utils.extend(new f(), targ.prototype); //
			targ.prototype.constructor = targ;
			targ.prototype.__super__ = f;
		},

		// Inherit from a parent, call the parent's constructor, optionally
		// extend
		// prototype with optional additional arguments
		subclass : function(parent) {
			var child = function() {
				this.__super__.apply(this, Utils.toArray(arguments));
			};
			Utils.inherit(child, parent);
			for (var i = 1; i < arguments.length; i++) {
				Utils.extend(child.prototype, arguments[i]);
			}
			return child;
		}

	};

	var Utils = utils;

	MapShaper.utils = utils;

	utils.getFileExtension = function(path) {
		return utils.parseLocalPath(path).extension;
	};

	utils.getPathSep = function(path) {
		// TODO: improve
		return path.indexOf('/') == -1 && path.indexOf('\\') != -1 ? '\\' : '/';
	};

	utils.pluck = function(arr, key) {
		return arr.map(function(obj) {
			return obj[key];
		});
	};

	utils.contains = function(container, item) {
		if (utils.isString(container)) {
			return container.indexOf(item) != -1;
		} else if (utils.isArrayLike(container)) {
			return utils.indexOf(container, item) != -1;
		}
		error("Expected Array or String argument");
	};

	utils.copyElements = function(src, i, dest, j, n, rev) {
		if (src === dest && j > i)
			error("copy error");
		var inc = 1, offs = 0;
		if (rev) {
			inc = -1;
			offs = n - 1;
		}
		for (var k = 0; k < n; k++, offs += inc) {
			dest[k + j] = src[i + offs];
		}
	};

	utils.indexOf = function(arr, item, prop) {
		if (prop)
			error("utils.indexOf() No longer supports property argument");
		var nan = !(item === item);
		for (var i = 0, len = arr.length || 0; i < len; i++) {
			if (arr[i] === item)
				return i;
			if (nan && !(arr[i] === arr[i]))
				return i;
		}
		return -1;
	};

	utils.isFiniteNumber = function(val) {
		return val === 0 || !!val && val.constructor == Number && val !== Infinity && val !== -Infinity;
	};

	utils.extendBuffer = function(src, newLen, copyLen) {
		var len = Math.max(src.length, newLen);
		var n = copyLen || src.length;
		var dest = new src.constructor(len);
		utils.copyElements(src, 0, dest, 0, n);
		return dest;
	};

	utils.parseLocalPath = function(path) {
		var obj = {}, sep = utils.getPathSep(path), parts = path.split(sep), i;

		if (parts.length == 1) {
			obj.filename = parts[0];
			obj.directory = "";
		} else {
			obj.filename = parts.pop();
			obj.directory = parts.join(sep);
		}
		i = obj.filename.lastIndexOf('.');
		if (i > -1) {
			obj.extension = obj.filename.substr(i + 1);
			obj.basename = obj.filename.substr(0, i);
			obj.pathbase = path.substr(0, path.lastIndexOf('.'));
		} else {
			obj.extension = "";
			obj.basename = obj.filename;
			obj.pathbase = path;
		}
		return obj;
	};

	MapShaper.stop = function(msg) {
		alert(msg);
		throw new Error(msg);
	};
	MapShaper.error = function() {
		var msg = utils.toArray(arguments).join(' ');
		throw new Error(msg);
	};

	MapShaper.isBinaryFile = function(path) {
		var ext = utils.getFileExtension(path).toLowerCase();
		return ext == 'shp' || ext == 'dbf' || ext == 'zip'; // GUI accepts
		// zip files
	};

	MapShaper.guessInputType = function(file, content) {
		return MapShaper.guessInputFileType(file) || MapShaper.guessInputContentType(content);
	};

	MapShaper.guessInputFileType = function(file) {
		var ext = utils.getFileExtension(file || '').toLowerCase(), type = null;
		if (ext == 'dbf' || ext == 'shp' || ext == 'prj') {
			type = ext;
		} else if (/json$/.test(ext)) {
			type = 'json';
		}
		return type;
	};

	MapShaper.getUniqFieldNames = function(fields, maxLen) {
		var used = {};
		return fields.map(function(name) {
			var i = 0, validName;
			do {
				validName = MapShaper.adjustFieldName(name, maxLen, i);
				i++;
			} while (validName in used);
			used[validName] = true;
			return validName;
		});
	};
	
	MapShaper.standardizeEncodingName= function(enc) {
		  return enc.toLowerCase().replace(/[_-]/g, '');
		};

	// Truncate and/or uniqify a name (if relevant params are present)
	MapShaper.adjustFieldName = function(name, maxLen, i) {
		var name2, suff;
		maxLen = maxLen || 256;
		if (!i) {
			name2 = name.substr(0, maxLen);
		} else {
			suff = String(i);
			if (suff.length == 1) {
				suff = '_' + suff;
			}
			name2 = name.substr(0, maxLen - suff.length) + suff;
		}
		return name2;
	};

	MapShaper.detectEncoding = function(samples) {
		var encoding = null;
		if (MapShaper.looksLikeUtf8(samples)) {
			encoding = 'utf8';
		} else if (MapShaper.looksLikeWin1252(samples)) {
			// Win1252 is the same as Latin1, except it replaces a block of
			// control
			// characters with n-dash, Euro and other glyphs. Encountered
			// in-the-wild
			// in Natural Earth (airports.dbf uses n-dash).
			encoding = 'win1252';
		}
		return encoding;
	};

	MapShaper.looksLikeWin1252 = function(samples) {
		var ascii = 'abcdefghijklmnopqrstuvwxyz0123456789.\'"?+-\n,:;/|_$% ', extended = 'ßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ°–', // common
		// //
		// extended
		str = MapShaper.decodeSamples('win1252', samples), asciiScore = MapShaper.getCharScore(str, ascii), totalScore = MapShaper
				.getCharScore(str, extended + ascii);
		return totalScore > 0.97 && asciiScore > 0.7;
	};

	MapShaper.decodeSamples = function(enc, samples) {
		return samples.map(function(buf) {
			return MapShaper.decodeString(buf, enc).trim();
		}).join('\n');
	};

	MapShaper.decodeString = function(buf, encoding) {
		var iconv = require('iconv-lite'), str = iconv.decode(buf, encoding);
		// remove BOM if present
		if (str.charCodeAt(0) == 0xfeff) {
			str = str.substr(1);
		}
		return str;
	};

	// Accept string if it doesn't contain the "replacement character"
	MapShaper.looksLikeUtf8 = function(samples) {
		var str = MapShaper.decodeSamples('utf8', samples);
		return str.indexOf('\ufffd') == -1;
	};

	MapShaper.getWorldBounds = function(e) {
		e = utils.isFiniteNumber(e) ? e : 1e-10;
		return [ -180 + e, -90 + e, 180 - e, 90 - e ];
	};

	MapShaper.probablyDecimalDegreeBounds = function(b) {
		var world = MapShaper.getWorldBounds(-1), // add a bit of excess
		bbox = (b instanceof Bounds) ? b.toArray() : b;
		return containsBounds(world, bbox);
	};

	MapShaper.forEachPathSegment = function(shape, arcs, cb) {
		MapShaper.forEachArcId(shape, function(arcId) {
			arcs.forEachArcSegment(arcId, cb);
		});
	};

	MapShaper.forEachArcId = function(arr, cb) {
		var item;
		for (var i = 0; i < arr.length; i++) {
			item = arr[i];
			if (item instanceof Array) {
				MapShaper.forEachArcId(item, cb);
			} else if (utils.isInteger(item)) {
				var val = cb(item);
				if (val !== void 0) {
					arr[i] = val;
				}
			} else if (item) {
				error("Non-integer arc id in:", arr);
			}
		}
	};

	MapShaper.guessInputContentType = function(content) {
		var type = null;
		if (utils.isString(content)) {
			type = MapShaper.stringLooksLikeJSON(content) ? 'json' : 'text';
		} else if (utils.isObject(content) && content.type || utils.isArray(content)) {
			type = 'json';
		}
		return type;
	};

	MapShaper.stringLooksLikeJSON = function(str) {
		return /^\s*[{[]/.test(String(str));
	};

	MapShaper.importFileContent = function(content, filename, opts) {
		var type = MapShaper.guessInputType(filename, content), input = {};
		input[type] = {
			filename : filename,
			content : content
		};
		return MapShaper.importContent(input, opts);
	};

	MapShaper.importContent = function(obj, opts) {
		var dataset, content, fileFmt, data;
		opts = opts || {};
		if (obj.json) {

		} else if (obj.shp) {
			fileFmt = 'shapefile';
			data = obj.shp;
			dataset = MapShaper.importShapefile(obj, opts);
		}
		if (!dataset) {
			stop("Missing an expected input type");
		}
		if (data.filename) {
			dataset.info.input_files = [ data.filename ];
		}
		dataset.info.input_format = fileFmt;
		return dataset;
	};

	MapShaper.importShapefile = function(obj, opts) {
		var shpSrc = obj.shp.content || obj.shp.filename, // content may be
		dataset = MapShaper.importShp(shpSrc, opts), lyr = dataset.layers[0], dbf;
		if (obj.dbf) {
			lyr.data = new MapShaper.ShapefileTable(content, "utf8");
			if (lyr.shapes && lyr.data.size() != lyr.shapes.length) {
				message("[shp] Mismatched .dbf and .shp record count -- possible data loss.");
			}
		}
		if (obj.prj) {
			dataset.info.input_prj = obj.prj.content;
		}
		return dataset;
	};

	MapShaper.isSupportedShapefileType = function(t) {
		return utils.contains([ 0, 1, 3, 5, 8, 11, 13, 15, 18, 21, 23, 25, 28 ], t);
	};

	MapShaper.forEachPoint = function(shapes, cb) {
		shapes.forEach(function(shape, id) {
			var n = shape ? shape.length : 0;
			for (var i = 0; i < n; i++) {
				cb(shape[i], id);
			}
		});
	};

	MapShaper.calcArcBounds = function(xx, yy, start, len) {
		var i = start | 0, n = isNaN(len) ? xx.length - i : len + i, x, y, xmin, ymin, xmax, ymax;
		if (n > 0) {
			xmin = xmax = xx[i];
			ymin = ymax = yy[i];
		}
		for (i++; i < n; i++) {
			x = xx[i];
			y = yy[i];
			if (x < xmin)
				xmin = x;
			if (x > xmax)
				xmax = x;
			if (y < ymin)
				ymin = y;
			if (y > ymax)
				ymax = y;
		}
		return [ xmin, ymin, xmax, ymax ];
	};

	MapShaper.cleanShapes = function(shapes, arcs, type) {
		for (var i = 0, n = shapes.length; i < n; i++) {
			shapes[i] = MapShaper.cleanShape(shapes[i], arcs, type);
		}
	};

	// Remove defective arcs and zero-area polygon rings
	// Remove simple polygon spikes of form: [..., id, ~id, ...]
	// Don't remove duplicate points
	// Don't check winding order of polygon rings
	MapShaper.cleanShape = function(shape, arcs, type) {
		return MapShaper.editPaths(shape, function(path) {
			var cleaned = MapShaper.cleanPath(path, arcs);
			if (type == 'polygon' && cleaned) {
				MapShaper.removeSpikesInPath(cleaned); // assumed by
				// divideArcs()
				if (geom.getPlanarPathArea(cleaned, arcs) === 0) {
					cleaned = null;
				}
			}
			return cleaned;
		});
	};

	MapShaper.cleanPath = function(path, arcs) {
		var nulls = 0;
		for (var i = 0, n = path.length; i < n; i++) {
			if (arcs.arcIsDegenerate(path[i])) {
				nulls++;
				path[i] = null;
			}
		}
		return nulls > 0 ? path.filter(function(id) {
			return id !== null;
		}) : path;
	};

	// Remove pairs of ids where id[n] == ~id[n+1] or id[0] == ~id[n-1];
	// (in place)
	MapShaper.removeSpikesInPath = function(ids) {
		var n = ids.length;
		if (n >= 2) {
			if (ids[0] == ~ids[n - 1]) {
				ids.pop();
				ids.shift();
			} else {
				for (var i = 1; i < n; i++) {
					if (ids[i - 1] == ~ids[i]) {
						ids.splice(i - 1, 2);
						break;
					}
				}
			}
			if (ids.length < n) {
				MapShaper.removeSpikesInPath(ids);
			}
		}
	};

	MapShaper.editPaths = function(paths, cb) {
		if (!paths)
			return null; // null shape
		if (!utils.isArray(paths))
			error("[editPaths()] Expected an array, found:", arr);
		var nulls = 0, n = paths.length, retn;

		for (var i = 0; i < n; i++) {
			retn = cb(paths[i], i, paths);
			if (retn === null) {
				nulls++;
				paths[i] = null;
			} else if (utils.isArray(retn)) {
				paths[i] = retn;
			}
		}
		if (nulls == n) {
			return null;
		} else if (nulls > 0) {
			return paths.filter(function(ids) {
				return !!ids;
			});
		} else {
			return paths;
		}
	};

	MapShaper.getShapefileType = function(type) {
		return {
			polygon : ShpType.POLYGON,
			polyline : ShpType.POLYLINE,
			point : ShpType.MULTIPOINT
		// TODO: use POINT when possible
		}[type] || ShpType.NULL;
	};

	MapShaper.translateShapefileType = function(shpType) {
		if (utils.contains([ ShpType.POLYGON, ShpType.POLYGONM, ShpType.POLYGONZ ], shpType)) {
			return 'polygon';
		} else if (utils.contains([ ShpType.POLYLINE, ShpType.POLYLINEM, ShpType.POLYLINEZ ], shpType)) {
			return 'polyline';
		} else if (utils.contains([ ShpType.POINT, ShpType.POINTM, ShpType.POINTZ, ShpType.MULTIPOINT,
				ShpType.MULTIPOINTM, ShpType.MULTIPOINTZ ], shpType)) {
			return 'point';
		}
		return null;
	};

	MapShaper.importShp = function(src, opts) {
		var reader = new ShpReader(src), shpType = reader.type(), type = MapShaper.translateShapefileType(shpType), importOpts = utils
				.defaults({
					type : type,
					reserved_points : Math.round(reader.header().byteLength / 16)
				}, opts), importer = new PathImporter(importOpts);

		if (!MapShaper.isSupportedShapefileType(shpType)) {
			stop("Unsupported Shapefile type:", shpType);
		}
		if (ShpType.isZType(shpType)) {
			message("Warning: Shapefile Z data will be lost.");
		} else if (ShpType.isMType(shpType)) {
			message("Warning: Shapefile M data will be lost.");
		}

		// TODO: test cases: null shape; non-null shape with no valid parts
		reader.forEachShape(function(shp) {
			importer.startShape();
			if (shp.isNull) {
				// skip
			} else if (type == 'point') {
				importer.importPoints(shp.readPoints());
			} else {
				shp.stream(importer);
			}
		});

		return importer.done();
	};

	function PathImportStream(drain) {
		var buflen = 10000, xx = new Float64Array(buflen), yy = new Float64Array(buflen), i = 0;

		this.endPath = function() {
			drain(xx, yy, i);
			i = 0;
		};

		this.addPoint = function(x, y) {
			if (i >= buflen) {
				buflen = Math.ceil(buflen * 1.3);
				xx = utils.extendBuffer(xx, buflen);
				yy = utils.extendBuffer(yy, buflen);
			}
			xx[i] = x;
			yy[i] = y;
			i++;
		};
	}

	function PathImporter(opts) {
		var bufSize = opts.reserved_points > 0 ? opts.reserved_points : 20000, xx = new Float64Array(bufSize), yy = new Float64Array(
				bufSize), shapes = [], nn = [], collectionType = opts.type || null, // possible
		// values:
		// polygon,
		// polyline,
		// point
		round = null, pathId = -1, shapeId = -1, pointId = 0, dupeCount = 0, skippedPathCount = 0, openRingCount = 0;

		if (opts.precision) {
			round = getRoundingFunction(opts.precision);
		}

		// mix in #addPoint() and #endPath() methods
		utils.extend(this, new PathImportStream(importPathCoords));

		this.startShape = function() {
			shapes[++shapeId] = null;
		};

		this.importLine = function(points) {
			setShapeType('polyline');
			this.importPath(points);
		};

		this.importPoints = function(points) {
			setShapeType('point');
			if (round) {
				points.forEach(function(p) {
					p[0] = round(p[0]);
					p[1] = round(p[1]);
				});
			}
			points.forEach(appendToShape);
		};

		this.importRing = function(points, isHole) {
			var area = geom.getPlanarPathArea2(points);
			setShapeType('polygon');
			if (isHole === true && area > 0 || isHole === false && area < 0) {
				verbose("Warning: reversing", isHole ? "a CW hole" : "a CCW ring");
				points.reverse();
			}
			this.importPath(points);
		};

		// Import an array of [x, y] Points
		this.importPath = function importPath(points) {
			var p;
			for (var i = 0, n = points.length; i < n; i++) {
				p = points[i];
				this.addPoint(p[0], p[1]);
			}
			this.endPath();
		};

		// Return topological shape data
		// Apply any requested snapping and rounding
		// Remove duplicate points, check for ring inversions
		//
		this.done = function() {
			var arcs;
			var lyr = {
				name : ''
			};

			if (collectionType == 'polygon' || collectionType == 'polyline') {

				/*if (dupeCount > 0) {
					verbose(utils.format("Removed %,d duplicate point%s", dupeCount, utils.pluralSuffix(dupeCount)));
				}
				if (skippedPathCount > 0) {
					// TODO: consider showing details about type of error
					message(utils.format("Removed %,d path%s with defective geometry", skippedPathCount, utils
							.pluralSuffix(skippedPathCount)));
				}
				if (openRingCount > 0) {
					message(utils.format("Closed %,d open polygon ring%s", openRingCount, utils
							.pluralSuffix(openRingCount)));
				}*/

				if (pointId > 0) {
					if (pointId < xx.length) {
						xx = xx.subarray(0, pointId);
						yy = yy.subarray(0, pointId);
					}
					arcs = new ArcCollection(nn, xx, yy);

					if (opts.auto_snap || opts.snap_interval) {
						MapShaper.snapCoords(arcs, opts.snap_interval);
					}
					// Detect and handle some geometry problems
					// TODO: print message summarizing any changes
					MapShaper.cleanShapes(shapes, arcs, collectionType);
				} else {
					console.log("No geometries were imported");
					collectionType = null;
				}
			} else if (collectionType == 'point' || collectionType === null) {
				// pass
			} else {
				MapShaper.error("Unexpected collection type:", collectionType);
			}

			// If shapes are all null, don't add a shapes array or geometry_type
			if (collectionType) {
				lyr.geometry_type = collectionType;
				lyr.shapes = shapes;
			}

			return {
				arcs : arcs || null,
				info : {},
				layers : [ lyr ]
			};
		};

		function setShapeType(t) {
			if (!collectionType) {
				collectionType = t;
			} else if (t != collectionType) {
				stop("[PathImporter] Mixed feature types are not allowed");
			}
		}

		function checkBuffers(needed) {
			if (needed > xx.length) {
				var newLen = Math.max(needed, Math.ceil(xx.length * 1.5));
				xx = utils.extendBuffer(xx, newLen, pointId);
				yy = utils.extendBuffer(yy, newLen, pointId);
			}
		}

		function appendToShape(part) {
			var currShape = shapes[shapeId] || (shapes[shapeId] = []);
			currShape.push(part);
		}

		function appendPath(n) {
			pathId++;
			nn[pathId] = n;
			appendToShape([ pathId ]);
		}

		function importPathCoords(xsrc, ysrc, n) {
			var count = 0;
			var x, y, prevX, prevY;
			checkBuffers(pointId + n);
			for (var i = 0; i < n; i++) {
				x = xsrc[i];
				y = ysrc[i];
				if (round) {
					x = round(x);
					y = round(y);
				}
				if (i > 0 && x == prevX && y == prevY) {
					dupeCount++;
				} else {
					xx[pointId] = x;
					yy[pointId] = y;
					pointId++;
					count++;
				}
				prevY = y;
				prevX = x;
			}

			// check for open rings
			if (collectionType == 'polygon' && count > 0) {
				if (xsrc[0] != xsrc[n - 1] || ysrc[0] != ysrc[n - 1]) {
					checkBuffers(pointId + 1);
					xx[pointId] = xsrc[0];
					yy[pointId] = ysrc[0];
					openRingCount++;
					pointId++;
					count++;
				}
			}

			appendPath(count);
		}

	}

	function ArcCollection() {
		var _xx, _yy, // coordinates data
		_ii, _nn, // indexes, sizes
		_zz, _zlimit = 0, // simplification
		_bb, _allBounds, // bounding boxes
		_arcIter, _filteredArcIter; // path iterators

		if (arguments.length == 1) {
			initLegacyArcs(arguments[0]); // want to phase this out
		} else if (arguments.length == 3) {
			initXYData.apply(this, arguments);
		} else {
			error("ArcCollection() Invalid arguments");
		}

		function initLegacyArcs(arcs) {
			var xx = [], yy = [];
			var nn = arcs.map(function(points) {
				var n = points ? points.length : 0;
				for (var i = 0; i < n; i++) {
					xx.push(points[i][0]);
					yy.push(points[i][1]);
				}
				return n;
			});
			initXYData(nn, xx, yy);
		}

		function initXYData(nn, xx, yy) {
			var size = nn.length;
			if (nn instanceof Array)
				nn = new Uint32Array(nn);
			if (xx instanceof Array)
				xx = new Float64Array(xx);
			if (yy instanceof Array)
				yy = new Float64Array(yy);
			_xx = xx;
			_yy = yy;
			_nn = nn;
			_zz = null;
			_filteredArcIter = null;

			// generate array of starting idxs of each arc
			_ii = new Uint32Array(size);
			for (var idx = 0, j = 0; j < size; j++) {
				_ii[j] = idx;
				idx += nn[j];
			}

			if (idx != _xx.length || _xx.length != _yy.length) {
				error("ArcCollection#initXYData() Counting error");
			}

			initBounds();
			// Pre-allocate some path iterators for repeated use.
			_arcIter = new ArcIter(_xx, _yy);
			return this;
		}

		function initZData(zz) {
			if (!zz) {
				_zz = null;
				_filteredArcIter = null;
			} else {
				if (zz.length != _xx.length)
					error("ArcCollection#initZData() mismatched arrays");
				if (zz instanceof Array)
					zz = new Float64Array(zz);
				_zz = zz;
				_filteredArcIter = new FilteredArcIter(_xx, _yy, _zz);
			}
		}

		function initBounds() {
			var data = calcArcBounds(_xx, _yy, _nn);
			_bb = data.bb;
			_allBounds = data.bounds;
		}

		function calcArcBounds(xx, yy, nn) {
			var numArcs = nn.length, bb = new Float64Array(numArcs * 4), bounds = new Bounds(), arcOffs = 0, arcLen, j, b;
			for (var i = 0; i < numArcs; i++) {
				arcLen = nn[i];
				if (arcLen > 0) {
					j = i * 4;
					b = MapShaper.calcArcBounds(xx, yy, arcOffs, arcLen);
					bb[j++] = b[0];
					bb[j++] = b[1];
					bb[j++] = b[2];
					bb[j] = b[3];
					arcOffs += arcLen;
					bounds.mergeBounds(b);
				}
			}
			return {
				bb : bb,
				bounds : bounds
			};
		}

		this.updateVertexData = function(nn, xx, yy, zz) {
			initXYData(nn, xx, yy);
			initZData(zz || null);
		};

		// Give access to raw data arrays...
		this.getVertexData = function() {
			return {
				xx : _xx,
				yy : _yy,
				zz : _zz,
				bb : _bb,
				nn : _nn,
				ii : _ii
			};
		};

		this.getCopy = function() {
			var copy = new ArcCollection(new Int32Array(_nn), new Float64Array(_xx), new Float64Array(_yy));
			if (_zz)
				copy.setThresholds(new Float64Array(_zz));
			return copy;
		};

		function getFilteredPointCount() {
			var zz = _zz, z = _zlimit;
			if (!zz || !z)
				return this.getPointCount();
			var count = 0;
			for (var i = 0, n = zz.length; i < n; i++) {
				if (zz[i] >= z)
					count++;
			}
			return count;
		}

		function getFilteredVertexData() {
			var len2 = getFilteredPointCount();
			var arcCount = _nn.length;
			var xx2 = new Float64Array(len2), yy2 = new Float64Array(len2), zz2 = new Float64Array(len2), nn2 = new Int32Array(
					arcCount), i = 0, i2 = 0, n, n2;

			for (var arcId = 0; arcId < arcCount; arcId++) {
				n2 = 0;
				n = _nn[arcId];
				for (var end = i + n; i < end; i++) {
					if (_zz[i] >= _zlimit) {
						xx2[i2] = _xx[i];
						yy2[i2] = _yy[i];
						zz2[i2] = _zz[i];
						i2++;
						n2++;
					}
				}
				if (n2 < 2)
					error("Collapsed arc"); // endpoints should be z == Infinity
				nn2[arcId] = n2;
			}
			return {
				xx : xx2,
				yy : yy2,
				zz : zz2,
				nn : nn2
			};
		}

		this.getFilteredCopy = function() {
			if (!_zz || _zlimit === 0)
				return this.getCopy();
			var data = getFilteredVertexData();
			var copy = new ArcCollection(data.nn, data.xx, data.yy);
			copy.setThresholds(data.zz);
			return copy;
		};

		// Return arcs as arrays of [x, y] points (intended for testing).
		this.toArray = function() {
			var arr = [];
			this.forEach(function(iter) {
				var arc = [];
				while (iter.hasNext()) {
					arc.push([ iter.x, iter.y ]);
				}
				arr.push(arc);
			});
			return arr;
		};

		this.toString = function() {
			return JSON.stringify(this.toArray());
		};

		// @cb function(i, j, xx, yy)
		this.forEachArcSegment = function(arcId, cb) {
			var fw = arcId >= 0, absId = fw ? arcId : ~arcId, zlim = this.getRetainedInterval(), n = _nn[absId], step = fw ? 1
					: -1, v1 = fw ? _ii[absId] : _ii[absId] + n - 1, v2 = v1, count = 0;

			for (var j = 1; j < n; j++) {
				v2 += step;
				if (zlim === 0 || _zz[v2] >= zlim) {
					cb(v1, v2, _xx, _yy);
					v1 = v2;
					count++;
				}
			}
			return count;
		};

		// @cb function(i, j, xx, yy)
		this.forEachSegment = function(cb) {
			var count = 0;
			for (var i = 0, n = this.size(); i < n; i++) {
				count += this.forEachArcSegment(i, cb);
			}
			return count;
		};

		this.transformPoints = function(f) {
			var xx = _xx, yy = _yy, p;
			for (var i = 0, n = xx.length; i < n; i++) {
				p = f(xx[i], yy[i]);
				xx[i] = p[0];
				yy[i] = p[1];
			}
			initBounds();
		};

		// Return an ArcIter object for each path in the dataset
		//
		this.forEach = function(cb) {
			for (var i = 0, n = this.size(); i < n; i++) {
				cb(this.getArcIter(i), i);
			}
		};

		// Iterate over arcs with access to low-level data
		//
		this.forEach2 = function(cb) {
			for (var arcId = 0, n = this.size(); arcId < n; arcId++) {
				cb(_ii[arcId], _nn[arcId], _xx, _yy, _zz, arcId);
			}
		};

		this.forEach3 = function(cb) {
			var start, end, xx, yy, zz;
			for (var arcId = 0, n = this.size(); arcId < n; arcId++) {
				start = _ii[arcId];
				end = start + _nn[arcId];
				xx = _xx.subarray(start, end);
				yy = _yy.subarray(start, end);
				if (_zz)
					zz = _zz.subarray(start, end);
				cb(xx, yy, zz, arcId);
			}
		};

		// Remove arcs that don't pass a filter test and re-index arcs
		// Return array mapping original arc ids to re-indexed ids. If arr[n] ==
		// -1
		// then arc n was removed. arr[n] == m indicates that the arc at n was
		// moved to index m.
		// Return null if no arcs were re-indexed (and no arcs were removed)
		//
		this.filter = function(cb) {
			var map = new Int32Array(this.size()), goodArcs = 0, goodPoints = 0;
			for (var i = 0, n = this.size(); i < n; i++) {
				if (cb(this.getArcIter(i), i)) {
					map[i] = goodArcs++;
					goodPoints += _nn[i];
				} else {
					map[i] = -1;
				}
			}
			if (goodArcs === this.size()) {
				return null;
			} else {
				condenseArcs(map);
				if (goodArcs === 0) {
					// no remaining arcs
				}
				return map;
			}
		};

		function condenseArcs(map) {
			var goodPoints = 0, goodArcs = 0, copyElements = utils.copyElements, k, arcLen;
			for (var i = 0, n = map.length; i < n; i++) {
				k = map[i];
				arcLen = _nn[i];
				if (k > -1) {
					copyElements(_xx, _ii[i], _xx, goodPoints, arcLen);
					copyElements(_yy, _ii[i], _yy, goodPoints, arcLen);
					if (_zz)
						copyElements(_zz, _ii[i], _zz, goodPoints, arcLen);
					_nn[k] = arcLen;
					goodPoints += arcLen;
					goodArcs++;
				}
			}

			initXYData(_nn.subarray(0, goodArcs), _xx.subarray(0, goodPoints), _yy.subarray(0, goodPoints));
			if (_zz)
				initZData(_zz.subarray(0, goodPoints));
		}

		this.dedupCoords = function() {
			var arcId = 0, i = 0, i2 = 0, arcCount = this.size(), zz = _zz, arcLen, arcLen2;
			while (arcId < arcCount) {
				arcLen = _nn[arcId];
				arcLen2 = MapShaper.dedupArcCoords(i, i2, arcLen, _xx, _yy, zz);
				_nn[arcId] = arcLen2;
				i += arcLen;
				i2 += arcLen2;
				arcId++;
			}
			if (i > i2) {
				initXYData(_nn, _xx.subarray(0, i2), _yy.subarray(0, i2));
				if (zz)
					initZData(zz.subarray(0, i2));
			}
			return i - i2;
		};

		this.getVertex = function(arcId, nth) {
			var i = this.indexOfVertex(arcId, nth);
			return {
				x : _xx[i],
				y : _yy[i]
			};
		};

		this.indexOfVertex = function(arcId, nth) {
			var absId = arcId < 0 ? ~arcId : arcId, len = _nn[absId];
			if (nth < 0)
				nth = len + nth;
			if (absId != arcId)
				nth = len - nth - 1;
			if (nth < 0 || nth >= len)
				error("[ArcCollection] out-of-range vertex id");
			return _ii[absId] + nth;
		};

		// Test whether the vertex at index @idx is the endpoint of an arc
		this.pointIsEndpoint = function(idx) {
			var ii = _ii, nn = _nn;
			for (var j = 0, n = ii.length; j < n; j++) {
				if (idx === ii[j] || idx === ii[j] + nn[j] - 1)
					return true;
			}
			return false;
		};

		// Tests if arc endpoints have same x, y coords
		// (arc may still have collapsed);
		this.arcIsClosed = function(arcId) {
			var i = this.indexOfVertex(arcId, 0), j = this.indexOfVertex(arcId, -1);
			return i != j && _xx[i] == _xx[j] && _yy[i] == _yy[j];
		};

		// Tests if first and last segments mirror each other
		// A 3-vertex arc with same endpoints tests true
		this.arcIsLollipop = function(arcId) {
			var len = this.getArcLength(arcId), i, j;
			if (len <= 2 || !this.arcIsClosed(arcId))
				return false;
			i = this.indexOfVertex(arcId, 1);
			j = this.indexOfVertex(arcId, -2);
			return _xx[i] == _xx[j] && _yy[i] == _yy[j];
		};

		this.arcIsDegenerate = function(arcId) {
			var iter = this.getArcIter(arcId);
			var i = 0, x, y;
			while (iter.hasNext()) {
				if (i > 0) {
					if (x != iter.x || y != iter.y)
						return false;
				}
				x = iter.x;
				y = iter.y;
				i++;
			}
			return true;
		};

		this.getArcLength = function(arcId) {
			return _nn[absArcId(arcId)];
		};

		this.getArcIter = function(arcId) {
			var fw = arcId >= 0, i = fw ? arcId : ~arcId, iter = _zz && _zlimit ? _filteredArcIter : _arcIter;
			if (i >= _nn.length) {
				error("#getArcId() out-of-range arc id:", arcId);
			}
			return iter.init(_ii[i], _nn[i], fw, _zlimit);
		};

		this.getShapeIter = function(ids) {
			return new ShapeIter(this).init(ids);
		};

		// Add simplification data to the dataset
		// @thresholds is either a single typed array or an array of arrays of
		// removal thresholds for each arc;
		//
		this.setThresholds = function(thresholds) {
			var n = this.getPointCount(), zz = null;
			if (!thresholds) {
				// nop
			} else if (thresholds.length == n) {
				zz = thresholds;
			} else if (thresholds.length == this.size()) {
				zz = flattenThresholds(thresholds, n);
			} else {
				error("Invalid threshold data");
			}
			initZData(zz);
			return this;
		};

		function flattenThresholds(arr, n) {
			var zz = new Float64Array(n), i = 0;
			arr.forEach(function(arr) {
				for (var j = 0, n = arr.length; j < n; i++, j++) {
					zz[i] = arr[j];
				}
			});
			if (i != n)
				error("Mismatched thresholds");
			return zz;
		}

		// bake in current simplification level, if any
		this.flatten = function() {
			if (_zlimit > 0) {
				var data = getFilteredVertexData();
				this.updateVertexData(data.nn, data.xx, data.yy);
				_zlimit = 0;
			} else {
				_zz = null;
			}
		};

		this.getRetainedInterval = function() {
			return _zlimit;
		};

		this.setRetainedInterval = function(z) {
			_zlimit = z;
			return this;
		};

		this.getRetainedPct = function() {
			return this.getPctByThreshold(_zlimit);
		};

		this.setRetainedPct = function(pct) {
			if (pct >= 1) {
				_zlimit = 0;
			} else {
				_zlimit = this.getThresholdByPct(pct);
				_zlimit = MapShaper.clampIntervalByPct(_zlimit, pct);
			}
			return this;
		};

		// Return array of z-values that can be removed for simplification
		//
		this.getRemovableThresholds = function(nth) {
			if (!_zz)
				error("[arcs] Missing simplification data.");
			var skip = nth | 1, arr = new Float64Array(Math.ceil(_zz.length / skip)), z;
			for (var i = 0, j = 0, n = this.getPointCount(); i < n; i += skip) {
				z = _zz[i];
				if (z != Infinity) {
					arr[j++] = z;
				}
			}
			return arr.subarray(0, j);
		};

		this.getArcThresholds = function(arcId) {
			if (!(arcId >= 0 && arcId < this.size())) {
				error("[arcs] Invalid arc id:", arcId);
			}
			var start = _ii[arcId], end = start + _nn[arcId];
			return _zz.subarray(start, end);
		};

		this.getPctByThreshold = function(val) {
			var arr, rank, pct;
			if (val > 0) {
				arr = this.getRemovableThresholds();
				rank = utils.findRankByValue(arr, val);
				pct = arr.length > 0 ? 1 - (rank - 1) / arr.length : 1;
			} else {
				pct = 1;
			}
			return pct;
		};

		this.getThresholdByPct = function(pct) {
			var tmp = this.getRemovableThresholds(), rank, z;
			if (tmp.length === 0) { // No removable points
				rank = 0;
			} else {
				rank = Math.floor((1 - pct) * (tmp.length + 2));
			}

			if (rank <= 0) {
				z = 0;
			} else if (rank > tmp.length) {
				z = Infinity;
			} else {
				z = utils.findValueByRank(tmp, rank);
			}
			return z;
		};

		this.arcIntersectsBBox = function(i, b1) {
			var b2 = _bb, j = i * 4;
			return b2[j] <= b1[2] && b2[j + 2] >= b1[0] && b2[j + 3] >= b1[1] && b2[j + 1] <= b1[3];
		};

		this.arcIsContained = function(i, b1) {
			var b2 = _bb, j = i * 4;
			return b2[j] >= b1[0] && b2[j + 2] <= b1[2] && b2[j + 1] >= b1[1] && b2[j + 3] <= b1[3];
		};

		this.arcIsSmaller = function(i, units) {
			var bb = _bb, j = i * 4;
			return bb[j + 2] - bb[j] < units && bb[j + 3] - bb[j + 1] < units;
		};

		// TODO: allow datasets in lat-lng coord range to be flagged as planar
		this.isPlanar = function() {
			return !MapShaper.probablyDecimalDegreeBounds(this.getBounds());
		};

		this.size = function() {
			return _ii && _ii.length || 0;
		};

		this.getPointCount = function() {
			return _xx && _xx.length || 0;
		};

		this.getBounds = function() {
			return _allBounds;
		};

		this.getSimpleShapeBounds = function(arcIds, bounds) {
			bounds = bounds || new Bounds();
			for (var i = 0, n = arcIds.length; i < n; i++) {
				this.mergeArcBounds(arcIds[i], bounds);
			}
			return bounds;
		};

		this.getSimpleShapeBounds2 = function(arcIds, arr) {
			var bbox = arr || [], bb = _bb, id = absArcId(arcIds[0]) * 4;
			bbox[0] = bb[id];
			bbox[1] = bb[++id];
			bbox[2] = bb[++id];
			bbox[3] = bb[++id];
			for (var i = 1, n = arcIds.length; i < n; i++) {
				id = absArcId(arcIds[i]) * 4;
				if (bb[id] < bbox[0])
					bbox[0] = bb[id];
				if (bb[++id] < bbox[1])
					bbox[1] = bb[id];
				if (bb[++id] > bbox[2])
					bbox[2] = bb[id];
				if (bb[++id] > bbox[3])
					bbox[3] = bb[id];
			}
			return bbox;
		};

		this.getMultiShapeBounds = function(shapeIds, bounds) {
			bounds = bounds || new Bounds();
			if (shapeIds) { // handle null shapes
				for (var i = 0, n = shapeIds.length; i < n; i++) {
					this.getSimpleShapeBounds(shapeIds[i], bounds);
				}
			}
			return bounds;
		};

		this.mergeArcBounds = function(arcId, bounds) {
			if (arcId < 0)
				arcId = ~arcId;
			var offs = arcId * 4;
			bounds.mergeBounds(_bb[offs], _bb[offs + 1], _bb[offs + 2], _bb[offs + 3]);
		};
	}

	ArcCollection.prototype.inspect = function() {
		var n = this.getPointCount(), str;
		if (n < 50) {
			str = JSON.stringify(this.toArray());
		} else {
			str = '[ArcCollection (' + this.size() + ')]';
		}
		return str;
	};

	MapShaper.hitShape = function(arcs, shapes) {
		return new hitShape(arcs, shapes);
	}

	function absArcId(arcId) {
		return arcId >= 0 ? arcId : ~arcId;
	}

	function hitShape(arcs, shapes) {
		this.arcs = arcs;
		this.shapes = shapes;
	}

	hitShape.prototype.polygonHit = function(x, y) {
		var dist = 0.046308074895251315, cands = findHitCandidates(x, y, dist, this.shapes, this.arcs), hits = [], cand, hitId;
		for (var i = 0; i < cands.length; i++) {
			cand = cands[i];
			if (geom.testPointInPolygon(x, y, cand.shape, this.arcs)) {
				hits.push(cand.id);
			}
		}
		if (cands.length > 0 && hits.length === 0) {
			// secondary detection: proximity, if not inside a polygon
			hits = findNearestCandidates(x, y, dist, cands, this.arcs);
		}
		return hits;
	}

	hitShape.prototype.pointHit = function(x, y) {
		var dist = 0.0045164048721638, limitSq = dist * dist, hits = [];
		MapShaper.forEachPoint(this.shapes, function(p, id) {
			var distSq = geom.distanceSq(x, y, p[0], p[1]);
			if (distSq < limitSq) {
				hits = [ id ];
				limitSq = distSq;
			} else if (distSq == limitSq) {
				hits.push(id);
			}
		});
		return hits;
	}

	hitShape.prototype.polylineHit = function(x, y) {
		var dist = 0.02390559532122913, cands = findHitCandidates(x, y, dist, this.shapes, this.arcs);
		return findNearestCandidates(x, y, dist, cands, this.arcs);
	}

	function findHitCandidates(x, y, dist, shapes, arcs) {
		index = {}, cands = [], bbox = [];
		shapes.forEach(function(shp, shpId) {
			var cand;
			for (var i = 0, n = shp && shp.length; i < n; i++) {
				arcs.getSimpleShapeBounds2(shp[i], bbox);
				if (x + dist < bbox[0] || x - dist > bbox[2] || y + dist < bbox[1] || y - dist > bbox[3]) {
					continue; // bbox non-intersection
				}
				cand = index[shpId];
				if (!cand) {
					cand = index[shpId] = {
						shape : [],
						id : shpId
					};
					cands.push(cand);
				}
				cand.shape.push(shp[i]);
			}
		});
		return cands;
	}

	function findNearestCandidates(x, y, dist, cands, arcs) {
		var hits = [], cand, candDist;
		for (var i = 0; i < cands.length; i++) {
			cand = cands[i];
			candDist = geom.getPointToShapeDistance(x, y, cand.shape, arcs);
			if (candDist < dist) {
				hits = [ cand.id ];
				dist = candDist;
			} else if (candDist == dist) {
				hits.push(cand.id);
			}
		}
		return hits;
	}
}());