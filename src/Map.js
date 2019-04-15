(function() {
  // 地图底图配置
  var defaultBaseLayersConfigs = [
    {
      mapName: '天地图矢量',
      cssmapImg: 'baseMapSwitch-vector',
      layerType: 'tdt',
      layerOption: {
        crs_name: 'EPSG4490',
        layer: 'vec'
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

  var default_option = {
    crs: L.CRS.EPSG4490,
    maxZoom: 18,
    minZoom: 4,
    zoom: 4,
    center: [22.707966631294232, 113.4654563919944],
    attributionControl: false,
    baseMapSwitchControl: {
      configs: defaultBaseLayersConfigs,
      show: true
    },
    positionControl: true,
    scaleControl: true
  };
  EMap.Map = function(mapDiv, options) {
    var map_options = {};
    if (options) {
      map_options = $.extend(true, {}, default_option, options);
    } else {
      map_options = default_option;
    }
    var map = new L.Map(mapDiv, map_options);
    if (map_options.baseMapSwitchControl) {
      var baseMapSwitchControl = EMap.Controls.baseMapSwitchControl({
        configs: map_options.baseMapSwitchControl.configs
      });
      baseMapSwitchControl.addTo(map);
      if (map_options.baseMapSwitchControl.show === false) {
        baseMapSwitchControl.hide();
      }
      map.baseMapSwitchControl = baseMapSwitchControl;
    }
    if (map_options.scaleControl) {
      L.control
        .scale({
          imperial: false
        })
        .addTo(map);
    }
    return map;
  };
})();
