(function() {
	EMap.Layers.FeatureLayer.Polygon = EMap.Layers.FeatureLayer.extend({
				initialize : function(options) {
					options = options || {};
					L.Util.setOptions(this, options);
					EMap.Layers.FeatureLayer.prototype.initialize.call(this, this.options);
					this.featureType=EMap.Utils.PolygonType;
				},
				
				getFeatureGroup:function(dataList){
					return EMap.Layers.FeatureLayer.prototype._featureLayer.call(this, dataList,this.options);
				}

			});
	EMap.Layers.FeatureLayer.polygon= function(dataList, options) {
		var Polygon=new EMap.Layers.FeatureLayer.Polygon(options);
		return Polygon.getFeatureGroup(dataList);
	};
}());