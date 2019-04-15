(function() {
  function LeafletCoordSys(map, api) {
    this._map = map;
    this._mapOffset = [0, 0];
    this._api = api;
    this._projection = L.Projection.Mercator;
  }

  LeafletCoordSys.dimensions = LeafletCoordSys.prototype.dimensions = [
    'lng',
    'lat'
  ];

  LeafletCoordSys.prototype.getLeaflet = function() {
    return this._map;
  };

  LeafletCoordSys.prototype.dataToPoint = function(data) {
    var point = new L.LatLng(data[1], data[0]);
    var px = this._map.latLngToContainerPoint(point);
    var mapOffset = this._mapOffset;
    return [px.x - mapOffset[0], px.y - mapOffset[1]];
  };

  LeafletCoordSys.prototype.pointToData = function(pt) {
    var mapOffset = this._mapOffset;
    var coord = this._map.layerPointToLatLng({
      x: pt[0] + mapOffset[0],
      y: pt[1] + mapOffset[1]
    });
    return [coord.lng, coord.lat];
  };
  if (typeof echarts === 'object') {
    LeafletCoordSys.prototype.convertToPixel = echarts.util.curry(
      doConvert,
      'dataToPoint'
    );
    LeafletCoordSys.prototype.convertFromPixel = echarts.util.curry(
      doConvert,
      'pointToData'
    );
  }

  function doConvert(methodName, ecModel, finder, value) {
    var leafletModel = finder.leafletModel;
    var seriesModel = finder.seriesModel;

    var coordSys = leafletModel
      ? leafletModel.coordinateSystem
      : seriesModel
      ? seriesModel.coordinateSystem || // For
        // map.
        (seriesModel.getReferringComponents('leaflet')[0] || {})
          .coordinateSystem
      : null;

    return coordSys === this ? coordSys[methodName](value) : null;
  }

  LeafletCoordSys.prototype.getViewRect = function() {
    var api = this._api;
    return new echarts.util.BoundingRect(0, 0, api.getWidth(), api.getHeight());
  };

  LeafletCoordSys.create = function(ecModel, api) {
    var leafletCoordSys = null;
    var leafletList = [];

    ecModel.eachComponent('leaflet', function(leafletModel) {
      leafletCoordSys = new LeafletCoordSys(echarts.leafletMap, api);
      leafletList.push(leafletCoordSys);
      leafletModel.coordinateSystem = leafletCoordSys;
    });

    ecModel.eachSeries(function(seriesModel) {
      if (seriesModel.get('coordinateSystem') === 'leaflet') {
        seriesModel.coordinateSystem = leafletCoordSys;
      }
    });

    return leafletList;
  };

  EMap.Layers.CanvasLayer.EchartMap = EMap.Layers.CanvasLayer.extend({
    container: null,
    _chart: null,
    _echartsOption: null,
    initialize: function(options) {
      if (options.chartOptions == undefined) {
        throw new Error('必须配置Echart options!');
      }
      this._echartsOption = options.chartOptions;
      EMap.Layers.CanvasLayer.prototype.initialize.call(this, this.options);

      echarts.registerCoordinateSystem('leaflet', LeafletCoordSys);
      echarts.extendComponentModel({
        type: 'leaflet'
      });
    },

    render: function() {
      this._initECharts();
      this._setEchartOption(this._echartsOption);
    },

    _geoCoord2Pixel: function(e) {
      var n = new t.latLng(e[1], e[0]),
        i = this._map.latLngToContainerPoint(n);
      return [i.x, i.y];
    },

    _pixel2GeoCoord: function(e) {
      var n = this._map.containerPointToLatLng(t.point(e[0], e[1]));
      return [n.lng, n.lat];
    },

    _setEchartOption: function(t, e) {
      this._chart.setOption(t);
    },

    _initECharts: function() {
      if (this._chart) {
        this._chart.dispose();
      }
      this._chart = echarts.init(this.container);
    },

    onAdd: function(map) {
      var size = map.getSize();
      // var echartLayer=map.createPane('echartLayer');
      this.container = map.createPane('echartPane');
      this.container.style.width = size.x + 'px';
      this.container.style.height = size.y + 'px';
      this.setZIndex(this.options.zIndex);
      echarts.leafletMap = map;
      // L.DomEvent.disableClickPropagation(this.container);
      EMap.Layers.CanvasLayer.prototype.onAdd.call(this, map);
    },
    onRemove: function(map) {
      this._chart.dispose();
      echarts.leafletMap = null;
      delete echarts.leafletMap;
      EMap.Layers.CanvasLayer.prototype.onRemove.call(this, map);
    }
  });
  EMap.Layers.CanvasLayer.echartMap = function(options) {
    return new EMap.Layers.CanvasLayer.EchartMap(options);
  };
})();
