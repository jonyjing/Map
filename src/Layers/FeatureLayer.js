(function() {
	EMap.Layers.FeatureLayer = EMap.Layers.extend({
				options:{
					isLabelShow:false
				},

				initialize : function(options) {
					options = options || {};
					L.Util.setOptions(this, options);
					EMap.Layers.prototype.initialize.call(this, this.options);
					this.featureType = "";
				},
				_getLayerStyle : function() {
					var style;
					var featureType = this.featureType;
					switch (featureType) {
						case EMap.Utils.PointType :
							style = {
								radius : 5,
								fillColor : "#ff7800",
								color : "#999",
								weight : 0.5,
								opacity : 0.5,
								fillOpacity : 0.8
							};
							break;
						case EMap.Utils.PolygonType :
							style = {
								weight : 1,
								color : "#999",
								opacity : 1,
								fillColor : "#B0DE5C",
								fillOpacity : 0.6
							};
							break;
						case EMap.Utils.LineStringType :
							style = {
								weight : 3,
								color : "rgb(51, 136, 255)",
								opacity : 1
							};
							break;
						default :

					}
					return style;
				},
				_featureLayer : function(dataList, options) {
					var geojsonData, style, featureGroup_Layer;
					options = options || {};
					var featureList = dataList;
					if (!L.Util.isArray(featureList) || featureList === undefined || featureList === null) {
						console.log("你的数据为空，或者不是数组格式");
						return null;
					}
					geojsonData = EMap.Utils.dataToGeoJson(featureList, this.featureType);
					var defaultStyle = this._getLayerStyle(this.featureType);
					if (options.style) {
						if (typeof options.style === 'function') {
							style = options.style;
						} else {
							style = $.extend(true, {}, defaultStyle, options.style);
						}
					} else {
						style = defaultStyle;
					}

					var geojson_option = {
						pointToLayer : function(feature, latlng) {
							if (typeof options.style === 'function') {
								var properties=feature.properties;
								style = options.style(properties);
							}
							return L.circleMarker(latlng, style);
						},
						onEachFeature : function(feature, layer) {
							if (feature.properties.name) {
								layer.bindTooltip(feature.properties.name,{ noHide: options.isLabelShow});
							}
							if (feature.properties.popupContent) {
								layer.bindTooltip(feature.properties.popupContent);
							}
							/*
							 * layer.on("click",function(){ })
							 */

						}
					};
					if(this.featureType!==EMap.Utils.PointType){
						geojson_option.style=style;
					}
					featureGroup_Layer = L.geoJson(geojsonData, geojson_option);
					return featureGroup_Layer;
				}
			});
}());