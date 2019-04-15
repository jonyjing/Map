(function() {
	EMap.Layers.CanvasLayer.WaveCircle = EMap.Layers.CanvasLayer.extend({

				options : {
					style : {
						fillColor : "rgba(255,43,69,1)",
						strokeColor : "rgba(255,43,69,1)",
						radius : 6
					}
				},

				initialize : function(dataList, options) {
					options = options || {};
					if (typeof options.style === 'function') {
						this.options = options;
					} else {
						this.options = $.extend(true, {}, this.options, options);
					}
					EMap.Layers.CanvasLayer.prototype.initialize.call(this, this.options);
					this.dataList = dataList;

				},
				render : function() {
					var self = this;
					var style;
					var waves = [];
					var dataList = this.dataList;
					var ctx = this.canvas.getContext('2d');
					// ctx.shadowColor = 'rgba(255,255,255,0.5)';
					// ctx.shadowBlur = 4;
					this.rtree = RTree();
					ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
					ctx.shadowOffsetX = 1;
					ctx.shadowOffsetY = 1;
					ctx.shadowBlur = 5;
					ctx.shadowColor = "rgba(0,0,0,0.1)";
					for (var i = 0; i < dataList.length; i++) {
						var LabelPoint_latlng = new L.LatLng(dataList[i].coordinates[1], dataList[i].coordinates[0]);
						var LabelPoint = this._map.latLngToContainerPoint(LabelPoint_latlng);
						if (typeof this.options.style === 'function') {
							style = this.options.style(dataList[i]);
						} else {
							style = this.options.style;
						}
						var waveStyle = {
							x : LabelPoint.x,
							y : LabelPoint.y,
							r : style.radius,
							color : style.fillColor
						};
						waves[i] = new circle_wave(waveStyle);
						this.rtree.insert(waves[i].getBounds(), dataList[i]);
					}
					self._wave(ctx, waves);
				},

				_wave : function(ctx, waves) {
					var self = this;
					this._fillCanvas(ctx);
					for (i = 0; i < waves.length; i++) {
						var wave = waves[i];
						wave.createCircle(ctx);
						wave.draw(ctx, true);
					}
					this.currentAnimationFrame = requestAnimationFrame(function() {
								self._wave(ctx, waves);
							});
				},

				_onMouseMove : function(e) {
					var point = [e.clientX - this._map._container.offsetLeft, e.clientY - this._map._container.offsetTop];
					if (this.rtree == null) {
						return;
					}
					var obj = this.rtree.search({
								x : point[0],
								y : point[1],
								w : 0,
								h : 0
							});
					if (obj.length !== 0) {
						this.canvas.style.cursor = "pointer";
					} else {
						this.canvas.style.cursor = "";
					}
				},

				_onMouseClick : function(e) {
					var point = [e.clientX - this._map._container.offsetLeft, e.clientY - this._map._container.offsetTop];

					var obj = this.rtree.search({
								x : point[0],
								y : point[1],
								w : 0,
								h : 0
							});
					if (obj.length !== 0) {
						L.DomEvent.stopPropagation(e);
						var latlng = this._map.containerPointToLatLng(point);
						this.fire('click', {
									obj : obj,
									latlng : latlng
								});
					}
				},
				onAdd : function(map) {
					var size = map.getSize();
					this.container=map.createPane('waveCircle');
					this.setZIndex(this.options.zIndex);
					this.canvas = this._createCanvas(size,map);
					this.container.appendChild(this.canvas);
					EMap.Layers.CanvasLayer.prototype.onAdd.call(this, map);
					L.DomEvent.addListener(map.getContainer(), 'click', this._onMouseClick, this);
					L.DomEvent.addListener(map.getContainer(), 'mousemove', this._onMouseMove, this);
				},
				onRemove : function(map) {
					L.DomEvent.removeListener(map.getContainer(), 'click', this._onMouseClick);
					L.DomEvent.removeListener(map.getContainer(), 'mousemove', this._onMouseMove);
					EMap.Layers.CanvasLayer.prototype.onRemove.call(this, map);
					this.currentAnimationFrame = -1;
					this.dataList.length = 0;
					this.rtree = null;
				}
			});
	EMap.Layers.CanvasLayer.waveCircle = function(dataList, options) {
		return new EMap.Layers.CanvasLayer.WaveCircle(dataList, options);
	};
}());