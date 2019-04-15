EMap.Widget.mapDividerCompare = function() {
	var defalutOptions = {
		compareType : 'sp',
		compareMapId : 'compareMapId',
		mapId : null,
		compareMapHtml_sp : '<div id="compareMapId" style="position:absolute;right:0px;top:0px;border-left:4px solid #ccc;z-index:9999;bottom: 0px;height:100%;width:50%;overflow: hidden;"></div>',
		compareMapHtml_cz : '<div id="compareMapId" style="position:absolute;left:0px;top:50%;border-top:4px solid #ccc;z-index:9999;bottom: 0px;height:50%;width:100%;overflow: hidden;"></div>'
	};

	var initialize = function(options) {
		this.options = $.extend(true, defalutOptions, options);
		this.map = options.map;
		var mapId = this.options.mapId = map.getContainer().id;
		var compareMapId = this.options.compareMapId;
		var parentContainer = map.getContainer().parentNode;
		if (defalutOptions.compareType === 'sp') {
			this._container = $(this.options.compareMapHtml_sp)[0];
			parentContainer.appendChild(this._container);
			$("#" + mapId).css({
				height : "100%",
				width : "50%"
			});
		} else if (defalutOptions.compareType === 'cz') {
			this._container = $(this.options.compareMapHtml_cz)[0];
			parentContainer.appendChild(this._container);
			$("#" + mapId).css({
				height : "50%",
				width : "100%"
			});
		}
		this.map = map;
		_invalidateSize(map);
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
		this.map.on("drag", _map_extentChangeHandler, this), this.map.on("zoomend", _map_extentChangeHandler, this),
				this.CompareMap.on("drag", _mapEx_extentChangeHandler, this), this.CompareMap.on("zoomend",
						_mapEx_extentChangeHandler, this);
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
		this.map.off("drag", _map_extentChangeHandler, this), this.map.off("zoomend", _map_extentChangeHandler, this),
				this.CompareMap.off("drag", _mapEx_extentChangeHandler, this), this.CompareMap.off("zoomend",
						_mapEx_extentChangeHandler, this);
		this.CompareMap.remove();
		$("#" + this.options.compareMapId).remove();
		$("#" + this.options.mapId).css({
			position : "relative",
			height : "100%",
			width : "100%"
		});
		_invalidateSize()
	};

	return {
		initialize : initialize,
		remove : remove
	};
}();