
	Emap.Widget.MapCompare = function() {
		var options = {
			compareType : 'sp',
			compareMapId : 'compareMapId',
			mapId : null,
			compareMapHtml : '<div id="compareMapId" style="position:absolute;right:0px;top:0px;border:2px solid #ccc;z-index:9999;bottom: 0px;height:100%;width:50%;overflow: hidden;"></div>'
		};

		var initialize = function(options) {
			$.extend(true,this.options,options);
			this.map=options.map;
			var mapId = this.options.mapId = map.getContainer().id;
			var compareMapId = this.options.compareMapId;
			var parentContainer = map.getContainer().parentNode;
			this._container = $(this.options.compareMapHtml)[0];
			parentContainer.appendChild(this._container);
			$("#" + mapId).css({
				height : "100%",
				width : "50%"
			});
			this.map = map;
			this._invalidateSize(map);
			this.CompareMap = new EMap.Map(compareMapId, {
				baseMapSwitchControl : {
					show : true
				},
				crs : map.options.crs,
				center : map.getCenter(),
				zoom : map.getZoom(),
				maxZoom : map.getMaxZoom(),
				minZoom : map.getMinZoom(),
				positionControl : false,
				scaleControl : false
			});
			this.CompareMap.invalidateSize();
			this.map.on("drag", this._map_extentChangeHandler, this), this.map.on("zoomend",
					this._map_extentChangeHandler, this), this.CompareMap.on("drag", this._mapEx_extentChangeHandler,
					this), this.CompareMap.on("zoomend", this._mapEx_extentChangeHandler, this);
			return this;
		};

		var _invalidateSize = function() {
			var map = this.map;
			setTimeout(function() {
				map.invalidateSize()
			}, 100)
		};

		var _map_extentChangeHandler = function(t) {
			this.map.stop(), this.CompareMap.stop(), this.CompareMap.setView(this.map.getCenter(), this.map.getZoom())
		};
		var _mapEx_extentChangeHandler = function(t) {
			this.map.stop(), this.CompareMap.stop(), this.map.setView(this.CompareMap.getCenter(), this.CompareMap
					.getZoom())
		};

		var remove = function() {
			this.map.off("drag", this._map_extentChangeHandler, this), this.map.off("zoomend",
					this._map_extentChangeHandler, this), this.CompareMap.off("drag", this._mapEx_extentChangeHandler,
					this), this.CompareMap.off("zoomend", this._mapEx_extentChangeHandler, this);
			this.CompareMap.remove();
			$("#" + this.options.compareMapId).remove();
			$("#" + this.options.mapId).css({
				position : "",
				height : "100%",
				width : "100%"
			});
			this.invalidateSize()
		};

		return function(options){
			this.options=options;
			this.initialize =initialize;
			this.remove=remove;
		};
	}();

L.control.mapCompare = function(options) {
	return new L.Control.MapCompare(options);
};