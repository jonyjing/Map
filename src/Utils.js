(function() {
	EMap.Utils = function() {
		var rtree = null;
		var dataToGeoJson = function(dataList, featureType) {
			var geoJson = {
				type : 'FeatureCollection',
				features : []
			};

			$.each(dataList, function(index, obj) {
						var feature = {
							geometry : {
								type : featureType,
								coordinates : obj.coordinates
							},
							type : "Feature",
							properties : {}
						};
						$.each(obj, function(key, value) {
									if (key !== 'coordinates') {
										feature.properties[key] = value;
									}
								});

						geoJson.features.push(feature);
					});

			return geoJson;
		};

		var fomatterColor = function(color) {
			var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
			var sColor = color.toLowerCase();
			if (color.indexOf("rgba") > -1) {
				return color;
			} else if (color.indexOf("rgb") > -1) {
				var aColor = color.replace(/(?:||rgb|RGB)*/g, "").replace(/\(/g, "").replace(/\)/g, "").split(",");
				var colorStr = "";
				for (var i = 0; i < aColor.length; i++) {
					colorStr = colorStr + aColor[i] + ",";
				}
				return "rgba(" + colorStr + "1)";
			} else if (reg.test(sColor)) {
				if (sColor.length === 4) {
					var sColorNew = "#";
					for (var i = 1; i < 4; i += 1) {
						sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
					}
					sColor = sColorNew;
				}
				// 处理六位的颜色值
				var sColorChange = [];
				for (var i = 1; i < 7; i += 2) {
					sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
				}
				return "rgba(" + sColorChange.join(",") + ",1)";
			}
		};

		return {
			dataToGeoJson : dataToGeoJson,
			fomatterColor : fomatterColor
		};
	}();
	EMap.Utils.PolygonType = "Polygon";
	EMap.Utils.LineStringType = "LineString";
	EMap.Utils.PointType = "Point";
}());