(function() {
	EMap.Layers.CanvasLayer.MigrateLayer = EMap.Layers.CanvasLayer.extend({
		options : {
			style : {
				weight : 1,
				lineColor : "rgba(70,190,233,0.8)",
				pathStyle : "straight",
				wavesColor : "rgba(0,255,255,1)"
			/*
			 * image : { font : "14px FontAwesome", pathImageFont : "\uf111",
			 * color:"rgba(255,255,255,0.8)" }
			 */
			}
		},

		initialize : function(dataList, options) {
			options = options || {};
			this.options = $.extend(true, {}, this.options, options);
			EMap.Layers.CanvasLayer.prototype.initialize.call(this, this.options);
			this.dataList = dataList;
			this.headOpacity = 0.2;
			this.bezierPaths = [];
		},

		render : function() {
			var self = this;
			var waves = [];
			var bezierPaths = this.bezierPaths;
			var dataList = this.dataList;
			var canvas = this._renderCanvas;
			var ctx = canvas.getContext('2d');
			var beziereCtx = this._beziereCanvas.getContext('2d');
			beziereCtx.globalAlpha = 0.9;
			beziereCtx.lineCap = "round";
			beziereCtx.lineWidth = this.options.style.weight;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			beziereCtx.clearRect(0, 0, canvas.width, canvas.height);
			for (var i = 0; i < dataList.length; i++) {
				var start_point = dataList[i].from_coordinates;
				var end_point = dataList[i].to_coordinates;
				var start_point_latlng = new L.LatLng(start_point[1], start_point[0]);
				var end_point_latlng = new L.LatLng(end_point[1], end_point[0]);
				var start = this._map.latLngToContainerPoint(start_point_latlng);
				var end = this._map.latLngToContainerPoint(end_point_latlng);
				var startPoint = {
					x : start.x,
					y : start.y
				};
				var endPoint = {
					x : end.x,
					y : end.y
				};
				bezierPaths[i] = new QuadraticBezier(startPoint, endPoint, this.options.style, dataList[i]);
				waves[i] = new circle_wave({
					x : endPoint.x,
					y : endPoint.y,
					r : this.options.style.weight / 2,
					color : this.options.style.wavesColor
				});
				bezierPaths[i].createBezierLine(beziereCtx);
				var p1 = bezierPaths[i].getBezierPathPoint(1 - bezierPaths[i].k_step);
				if (this.options.style.arrowHead === true) {
					new arrowHead(p1, endPoint).draw(beziereCtx, 10, 10, bezierPaths[i].lineColor);
				}

			}
			self._animationPath(bezierPaths, waves);
		},
		_animationPath : function(bezierPaths, waves) {
			var self = this;
			this.headOpacity = this.headOpacity + 0.01;
			if (this.headOpacity > 1) {
				this.headOpacity = 0.2;
			}
			var canvas = this._renderCanvas;
			var ctx = canvas.getContext('2d');
			this._fillCanvas(ctx, this.options.style.trail);
			for (var i = 0; i < bezierPaths.length; i++) {
				bezierPath = bezierPaths[i];
				bezierPath.draw(ctx);
				// 渲染波纹
				var startDraw = bezierPath.k > 1 ? true : false;
				waves[i].draw(ctx, startDraw);
			}
			this.currentAnimationFrame = requestAnimationFrame(function() {
				self._animationPath(bezierPaths, waves);
			});
		},

		onAdd : function(map) {
			var size = map.getSize();
			this.container = map.createPane('migrate');
			this.setZIndex(this.options.zIndex);
			this._beziereCanvas = this._createCanvas(size);
			this._renderCanvas = this._createCanvas(size);
			this.container.appendChild(this._beziereCanvas);
			this.container.appendChild(this._renderCanvas);
			EMap.Layers.CanvasLayer.prototype.onAdd.call(this, map);
			L.DomEvent.addListener(map.getContainer(), 'mousemove', this._onMouseClick, this);
		},

		_onMouseClick : function(e) {
			if (this.lastActiveTime != undefined) {
				if (new Date().getTime() - this.lastActiveTime < 1000) {
					return;
				}
			}
			var selectPathData = null;
			var point = this._map.mouseEventToContainerPoint(e);
			// 利用起点，控制点，终点坐标构成的区域进行初步过滤
			var filterbezierPaths = this._filterBezierPathsByPoint(this._map.containerPointToLatLng(point));
			if (filterbezierPaths.length == 1) {
				selectPathData = filterbezierPaths[0].data;
			} else {
				for (var i = 0; i < filterbezierPaths.length; i++) {
					var _parts = filterbezierPaths[i]._points;
					if (this._containsPoint(point, _parts)) {
						var latlng = this._map.containerPointToLatLng([ point.x, point.y ]);
						selectPathData = filterbezierPaths[i].data;
						break;
					}
				}
			}
			if (selectPathData) {
				this._renderCanvas.style.cursor = "pointer";
				this.lastActiveTime = new Date().getTime();
				L.DomEvent.stopPropagation(e);
				this.fire('mousemove', {
					obj : selectPathData
				});
			} else {
				this._renderCanvas.style.cursor = "";
			}
		},

		_filterBezierPathsByPoint : function(point) {
			var self = this;
			return this.bezierPaths.filter(function(bezierPath, index) {
				var startPoint = self.dataList[index].from_coordinates;
				var endPoint = self.dataList[index].to_coordinates;
				var pt = turf.point([ point.lng, point.lat ]);
				if (self.options.style.pathStyle === "curve") {
					var controlPoint_latlng = self._map.containerPointToLatLng([ bezierPath.controlPoint.x,
							bezierPath.controlPoint.y ]);
					var polygon = turf.polygon([ [ startPoint, [ controlPoint_latlng.lng, controlPoint_latlng.lat ],
							endPoint, startPoint ] ]);
					if (turf.inside(pt, polygon)) {
						return true;
					}
				} else {
					var linestring = turf.lineString([startPoint,endPoint]);
					if(turf.pointOnLine(linestring,pt)){
						return true;
					}
				}

			});
		},

		_containsPoint : function(point, _parts, closed) {
			var i, j, len, dist, w = this.options.style.weight / 2 + 3;

			if (L.Browser.touch) {
				w += 10; // polyline click tolerance on touch devices
			}

			for (i = 1, len = _parts.length; i < len; i++) {
				j = i - 1;
				dist = L.LineUtil.pointToSegmentDistance(point, _parts[i], _parts[j]);
				if (dist <= w) {
					return true;
				}
			}
			return false;
		},

		_reset : function() {
			EMap.Layers.CanvasLayer.prototype._reset.call(this);
		},

		onRemove : function(map) {
			L.DomEvent.removeListener(map.getContainer(), 'mousemove', this._onMouseClick);
			EMap.Layers.CanvasLayer.prototype.onRemove.call(this, map);
			this.currentAnimationFrame = -1;
			this.bezierPaths.length = 0;
			this.dataList.length = 0;
		}

	});

	EMap.Layers.CanvasLayer.migrateLayer = function(dataList, options) {
		return new EMap.Layers.CanvasLayer.MigrateLayer(dataList, options);
	};
}());