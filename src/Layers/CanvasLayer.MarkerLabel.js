(function() {
  EMap.Layers.CanvasLayer.MarkerLabel = EMap.Layers.CanvasLayer.extend({
    options: {
      text_style: {
        font_color: 'red',
        font_borderColor: '#ffffff',
        font_borderWidth: '3',
        font_style: 'normal',
        font_variant: 'normal',
        font_weight: 'normal',
        font_size: '12px',
        font_family: 'Microsoft Yahei'
      },
      icon_style: {
        max_num: 10000,
        url:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAABv1BMVEUAAADVKyvbJCS/QCDVQCvbNzfMRDPRRjrTQzfWPTPYRTHZQjnbQDfcPjXaQznbRjjaRDfbRTnbRDjcQzjZRjjaRDrbRDnbRjncRjraRTjcRDnbRDncRTncRTjbRTncRTnbRTnbRTncRTnbRTnbRjncRTrcRTnbRTrbRTnbRTnbRTncRjrbRjnbRjrbRTncRTnqlY7qlo/sm5TsnJftnpftnpjsopvto5zto53wsavxs63xtK7xtLDxtbH0zMn1zsz10M375+X76+n77Ov87ev87u387+798vH98vL98/P++Pf++vr++/r+/Pz//v3cRjrcSDzdST3dSj7dSj/dTEDdTULeTkLeT0TeUEXeUUbeUkbeUkfeU0jfVEnhXlPhYVfhYlfiZFriaF7jamHjbWTkbmTkb2bkcGfkcWjlc2rldGvldWzngXnngnrohHzpiYLpioPpjITqjobqj4fqj4jqkInqkYrsnZftn5nwsq3xtK/yvLjzvbn0xcH1y8f1y8j1zMn2zcr2zsr2z8z20c720s/309D429j54d/64uD64+H64+L65OL65eP65uT76+n87ez99fT99vb//v7///+4ukhLAAAAT3RSTlMABgcIDA4PFhcZGhscHUxNU1VWV19hYmNmaIqOkJGipqmqrbKztba5v8DBwsXGyMrf3+Hh4eLj4+Pn5+fo6O/w8Pf5+fn5+vv7+/z9/f7+kgHTrgAAAVhJREFUGBlNwYc7QlEYB+CvKHvvEVnXuPYoKyJl+0nIyMjee4+MIivz/MHOc9wH70s/tPE6qaJC0iVo6Y86uajWbB0YsJrr5OQgUkTojbabg2n7yOzela0+J5KEKKn5ZQ2K1WdTYRRxar3pbhK/JnymHDURpRkDE/hn5MGYQqSVu5YgnBxDWLCVaCmm6hqC4/3NDsFTl0DpLdsQthjbgrBn1lFumxvAzqn3g7EP39kugFmbRHKPE4CHKTwARvvLqaxvGIDjkgmXDgBD/eWUb5kBZ39i3JMd3LRVovSWI3CDn4z7HAS3b86k6MpbcHPs6+L8i82Du66Np+AiywqADf8ysOTfBLDYUawhSjQEpvDP+KMxiYhU2Q33Lvxy3TVkqYkLLWh8XYdiLdAkhZAQlm3o9B25x5zuQ2+3QR9OClWqXN3a3ttraa2R01T0RxObkVdamp8RpyHhGy8KgC4Bj+iFAAAAAElFTkSuQmCC',
        width: 8,
        height: 8,
        fillColor: 'red'
      },
      label: {
        showZoom: 13
      }
    },

    initialize: function(dataList, options) {
      options = options || {};
      this.options = $.extend(true, {}, this.options, options);
      EMap.Layers.CanvasLayer.prototype.initialize.call(this, this.options);
      this.dataList = dataList;
    },
    render: function() {
      var type = this.options.featureType;
      var textStyle = this.options.text_style;
      var dataList = this.dataList;
      var canvas = this.canvas;
      var ctx = canvas.getContext('2d');
      this.rtree = RTree();
      var showNum = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.font =
        textStyle.font_style +
        ' ' +
        textStyle.font_variant +
        ' ' +
        textStyle.font_weight +
        ' ' +
        textStyle.font_size +
        ' ' +
        textStyle.font_family;
      ctx.strokeStyle = textStyle.font_borderColor;
      ctx.lineWidth = textStyle.font_borderWidth * 2;
      ctx.fillStyle = textStyle.font_color;
      for (var i = 0; i < dataList.length; i++) {
        var data = dataList[i];
        if (!data.txtWidth) {
          txtWidth = ctx.measureText(data.name).width;
          data.txtWidth = txtWidth;
        }
        this._drawMarker(ctx, data);
      }
    },

    addMarker: function(data) {
      var canvas = this.canvas;
      var ctx = canvas.getContext('2d');
      this.dataList.push(data);
      this._drawMarker(ctx, data);
    },

    _drawMarker: function(ctx, data) {
      var sum_data_length = this.dataList.length;
      var zoom = this._map.getZoom();
      var LabelPoint = this._computerLocate(data);
      if (LabelPoint == null) {
        return;
      }
      var imgPoint = {
        x: LabelPoint.x - this.options.icon_style.width / 2,
        y: LabelPoint.y - this.options.icon_style.height / 2
      };
      if (zoom >= this.options.label.showZoom) {
        ctx.fillStyle = this.options.text_style.font_color;
        ctx.strokeText(
          data.name,
          LabelPoint.x - data.txtWidth / 2,
          LabelPoint.y + 20
        );
        ctx.fillText(
          data.name,
          LabelPoint.x - data.txtWidth / 2,
          LabelPoint.y + 20
        );
        var topLeft_x = LabelPoint.x - (data.txtWidth + 8) / 2;
        var topLeft_y = LabelPoint.y + 8;
        this.rtree.insert(
          {
            x: topLeft_x,
            y: topLeft_y,
            w: data.txtWidth + 8,
            h: 16
          },
          data
        );
      }
      if (sum_data_length < this.options.icon_style.max_num) {
        if (data.canvas_img) {
          ctx.drawImage(
            data.canvas_img,
            imgPoint.x,
            imgPoint.y,
            this.options.icon_style.width,
            this.options.icon_style.height
          );
        } else {
          var self = this;
          (data.canvas_img = new Image()),
            (data.canvas_img.src = this.options.icon_style.url);
          data.canvas_img.onload = function() {
            ctx.drawImage(
              data.canvas_img,
              imgPoint.x,
              imgPoint.y,
              self.options.icon_style.width,
              self.options.icon_style.height
            );
          };
        }
      } else {
        ctx.fillStyle = this.options.icon_style.fillColor;
        ctx.fillRect(imgPoint.x, imgPoint.y, 4, 4);
        /*
         * ctx.beginPath(); ctx.arc(imgPoint.x,imgPoint.y, 1, 0,
         * 2 * Math.PI, true); ctx.fill();
         */
      }
    },

    _computerLocate: function(data) {
      var LabelPoint;
      var type = this.options.featureType;
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
      var mapBoundsbox = this._map.getBounds();
      if (!mapBoundsbox.contains(LabelPoint_latlng)) {
        LabelPoint = null;
      } else {
        LabelPoint = this._map.latLngToContainerPoint(LabelPoint_latlng);
      }
      return LabelPoint;
    },

    _onMouseClick: function(e) {
      if (this.rtree == null) {
        return;
      }
      var point = [e.clientX, e.clientY];
      var obj = this.rtree.search({
        x: point[0],
        y: point[1],
        w: 0,
        h: 0
      });
      if (obj.length !== 0) {
        var latlng = this._map.containerPointToLatLng(point);
        if (e.type === 'click') {
          this.fire('click', {
            obj: obj,
            latlng: latlng
          });
        } else {
          this.canvas.style.cursor = 'pointer';
        }
      } else {
        this.canvas.style.cursor = '';
      }
    },
    onAdd: function(map) {
      var size = map.getSize();
      this.container = map.createPane('canvasLabel');
      this.setZIndex(this.options.zIndex);
      this.canvas = this._createCanvas(size);
      this.container.appendChild(this.canvas);
      EMap.Layers.CanvasLayer.prototype.onAdd.call(this, map);
      L.DomEvent.addListener(
        map.getContainer(),
        'click',
        this._onMouseClick,
        this
      );
      L.DomEvent.addListener(
        map.getContainer(),
        'mousemove',
        this._onMouseClick,
        this
      );
    },
    onRemove: function(map) {
      L.DomEvent.removeListener(
        map.getContainer(),
        'click',
        this._onMouseClick,
        this
      );
      L.DomEvent.removeListener(
        map.getContainer(),
        'mousemove',
        this._onMouseClick,
        this
      );
      EMap.Layers.CanvasLayer.prototype.onRemove.call(this, map);
      this.rtree = null;
    }
  });
  EMap.Layers.CanvasLayer.markerLabel = function(dataList, options) {
    return new EMap.Layers.CanvasLayer.MarkerLabel(dataList, options);
  };
})();
