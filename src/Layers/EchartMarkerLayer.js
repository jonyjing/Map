(function() {
	EMap.Layers.EchartMarkerLayer = EMap.Layers.extend({
		options : {
			style : {
				chartWidth : 130,
				chartHeight : 130
			},
			zoomInFactor:1.2,
			zoomOutFactor:0.9
		},
		initialize : function(dataList, options) {
			L.setOptions(this, options);
			this.dataList = dataList;
		},

		onAdd : function(map) {
			this._map = map;
			this.chartLayer = L.featureGroup();
			this.arr_charts = [];
			map.addLayer(this.chartLayer);
			var wh=this._computerChartWH(map);
			this._createLayer(wh.width, wh.height);
			var legendData = this.arr_charts[0].getOption().legend[0].data;
			var legendColors=this.arr_charts[0].getOption().color;
			var legendControlData={};
			$.each(legendData, function(index, value) {
						legendControlData[value]=legendColors[index];
					});
			this.legendControl = EMap.Controls.legendControl(legendControlData);
			map.addControl(this.legendControl);
			map.on({
				'zoomend' : this._reset
			}, this);
		},

		onRemove : function(map) {
			map.removeLayer(this.chartLayer);
			map.removeControl(this.legendControl);
			map.off({
				'zoomend' : this._reset
			}, this);
			this.arr_charts = [];
			this.chartLayer = null;
		},

		_reset : function(e) {
			var map = this._map;
			this.chartLayer.clearLayers();
			this.arr_charts.forEach(function(chart) {
				chart.dispose();
			});
			var wh=this._computerChartWH(map);
			this._createLayer(wh.width, wh.height);
		},

		_createEchartMarker : function(data, width, height) {
			var chartWidth, chartHeight;
			chartWidth = width == undefined ? this.options.style.chartWidth : width;
			chartHeight = height == undefined ? this.options.style.chartHeight : height;
			var id = "echartMarker_" + data.id;
			var coordinates = data.coordinates;
			var chartOptions = data.chartOptions;
			var chartIcon = L.divIcon({
				className : "leaflet-echart-icon",
				iconSize : [ chartWidth, chartHeight ],
				html : '<div id="' + id + '" style="width: ' + chartWidth + "px; height: " + chartHeight
						+ 'px; position: relative; background-color: transparent;"></div>',
				iconAnchor : [ chartWidth / 2, chartHeight / 2 ]
			});

			var chartMarker = (L.marker([ coordinates[1], coordinates[0] ], {
				icon : chartIcon
			})).addTo(this.chartLayer);
			var chart = echarts.init(document.getElementById(id));
			chart.setOption(chartOptions);
			this.arr_charts.push(chart);
		},

		getEcharts : function() {
			return this.arr_charts;
		},
		
		_computerChartWH:function(map){
			var map_initZoom = map.options.zoom;
			var zoom = map.getZoom();
			var chartWidth, chartHeight;
			if (zoom < map_initZoom) {
				chartWidth = this.options.style.chartWidth * Math.pow(this.options.zoomOutFactor, map_initZoom - zoom);
				chartHeight = this.options.style.chartHeight * Math.pow(this.options.zoomOutFactor, map_initZoom - zoom);
			} else if(zoom > map_initZoom){
				chartWidth = this.options.style.chartWidth * Math.pow(this.options.zoomInFactor, zoom - map_initZoom);
				chartHeight = this.options.style.chartHeight * Math.pow(this.options.zoomInFactor, zoom - map_initZoom);
			}else{
				chartWidth = this.options.style.chartWidth;
				chartHeight = this.options.style.chartHeight;
			}
			return {
				width:chartWidth,
				height:chartHeight
			};
		},

		_createLayer : function(chartWidth, chartHeight) {
			var self = this;
			$.each(this.dataList, function(index, data) {
				self._createEchartMarker(data, chartWidth, chartHeight);
			});
		}

	});
	EMap.Layers.echartMarkerLayer = function(dataList, options) {
		return new EMap.Layers.EchartMarkerLayer(dataList, options);
	};
}());