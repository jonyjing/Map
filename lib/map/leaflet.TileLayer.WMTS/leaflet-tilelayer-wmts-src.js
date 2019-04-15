L.TileLayer.WMTS = L.TileLayer.extend({
	options : {
		version : "1.0.0",
		style : "default",
		tilematrixSet : "",
		format : "image/png",
		tileSize : 256,
		matrixIds : null,
		layer : ""
	},
	initialize : function(url, layerOption) {
		this._url = url;
		L.setOptions(this, layerOption)
	},
	getTileUrl : function(t) {
		var zoom = this._getZoomForUrl();
		if (this.options.zOffset) {
			zoom += this.options.zOffset;
		}
		var tilematrix;
		if (this.options.matrixIds) {
			tilematrix = this.options.matrixIds[zoom].identifier;
		} else {
			tilematrix = zoom;
		}
		if(this.options.subdomains){
			var templateUrl = L.Util.template(this._url, {
				s : this.options.subdomains[parseInt(7 * Math.random())]
			});
		}
		var tile_option = {
			service : "WMTS",
			request : "GetTile",
			version : this.options.version,
			style : this.options.style,
			tilematrixSet : this.options.tilematrixSet,
			format : this.options.format,
			width : this.options.tileSize,
			height : this.options.tileSize,
			layer : this.options.layer,
			tilematrix : tilematrix,
			tilerow : t.y,
			tilecol : t.x
		};
		return templateUrl+L.Util.getParamString(tile_option, templateUrl)
	}
});
L.tileLayer.wmts = function(url, layerOption) {
	return new L.TileLayer.WMTS(url, layerOption)
};