(function() {
	EMap.Layers.CanvasLayer = EMap.Layers.extend({
		includes : [ L.Evented ],

		defalut_options : {
			opacity : 1,
			zIndex : 300
		},

		initialize : function(options) {
			var self = this;
			this.options = L.Util.extend({}, this.defalut_options, options);
			EMap.Layers.prototype.initialize.call(this, this.options);
			this.currentAnimationFrame = -1;
			this.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame
					|| window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
						return window.setTimeout(callback, 1000 / 60);
					};
			this.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame
					|| window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || function(id) {
						clearTimeout(id);
					};
		},

		_createCanvas : function(size) {
			var canvas = document.createElement('canvas');
			canvas.width = size.x;
			canvas.height = size.y;
			canvas.setAttribute('class', 'leaflet-zoom-animated');
			return canvas;
		},

		onAdd : function(map) {
			this._map = map;
			map.on({
				'moveend' : this._reset
			}, this);
			map.on({
				'resize' : this._onLayerDidResize
			}, this);
			this._reset();
		},

		draw : function() {
			return this._reset();
		},

		onRemove : function(map) {
			L.DomUtil.remove(this.container);
			map.off({
				'moveend' : this._reset
			}, this);
			map.off({
				'resize' : this._onLayerDidResize
			}, this);
			this._map = null;
			this.container = null;
		},

		addTo : function(map) {
			map.addLayer(this);
			return this;
		},

		setOpacity : function(opacity) {
			this.container.style.opacity = opacity;
			return this;
		},

		setZIndex : function(zIndex) {
			if (this.container) {
				this.container.style.zIndex = zIndex;
			}
			return this;
		},

		_onLayerDidResize : function(resizeEvent) {
			if (this.container) {
				var canvas_list = this.container.childNodes;
				canvas_list.forEach(function(canvas) {
					canvas.width = resizeEvent.newSize.x;
					canvas.height = resizeEvent.newSize.y;
				});
			}
		},

		_reset : function(e, target) {
			var bounds = this._map.getBounds();
			var topLeft = this._map.latLngToLayerPoint(bounds.getNorthWest());
			L.DomUtil.setPosition(this.container, topLeft);
			this._render();
		},

		_fillCanvas : function(context, trail) {
			var g = context.globalCompositeOperation;
			context.globalCompositeOperation = 'destination-out';
			var trail = trail || 30;
			context.fillStyle = 'rgba(0, 0, 0, ' + 1 / trail + ')';
			context.fillRect(0, 0, context.canvas.width, context.canvas.height);
			context.globalCompositeOperation = g;
		},

		_render : function() {
			if (this.currentAnimationFrame >= 0) {
				this.cancelAnimationFrame.call(window, this.currentAnimationFrame);
			}
			this.render();
		},

		// use direct: true if you are inside an animation frame call
		/*
		 * redraw : function(direct) { /*var domPosition =
		 * L.DomUtil.getPosition(this._map.getPanes().mapPane); if (domPosition) {
		 * L.DomUtil.setPosition(this._canvas, { x : -domPosition.x, y :
		 * -domPosition.y }); } if (direct) { //this.render(); } else {
		 * this._render(); } },
		 */

		render : function() {
			throw new Error('render function should be implemented');
		}
	});
}());