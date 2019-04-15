(function() {
	EMap.Layers.HeatLayer = EMap.Layers.extend({
				options : {
					radius : 15,
					blur : 15,
					minOpacity : 0.5
				},
				initialize : function(options) {
					L.setOptions(this, options);
				},

				getHeatLayer : function(dataList) {
					var featureList = dataList;
					var options = this.options || {};
					if (!L.Util.isArray(featureList) || featureList === undefined || featureList === null) {
						console.log("你的数据为空，或者不是数组格式");
						return null;
					}
					var geojsonData = EMap.Utils.dataToGeoJson(featureList, "Point");
					var maxIntensity=1;
					var heatpoints = geojsonData.features.map(function(value) {
								var coordinates = L.extend([], value.geometry.coordinates);
								var heatItem = coordinates.reverse();
								if (value.properties.intensity) {
									if(value.properties.intensity>maxIntensity){
										maxIntensity=value.properties.intensity;
									}
									heatItem.push(value.properties.intensity);
								}
								return heatItem;
							});
					options.max=maxIntensity;
					var heatLayer = L.heatLayer(heatpoints, options);
					return heatLayer;
				}
			});

	EMap.Layers.heatLayer = function(dataList, options) {
		var layer = new EMap.Layers.HeatLayer(options);
		return layer.getHeatLayer(dataList);
	};
}());