(function() {
  EMap.Controls = (function() {
    var baseMapSwitchControl = function(opts) {
      opts = opts || {};
      var baseMapSwitchControl = L.control.baseMapswitchControl(opts);
      return baseMapSwitchControl;
    };

    var leafletSliderCompare = function(opts) {
      return L.control.sideBySide(opts.leftLayer, opts.rightLayer);
    };

    var legendControl = function(legendData, opts) {
      opts = opts || {};
      var legend = L.control({
        position: opts.position || 'bottomright'
      });
      var className = opts.className || 'legend';
      legend.onAdd = function(map) {
        this.div = L.DomUtil.create('div', className);
        this.update(legendData);
        return this.div;
      };

      legend.update = function(legendData) {
        var self = this;
        this.div.innerHTML = '';
        $.each(legendData, function(key, value) {
          self.div.innerHTML +=
            '<i style="background:' + value + '"></i>' + key + '<br>';
        });
      };

      return legend;
    };

    var layerControl = function(opts) {
      opts = opts || {};
      var layersControl = L.control.layers(
        {},
        {},
        {
          position: opts.position || 'topright',
          collapsed: opts.collapsed || true
        }
      );
      return layersControl;
    };

    L.Control.LayerInfo = L.Control.extend({
      options: {
        position: 'bottomleft'
      },
      initialize: function(options) {
        L.setOptions(this, options);
      },
      onAdd: function(map) {
        this._div = L.DomUtil.create('div', 'layerInfo');
        this.updateContent();
        return this._div;
      },
      updateContent: function(props) {
        this._div.innerHTML = this.options.updateContent.call(this, props);
      }
    });

    L.control.layerInfo = function(options) {
      return new L.Control.LayerInfo(options);
    };

    return {
      legendControl: legendControl,
      layerControl: layerControl,
      baseMapSwitchControl: baseMapSwitchControl,
      layerInfoControl: L.control.layerInfo,
      leafletSliderCompare: leafletSliderCompare
    };
  })();
})();
