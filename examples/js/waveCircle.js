(function() {
  var baseLayersConfigs = [
    {
      mapName: '天地图矢量',
      layerType: 'tdt',
      cssmapImg: 'baseMapSwitch-vector',
      layerOption: {
        crs_name: 'EPSG4490',
        layer: 'vec',
        layerTheme: 'Dark'
        /*bounds: L.latLngBounds(
          L.latLng(25.4163, 109.6299),
          L.latLng(20.0595, 117.3593)
        )*/
      }
    },
    {
      mapName: '天地图影像',
      layerType: 'tdt',
      cssmapImg: 'baseMapSwitch-image',
      layerOption: {
        crs_name: 'EPSG4490',
        layer: 'img'
      }
    }
  ];

  var map = new EMap.Map('mapDiv', {
    minZoom: 1,
    crs: L.CRS.EPSG4490,
    baseMapSwitchControl: {
      configs: baseLayersConfigs,
      show: true
    },
    zoom: 7,
    continuousWorld: true
  });
  var length = citysData.length;
  var maxValue = citysData[0].value;
  var minValue = citysData[length - 1].value;
  var maxlevel = (maxValue - minValue) / minValue;
  var layer = EMap.Layers.CanvasLayer.waveCircle(citysData, {
    style: function(properties) {
      var city_gdp = properties.value;
      var level = (maxValue - city_gdp) / minValue;
      return {
        radius: (maxlevel - level + 1) * 5,
        fillColor: 'rgba(255,43,69,0.1)'
      };
    }
  });

  var dataLayer2 = EMap.Layers.FeatureLayer.point(citysData, {
    style: {
      radius: 7,
      color: 'rgb(200,43,69)',
      fillColor: 'rgb(200,43,69)',
      weight: 6,
      fillOpacity: 0.4,
      opacity: 0.2
    }
  });
  // map.addLayer(dataLayer2);
  // dataLayer2.on("click",function(e){console.log(e)});
  map.addLayer(layer);

  layer.on('click', function(e) {
    alert(e.obj[0].name);
  });
})();
