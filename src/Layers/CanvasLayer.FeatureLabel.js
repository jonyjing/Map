(function() {
	EMap.Layers.CanvasLayer.FeatureLabel = EMap.Layers.CanvasLayer.extend({

		options : {
			style : {
				font_color : "red",
				font_borderColor : "#ffffff",
				font_borderWidth : "3",
				font_style : "normal",
				font_variant : "normal",
				font_weight : "normal",
				font_size : "12px",
				font_family : "Microsoft Yahei"
			}
		},

		initialize : function(dataList, options) {
			options = options || {};
			this.options = $.extend(true, {}, this.options, options);
			EMap.Layers.CanvasLayer.prototype.initialize.call(this, this.options);
			this.dataList = dataList;
		},
		render : function() {
			var type = this.options.featureType;
			var dataList = this.dataList;
			var canvas = this.canvas;
			var ctx = canvas.getContext('2d');
			this.rtree = RTree();
			var showNum = 0;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.beginPath();
			ctx.font = this.options.style.font_style + " " + this.options.style.font_variant + " "
					+ this.options.style.font_weight + " " + this.options.style.font_size + " "
					+ this.options.style.font_family;
			ctx.strokeStyle = this.options.style.font_borderColor;
			ctx.lineWidth = this.options.style.font_borderWidth;
			ctx.fillStyle = this.options.style.font_color;
			for (var i = 0; i < dataList.length; i++) {
				var LabelPoint;
				if (type === EMap.Utils.LineStringType) {
					var linestring = turf.lineString(dataList[i].coordinates);
					LabelPoint = turf.pointOnSurface(linestring);
				} else if (type === EMap.Utils.PolygonType) {
					var polygon = turf.polygon(dataList[i].coordinates);
					LabelPoint = turf.pointOnSurface(polygon);
				} else {
					LabelPoint = turf.point(dataList[i].coordinates);
				}
				var LabelPoint_latlng = new L.LatLng(LabelPoint.geometry.coordinates[1],
						LabelPoint.geometry.coordinates[0]);
				LabelPoint = this._map.latLngToContainerPoint(LabelPoint_latlng);
				var mapBoundsbox = this._map.getBounds();
				if (!mapBoundsbox.contains(LabelPoint_latlng)) {
					continue;
				}
				var txtWidth = ctx.measureText(dataList[i].name).width;
				ctx.strokeText(dataList[i].name, LabelPoint.x - (txtWidth) / 2, LabelPoint.y + 20);
				ctx.fillText(dataList[i].name, LabelPoint.x - (txtWidth) / 2, LabelPoint.y + 20);
				showNum = showNum + 1;
				var topLeft_x = LabelPoint.x - (txtWidth + 8) / 2;
				var topLeft_y = LabelPoint.y + 8;

				this.rtree.insert({
					x : topLeft_x,
					y : topLeft_y,
					w : txtWidth + 8,
					h : 16
				}, dataList[i]);
			}
			// console.log("Number of"+showNum+"canvas has bean
			// showed,total is:"+dataList.length);
		},
		_onMouseClick : function(e) {
			if (this.rtree == null) {
				return;
			}
			var point = [ e.clientX, e.clientY ];
			var obj = this.rtree.search({
				x : point[0],
				y : point[1],
				w : 0,
				h : 0
			});
			if (obj.length !== 0) {
				var latlng = this._map.containerPointToLatLng(point);
				if (e.type === "click") {
					this.fire('click', {
						obj : obj,
						latlng : latlng
					});
				} else {
					this.canvas.style.cursor = "pointer";
				}
			} else {
				this.canvas.style.cursor = "";
			}

		},
		onAdd : function(map) {
			var size = map.getSize();
			this.container = map.createPane('canvasLabel');
			this.setZIndex(this.options.zIndex);
			this.canvas = this._createCanvas(size);
			this.container.appendChild(this.canvas);
			EMap.Layers.CanvasLayer.prototype.onAdd.call(this, map);
			L.DomEvent.addListener(map.getContainer(), 'click', this._onMouseClick, this);
			L.DomEvent.addListener(map.getContainer(), 'mousemove', this._onMouseClick, this);
		},
		onRemove : function(map) {
			L.DomEvent.removeListener(map.getContainer(), 'click', this._onMouseClick, this);
			L.DomEvent.removeListener(map.getContainer(), 'mousemove', this._onMouseClick, this);
			EMap.Layers.CanvasLayer.prototype.onRemove.call(this, map);
			this.rtree = null;
		}
	});
	EMap.Layers.CanvasLayer.featureLabel = function(dataList, options) {
		return new EMap.Layers.CanvasLayer.FeatureLabel(dataList, options);
	};
}());