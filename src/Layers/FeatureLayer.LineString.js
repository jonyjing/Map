(function() {
	EMap.Layers.FeatureLayer.LineString = EMap.Layers.FeatureLayer.extend({
				initialize : function(options) {
					options = options || {};
					L.Util.setOptions(this, options);
					EMap.Layers.FeatureLayer.prototype.initialize.call(this, this.options);
					this.featureType=EMap.Utils.LineStringType;
				},
				
				getFeatureGroup:function(dataList){
					return EMap.Layers.FeatureLayer.prototype._featureLayer.call(this, dataList,this.options);
				}

			});
	EMap.Layers.FeatureLayer.lineString= function(dataList, options) {
		var LineString=new EMap.Layers.FeatureLayer.LineString(options);
		return LineString.getFeatureGroup(dataList);
	};
}());