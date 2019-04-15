(function() {
	EMap.Layers.ClusterLayer = EMap.Layers.extend({
				initialize : function(options) {
					L.setOptions(this, options);
				},
				getClusterLayer : function(dataList) {
					var geojsonData, style, pointClusterLayer;
					var featureList = dataList;
					var defaultStyle = {
						radius : 5,
						fillColor : "#ff7800",
						color : "#999",
						weight : 1,
						opacity : 1,
						fillOpacity : 0.8
					};
					var options = this.options || {};
					if (!L.Util.isArray(featureList) || featureList === undefined || featureList === null) {
						console.log("你的数据为空，或者不是数组格式");
						return null;
					}
					pointClusterLayer = L.markerClusterGroup({
								showCoverageOnHover : false,
								spiderfyOnMaxZoom : true,
								disableClusteringAtZoom : 15,
								animate : true
							});
					geojsonData = EMap.Utils.dataToGeoJson(featureList, "Point");
					if (options.style) {
						style = $.extend(true, {}, defaultStyle, options.style);
					} else {
						style = defaultStyle;
					}
					var styleHtml = "";
					if (style.fillColor) {
						styleHtml = "background:" + style.fillColor;
					}
					var pointsList = geojsonData.features;
					$.each(pointsList, function(index, feature) {
								var latlng = L.extend([], feature.geometry.coordinates).reverse();
								var marker = L.circleMarker(latlng, style);
								if (feature.properties.name) {
									marker.bindTooltip(feature.properties.name);
								}
								if (feature.properties.popupContent) {
									marker.bindPopup(feature.properties.popupContent);
								}
								pointClusterLayer.addLayer(marker);
							});

					return pointClusterLayer;
				}

			});
	EMap.Layers.clusterLayer = function(dataList, options) {
		var layer = new EMap.Layers.ClusterLayer(options);
		return layer.getClusterLayer(dataList);
	};
}());