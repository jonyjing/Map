(function() {
	EMap.Layers.FeatureLayer.Point = EMap.Layers.FeatureLayer.extend({
				initialize : function(options) {
					options = options || {};
					L.Util.setOptions(this, options);
					EMap.Layers.FeatureLayer.prototype.initialize.call(this, this.options);
					this.featureType=EMap.Utils.PointType;
				},
				
				getFeatureGroup:function(dataList){
					return EMap.Layers.FeatureLayer.prototype._featureLayer.call(this, dataList,this.options);
				}

			});
	EMap.Layers.FeatureLayer.point= function(dataList, options) {
		var point=new EMap.Layers.FeatureLayer.Point(options);
		return point.getFeatureGroup(dataList);
	};
}());