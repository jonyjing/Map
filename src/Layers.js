(function() {
  EMap.Layers.serviceLayer = (function() {
    var createLayer = function(layerType, layerOption) {
      var layer;
      var selectedFilter;
      var layerTheme = layerOption.layerTheme;
      if (layerTheme) {
        var selectedCSSFilter = L.ImageFilters.Presets.CSS[layerTheme];
        var selectedChannelFilter = L.ImageFilters.Presets.CanvasChannel.None;
        selectedFilter = function(image, ctx) {
          return new L.CombinedFilter({
            cssFilter: selectedCSSFilter,
            canvasFilter: selectedChannelFilter
          }).render(this, image, ctx);
        };
      }
      switch (layerType) {
        case 'wmts':
          layer = L.tileLayer.wmts(layerOption.url, layerOption);
          break;
        case 'tile':
          layer = L.tileLayer(layerOption.url, layerOption);
          if (selectedFilter) {
            layer.setFilter(selectedFilter);
          }
          break;
        case 'tdt':
          layer = _tdtLayer(layerOption, selectedFilter);
          break;
        case 'image':
          layer = L.imageOverlay(layerOption.url, layerOption.bounds);
      }
      return layer;
    };

    function _tdtLayer(layerOption, selectedFilter) {
      var layer;
      var localMapServer = layerOption.localMapServer;
      var bounds =
        layerOption.bounds ||
        L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));
      switch (layerOption.crs_name) {
        case 'EPSG4490':
          switch (layerOption.layer) {
            case 'vec_d':
              layer = L.tileLayer.tdt({
                name: '底图',
                layer: 'vec',
                localMapServer: localMapServer,
                bounds: bounds
              });
              break;
            case 'vec_z':
              layer = L.tileLayer.tdt({
                name: '注记',
                layer: 'cva',
                localMapServer: localMapServer,
                bounds: bounds
              });
              break;
            case 'img_d':
              layer = L.tileLayer.tdt({
                name: '底图',
                layer: 'img',
                localMapServer: localMapServer,
                bounds: bounds
              });
              break;
            case 'imd_z':
              layer = L.tileLayer.tdt({
                name: '注记',
                layer: 'cia',
                localMapServer: localMapServer,
                bounds: bounds
              });
              break;
            case 'vec':
              var vec = L.tileLayer.tdt({
                name: '底图',
                layer: 'vec',
                localMapServer: localMapServer,
                bounds: bounds
              });
              var cva = L.tileLayer.tdt({
                name: '注记',
                layer: 'cva',
                localMapServer: localMapServer,
                bounds: bounds
              });
              if (selectedFilter) {
                vec.setFilter(selectedFilter);
                cva.setFilter(selectedFilter);
              }
              layer = L.layerGroup([vec, cva]);
              break;
            case 'img':
              layer = L.layerGroup([
                L.tileLayer.tdt({
                  name: '底图',
                  layer: 'img',
                  localMapServer: localMapServer,
                  bounds: bounds
                }),
                L.tileLayer.tdt({
                  name: '注记',
                  layer: 'cia',
                  localMapServer: localMapServer,
                  bounds: bounds
                })
              ]);
              break;
          }
          break;
      }
      return layer;
    }

    return {
      createLayer: createLayer
    };
  })();
})();
