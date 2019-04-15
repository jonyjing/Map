(function() {
  EMap.Layers.CanvasLayer.FeatureLabel = EMap.Layers.CanvasLayer.extend({
    options: {
      style: {
        font_color: '#000000',
        font_borderColor: '#ffffff',
        font_borderWidth: 0.3,
        font_style: 'bold',
        font_variant: 'normal',
        font_weight: 'normal',
        font_size: 12,
        font_family: 'Microsoft Yahei'
      }
    },

    initialize: function(dataList, options) {
      options = options || {};
      this.options = $.extend(true, {}, this.options, options);
      EMap.Layers.CanvasLayer.prototype.initialize.call(this, this.options);
      this.dataList = dataList;
    },
    render: function() {
      var self = this;
      this.stage.destroyChildren();
      var layer = new Konva.Layer();
      var type = this.options.featureType;
      var dataList = this.dataList;
      var canvas = layer.getCanvas();
      var ctx = layer.getCanvas().getContext();
      var imageObj = new Image();
      imageObj.src = "images/map/marker.png'";
      imageObj.onload = function() {
        for (var i = 0; i < dataList.length; i++) {
          var LabelPoint;
          var data = dataList[i];
          if (type === EMap.Utils.LineStringType) {
            var linestring = turf.lineString(data.coordinates);
            LabelPoint = turf.pointOnSurface(linestring);
          } else if (type === EMap.Utils.PolygonType) {
            var polygon = turf.polygon(data.coordinates);
            LabelPoint = turf.pointOnSurface(polygon);
          } else {
            LabelPoint = turf.point(data.coordinates);
          }
          var LabelPoint_latlng = new L.LatLng(
            LabelPoint.geometry.coordinates[1],
            LabelPoint.geometry.coordinates[0]
          );
          var mapBoundsbox = self._map.getBounds();
          if (!mapBoundsbox.contains(LabelPoint_latlng)) {
            continue;
          }
          LabelPoint = self._map.latLngToContainerPoint(LabelPoint_latlng);
          var txtWidth = ctx.measureText(data.name).width;

          if (!data.yoda) {
            var yoda = new Konva.Image({
              x: LabelPoint.x - 8,
              y: LabelPoint.y - 8,
              image: imageObj,
              width: 16,
              height: 16
            });
            data.yoda = yoda;
          } else {
            data.yoda.x(LabelPoint.x - 8);
            data.yoda.y(LabelPoint.y - 8);
          }
          if (!data.simpleText) {
            var simpleText = new Konva.Text({
              x: LabelPoint.x - txtWidth / 2,
              y: LabelPoint.y + 10,
              data: data,
              text: data.name,
              fontSize: self.options.style.font_size,
              fontFamily: self.options.style.font_family,
              fontStyle: self.options.style.font_style,
              fill: self.options.style.font_color,
              perfectDrawEnabled: false,
              stroke: self.options.style.font_borderColor,
              strokeWidth: self.options.style.font_borderWidth
            });
            data.simpleText = simpleText;
          } else {
            data.simpleText.x(LabelPoint.x - txtWidth / 2);
            data.simpleText.y(LabelPoint.y + 10);
          }

          layer.add(data.yoda);
          layer.add(data.simpleText);
        }
        layer.on('click', function(evt) {
          var node = evt.target;
          if (node) {
            self.fire('click', {
              obj: node.attrs.data
            });
          }
        });
        self.stage.add(layer);
      };
    },

    onAdd: function(map) {
      var size = map.getSize(),
        self = this;
      this.container = map.createPane('canvasLabel');
      this.setZIndex(this.options.zIndex);
      this.stage = new Konva.Stage({
        container: this.container,
        width: size.x,
        height: size.y
      });
      EMap.Layers.CanvasLayer.prototype.onAdd.call(this, map);
    },
    onRemove: function(map) {
      this.stage.destroy();
      this.stage = null;
      EMap.Layers.CanvasLayer.prototype.onRemove.call(this, map);
    }
  });
  EMap.Layers.CanvasLayer.featureLabel = function(dataList, options) {
    return new EMap.Layers.CanvasLayer.FeatureLabel(dataList, options);
  };
})();
