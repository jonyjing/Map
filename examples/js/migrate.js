(function() {
  var baseLayersConfigs = [
    {
      mapName: 'geoq_blue',
      cssmapImg: 'baseMapSwitch-vector',
      layerType: 'tile',
      layerOption: {
        url:
          'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
      }
    },
    {
      mapName: 'geoq_community',
      cssmapImg: 'baseMapSwitch-vector',
      layerType: 'tile',
      layerOption: {
        url:
          'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}'
      }
    }
  ];
  var map = new EMap.Map('mapDiv', {
    minZoom: 1,
    zoom: 8,
    baseMapSwitchControl: { configs: baseLayersConfigs, show: false },
    crs: L.CRS.EPSG3857
  });
  var layer = EMap.Layers.CanvasLayer.migrateLayer(migrateData, {
    style: {
      pathStyle: 'curve',
      //pathStyle : "straight",
      image: /*
       * { font : "14px FontAwesome", pathImageFont : "\uf197",
       * color : "rgba(29,219,99,0.7)" }
       */ null,
      trail: 10,
      arrowHead: false,
      weight: 2,
      curveness: 0,
      wavesColor: '#00FF00',
      lineColor: function(properties) {
        var value = properties.value;
        return value > 60
          ? '#800026'
          : value > 50
          ? '#BD0026'
          : value > 40
          ? '#E31A1C'
          : value > 30
          ? '#FC4E2A'
          : value > 20
          ? '#FD8D3C'
          : value > 10
          ? '#FEB24C'
          : value > 0
          ? '#FED976'
          : '#FFEDA0';
      }
    }
  });
  map.addLayer(layer);

  var length = citysData.length;
  var maxValue = citysData[0].value;
  var minValue = citysData[length - 1].value;
  var maxlevel = (maxValue - minValue) / minValue;
  var citysLayer = EMap.Layers.FeatureLayer.point(citysData, {
    style: function(properties) {
      var city_gdp = properties.value;
      var level = (maxValue - city_gdp) / minValue;
      return {
        radius: (maxlevel - level + 1) * 5,
        color: 'rgba(255,43,69,0.5)',
        fillColor: 'rgba(255,43,69,1)',
        weight: (maxlevel - level + 1) * 5,
        fillOpacity: 0.7,
        opacity: 0.5
      };
    }
  });
  layer.on('mousemove', function(e) {
    console.log(e.obj.from_name + '-' + e.obj.to_name + ':' + e.obj.value);
  });
  map.addLayer(citysLayer);
  map.fitBounds(citysLayer.getBounds());
})();
