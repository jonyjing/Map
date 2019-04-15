function distanceSq(ax, ay, bx, by) {
	var dx = ax - bx, dy = ay - by;
	return dx * dx + dy * dy;
}

function apexDistSq(ab2, bc2, ac2) {
	var dist2;
	if (ac2 === 0) {
		dist2 = ab2;
	} else if (ab2 >= bc2 + ac2) {
		dist2 = bc2;
	} else if (bc2 >= ab2 + ac2) {
		dist2 = ab2;
	} else {
		var dval = (ab2 + ac2 - bc2);
		dist2 = ab2 - dval * dval / ac2 * 0.25;
	}
	if (dist2 < 0) {
		dist2 = 0;
	}
	return dist2;
}

var geom = {
	distanceSq : distanceSq
};

geom.getPointToShapeDistance = function(x, y, shp, arcs) {
	var minDist = (shp || []).reduce(function(minDist, ids) {
		var pathDist = geom.getPointToPathDistance(x, y, ids, arcs);
		return Math.min(minDist, pathDist);
	}, Infinity);
	return minDist;
};

geom.getPointToPathDistance = function(px, py, ids, arcs) {
	var iter = arcs.getShapeIter(ids);
	if (!iter.hasNext())
		return Infinity;
	var ax = iter.x, ay = iter.y, paSq = distanceSq(px, py, ax, ay), pPathSq = paSq, pbSq, abSq, bx, by;

	while (iter.hasNext()) {
		bx = iter.x;
		by = iter.y;
		pbSq = distanceSq(px, py, bx, by);
		abSq = distanceSq(ax, ay, bx, by);
		pPathSq = Math.min(pPathSq, apexDistSq(paSq, pbSq, abSq));
		ax = bx;
		ay = by;
		paSq = pbSq;
	}
	return Math.sqrt(pPathSq);
};

geom.getPlanarPathArea = function(ids, arcs) {
	var iter = arcs.getShapeIter(ids), sum = 0, ax, ay, bx, by, dx, dy;
	if (iter.hasNext()) {
		ax = 0;
		ay = 0;
		dx = -iter.x;
		dy = -iter.y;
		while (iter.hasNext()) {
			bx = ax;
			by = ay;
			ax = iter.x + dx;
			ay = iter.y + dy;
			sum += ax * by - bx * ay;
		}
	}
	return sum / 2;
};

geom.testPointInPolygon = function(x, y, shp, arcs) {
	var isIn = false, isOn = false;
	if (shp) {
		shp.forEach(function(ids) {
			var inRing = geom.testPointInRing(x, y, ids, arcs);
			if (inRing == 1) {
				isIn = !isIn;
			} else if (inRing == -1) {
				isOn = true;
			}
		});
	}
	return isOn || isIn;
};

geom.testPointInRing = function(x, y, ids, arcs) {
	var isIn = false, isOn = false;
	MapShaper.forEachPathSegment(ids, arcs, function(a, b, xx, yy) {
		var result = geom.testRayIntersection(x, y, xx[a], yy[a], xx[b], yy[b]);
		if (result == 1) {
			isIn = !isIn;
		} else if (isNaN(result)) {
			isOn = true;
		}
	});
	return isOn ? -1 : (isIn ? 1 : 0);
};

geom.testRayIntersection = function(x, y, ax, ay, bx, by) {
	var val = geom.getRayIntersection(x, y, ax, ay, bx, by);
	if (val != val) {
		return NaN;
	}
	return val == -Infinity ? 0 : 1;
};

geom.getRayIntersection = function(x, y, ax, ay, bx, by) {
	var hit = -Infinity, // default: no hit
	yInt;

	// case: p is entirely above, left or right of segment
	if (x < ax && x < bx || x > ax && x > bx || y > ay && y > by) {
		// no intersection
	}
	// case: px aligned with a segment vertex
	else if (x === ax || x === bx) {
		// case: vertical segment or collapsed segment
		if (x === ax && x === bx) {
			// p is on segment
			if (y == ay || y == by || y > ay != y > by) {
				hit = NaN;
			}
			// else: no hit
		}
		// case: px equal to ax (only)
		else if (x === ax) {
			if (y === ay) {
				hit = NaN;
			} else if (bx < ax && y < ay) {
				// only score hit if px aligned to rightmost endpoint
				hit = ay;
			}
		}
		// case: px equal to bx (only)
		else {
			if (y === by) {
				hit = NaN;
			} else if (ax < bx && y < by) {
				// only score hit if px aligned to rightmost endpoint
				hit = by;
			}
		}
		// case: px is between endpoints
	} else {
		yInt = geom.getYIntercept(x, ax, ay, bx, by);
		if (yInt > y) {
			hit = yInt;
		} else if (yInt == y) {
			hit = NaN;
		}
	}
	return hit;
};

geom.getYIntercept = function(x, ax, ay, bx, by) {
	return ay + (x - ax) * (by - ay) / (bx - ax);
};

geom.getXIntercept = function(y, ax, ay, bx, by) {
	return ax + (y - ay) * (bx - ax) / (by - ay);
};

function ShapeIter(arcs) {
	this._arcs = arcs;
	this._i = 0;
	this._n = 0;
	this.x = 0;
	this.y = 0;
}

ShapeIter.prototype.hasNext = function() {
	var arc = this._arc;
	if (this._i < this._n === false) {
		return false;
	}
	if (arc.hasNext()) {
		this.x = arc.x;
		this.y = arc.y;
		return true;
	}
	this.nextArc();
	return this.hasNext();
};

ShapeIter.prototype.init = function(ids) {
	this._ids = ids;
	this._n = ids.length;
	this.reset();
	return this;
};

ShapeIter.prototype.nextArc = function() {
	var i = this._i + 1;
	if (i < this._n) {
		this._arc = this._arcs.getArcIter(this._ids[i]);
		if (i > 0)
			this._arc.hasNext(); // skip first point
	}
	this._i = i;
};

ShapeIter.prototype.reset = function() {
	this._i = -1;
	this.nextArc();
};

function Bounds() {
	if (arguments.length > 0) {
		this.setBounds.apply(this, arguments);
	}
}

Bounds.prototype.toString = function() {
	return JSON.stringify({
		xmin : this.xmin,
		xmax : this.xmax,
		ymin : this.ymin,
		ymax : this.ymax
	});
};

Bounds.prototype.toArray = function() {
	return this.hasBounds() ? [ this.xmin, this.ymin, this.xmax, this.ymax ] : [];
};

Bounds.prototype.hasBounds = function() {
	return this.xmin <= this.xmax && this.ymin <= this.ymax;
};

Bounds.prototype.sameBounds = Bounds.prototype.equals = function(bb) {
	return bb && this.xmin === bb.xmin && this.xmax === bb.xmax && this.ymin === bb.ymin && this.ymax === bb.ymax;
};

Bounds.prototype.width = function() {
	return (this.xmax - this.xmin) || 0;
};

Bounds.prototype.height = function() {
	return (this.ymax - this.ymin) || 0;
};

Bounds.prototype.area = function() {
	return this.width() * this.height() || 0;
};

Bounds.prototype.empty = function() {
	this.xmin = this.ymin = this.xmax = this.ymax = void 0;
	return this;
};

Bounds.prototype.setBounds = function(a, b, c, d) {
	if (arguments.length == 1) {
		// assume first arg is a Bounds or array
		if (Utils.isArrayLike(a)) {
			b = a[1];
			c = a[2];
			d = a[3];
			a = a[0];
		} else {
			b = a.ymin;
			c = a.xmax;
			d = a.ymax;
			a = a.xmin;
		}
	}

	this.xmin = a;
	this.ymin = b;
	this.xmax = c;
	this.ymax = d;
	if (a > c || b > d)
		this.update();
	// error("Bounds#setBounds() min/max reversed:", a, b, c, d);
	return this;
};

Bounds.prototype.centerX = function() {
	var x = (this.xmin + this.xmax) * 0.5;
	return x;
};

Bounds.prototype.centerY = function() {
	var y = (this.ymax + this.ymin) * 0.5;
	return y;
};

Bounds.prototype.containsPoint = function(x, y) {
	if (x >= this.xmin && x <= this.xmax && y <= this.ymax && y >= this.ymin) {
		return true;
	}
	return false;
};

// intended to speed up slightly bubble symbol detection; could use intersects()
// instead
// TODO: fix false positive where circle is just outside a corner of the box
Bounds.prototype.containsBufferedPoint = Bounds.prototype.containsCircle = function(x, y, buf) {
	if (x + buf > this.xmin && x - buf < this.xmax) {
		if (y - buf < this.ymax && y + buf > this.ymin) {
			return true;
		}
	}
	return false;
};

Bounds.prototype.intersects = function(bb) {
	if (bb.xmin <= this.xmax && bb.xmax >= this.xmin && bb.ymax >= this.ymin && bb.ymin <= this.ymax) {
		return true;
	}
	return false;
};

Bounds.prototype.contains = function(bb) {
	if (bb.xmin >= this.xmin && bb.ymax <= this.ymax && bb.xmax <= this.xmax && bb.ymin >= this.ymin) {
		return true;
	}
	return false;
};

Bounds.prototype.shift = function(x, y) {
	this.setBounds(this.xmin + x, this.ymin + y, this.xmax + x, this.ymax + y);
};

Bounds.prototype.padBounds = function(a, b, c, d) {
	this.xmin -= a;
	this.ymin -= b;
	this.xmax += c;
	this.ymax += d;
};

// Rescale the bounding box by a fraction. TODO: implement focus.
// @param {number} pct Fraction of original extents
// @param {number} pctY Optional amount to scale Y
//
Bounds.prototype.scale = function(pct, pctY) { /* , focusX, focusY */
	var halfWidth = (this.xmax - this.xmin) * 0.5;
	var halfHeight = (this.ymax - this.ymin) * 0.5;
	var kx = pct - 1;
	var ky = pctY === undefined ? kx : pctY - 1;
	this.xmin -= halfWidth * kx;
	this.ymin -= halfHeight * ky;
	this.xmax += halfWidth * kx;
	this.ymax += halfHeight * ky;
};

// Return a bounding box with the same extent as this one.
Bounds.prototype.cloneBounds = // alias so child classes can override clone()
Bounds.prototype.clone = function() {
	return new Bounds(this.xmin, this.ymin, this.xmax, this.ymax);
};

Bounds.prototype.clearBounds = function() {
	this.setBounds(new Bounds());
};

Bounds.prototype.mergePoint = function(x, y) {
	if (this.xmin === void 0) {
		this.setBounds(x, y, x, y);
	} else {
		// this works even if x,y are NaN
		if (x < this.xmin)
			this.xmin = x;
		else if (x > this.xmax)
			this.xmax = x;

		if (y < this.ymin)
			this.ymin = y;
		else if (y > this.ymax)
			this.ymax = y;
	}
};

// expands either x or y dimension to match @aspect (width/height ratio)
// @focusX, @focusY (optional): expansion focus, as a fraction of width and
// height
Bounds.prototype.fillOut = function(aspect, focusX, focusY) {
	if (arguments.length < 3) {
		focusX = 0.5;
		focusY = 0.5;
	}
	var w = this.width(), h = this.height(), currAspect = w / h, pad;
	if (isNaN(aspect) || aspect <= 0) {
		// error condition; don't pad
	} else if (currAspect < aspect) { // fill out x dimension
		pad = h * aspect - w;
		this.xmin -= (1 - focusX) * pad;
		this.xmax += focusX * pad;
	} else {
		pad = w / aspect - h;
		this.ymin -= (1 - focusY) * pad;
		this.ymax += focusY * pad;
	}
	return this;
};

Bounds.prototype.update = function() {
	var tmp;
	if (this.xmin > this.xmax) {
		tmp = this.xmin;
		this.xmin = this.xmax;
		this.xmax = tmp;
	}
	if (this.ymin > this.ymax) {
		tmp = this.ymin;
		this.ymin = this.ymax;
		this.ymax = tmp;
	}
};

Bounds.prototype.transform = function(t) {
	this.xmin = this.xmin * t.mx + t.bx;
	this.xmax = this.xmax * t.mx + t.bx;
	this.ymin = this.ymin * t.my + t.by;
	this.ymax = this.ymax * t.my + t.by;
	this.update();
	return this;
};

// Returns a Transform object for mapping this onto Bounds @b2
// @flipY (optional) Flip y-axis coords, for converting to/from pixel coords
//
Bounds.prototype.getTransform = function(b2, flipY) {
	var t = new Transform();
	t.mx = b2.width() / this.width();
	t.bx = b2.xmin - t.mx * this.xmin;
	if (flipY) {
		t.my = -b2.height() / this.height();
		t.by = b2.ymax - t.my * this.ymin;
	} else {
		t.my = b2.height() / this.height();
		t.by = b2.ymin - t.my * this.ymin;
	}
	return t;
};

Bounds.prototype.mergeCircle = function(x, y, r) {
	if (r < 0)
		r = -r;
	this.mergeBounds([ x - r, y - r, x + r, y + r ]);
};

Bounds.prototype.mergeBounds = function(bb) {
	var a, b, c, d;
	if (bb instanceof Bounds) {
		a = bb.xmin, b = bb.ymin, c = bb.xmax, d = bb.ymax;
	} else if (arguments.length == 4) {
		a = arguments[0];
		b = arguments[1];
		c = arguments[2];
		d = arguments[3];
	} else if (bb.length == 4) {
		// assume array: [xmin, ymin, xmax, ymax]
		a = bb[0], b = bb[1], c = bb[2], d = bb[3];
	} else {
		error("Bounds#mergeBounds() invalid argument:", bb);
	}

	if (this.xmin === void 0) {
		this.setBounds(a, b, c, d);
	} else {
		if (a < this.xmin)
			this.xmin = a;
		if (b < this.ymin)
			this.ymin = b;
		if (c > this.xmax)
			this.xmax = c;
		if (d > this.ymax)
			this.ymax = d;
	}
	return this;
};

function ArcIter(xx, yy) {
	this._i = 0;
	this._n = 0;
	this._inc = 1;
	this._xx = xx;
	this._yy = yy;
	this.i = 0;
	this.x = 0;
	this.y = 0;
}

ArcIter.prototype.init = function(i, len, fw) {
	if (fw) {
		this._i = i;
		this._inc = 1;
	} else {
		this._i = i + len - 1;
		this._inc = -1;
	}
	this._n = len;
	return this;
};

ArcIter.prototype.hasNext = function() {
	var i = this._i;
	if (this._n > 0) {
		this._i = i + this._inc;
		this.x = this._xx[i];
		this.y = this._yy[i];
		this.i = i;
		this._n--;
		return true;
	}
	return false;
};