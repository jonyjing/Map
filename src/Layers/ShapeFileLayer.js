(function() {
  EMap.Layers.ShapeFileLayer = EMap.Layers.extend({
    includes: [L.Evented],
    options: {
      style: {
        pointStyle: {
          text_style: {
            font_color: 'black'
          },
          icon_style: {
            fillColor: 'blue'
          },
          label: {
            showZoom: 15
          },
          featureType: EMap.Utils.PointType
        },
        polylineStyle: {
          weight: 2,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.7
        },
        polygonStyle: {
          weight: 1,
          color: 'red',
          dashArray: '',
          fillOpacity: 0.3
        }
      },
      labelColumn: 'name'
    },
    initialize: function(files, options) {
      this.options = $.extend(true, {}, this.options, options);
      EMap.Layers.CanvasLayer.prototype.initialize.call(this, this.options);
      this.readFile(files);
    },

    readFile: function(files) {
      var file = files[0];

      this._loadFile(file, function(err, content, ctx) {
        if (err) {
          console.log('读取文件出错');
        } else {
          ctx._readFileContent(file.name, content);
        }
      });
    },

    _loadFile: function(file, cb) {
      var ctx = this;
      var reader = new FileReader(),
        isBinary = MapShaper.isBinaryFile(file.name);
      if (isBinary) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file, 'UTF-8');
      }
      reader.onload = function(e) {
        cb(null, reader.result, ctx);
      };
    },

    _readFileContent: function(name, content) {
      var type = MapShaper.guessInputType(name, content),
        importOpts = {},
        dataset,
        lyr;
      var dataset = this.dataset;
      if (type == 'dbf') {
        if (dataset) {
          lyr = dataset.layers[0];
          lyr.data = new MapShaper.ShapefileTable(content, 'utf8');
          var geometry_type = dataset.layers[0].geometry_type;
          if (geometry_type == 'point') {
            this._reCreatePointLayer(dataset);
          }
          if (lyr.shapes && lyr.data.size() != lyr.shapes.length) {
            MapShaper.stop('.dbf 与对应的 .shp 文件中记录数不一样。');
          }
        } else {
          MapShaper.stop('未找到对应的shape文件，请先导入shape文件。');
        }
      } else if (type == 'prj') {
      } else {
        this._importFileContent(type, name, content, importOpts);
      }
    },

    _importFileContent: function(type, path, content, importOpts) {
      var size = content.byteLength || content.length, // ArrayBuffer
        // or string
        showMsg = size > 4e7, // don't show message if dataset is small
        delay = 0;
      importOpts.files = [path]; // TODO: try to remove this
      if (showMsg) {
        delay = 35;
      }
      var self = this;
      setTimeout(function() {
        var dataset = MapShaper.importFileContent(content, path, importOpts);
        self.dataset = dataset;
        self.fire('onfinished');
      }, delay);
    },

    onAdd: function(map) {
      var dataset = this.dataset;
      if (dataset) {
        var layer = this._createLayers(dataset);
        dataset.layers[0].leafletLayer = layer;
        this.map = map;
        map.addLayer(layer);
      }
    },

    _reCreatePointLayer: function(dataset) {
      if (dataset.layers[0].leafletLayer) {
        this.map.removeLayer(dataset.layers[0].leafletLayer);
      }
      var points = dataset.layers[0].shapes;
      var layer = this._createPointsLayer(points, this);
      dataset.layers[0].leafletLayer = layer;
      this.map.addLayer(layer);
    },

    _createLayers: function(dataset) {
      var ctx = this;
      var geometry_type = dataset.layers[0].geometry_type;
      var hit = MapShaper.hitShape(dataset.arcs, dataset.layers[0].shapes);
      var layer;
      if (geometry_type === 'point') {
        var points = dataset.layers[0].shapes;
        layer = this._createPointsLayer(points, ctx);
      } else if (geometry_type === 'polygon') {
        var polygonArray = dataset.arcs.toArray();
        layer = this._createPolygonsLayer(polygonArray, hit, ctx);
      } else if (geometry_type === 'polyline') {
        var polyLineArray = dataset.arcs.toArray();
        layer = this._createPolylinesLayer(polyLineArray, hit, ctx);
      }
      return layer;
    },

    setZIndex: function(zIndex) {
      var layer = dataset.layers[0].leafletLayer;
      if (layer) {
        layer.setZIndex(zIndex);
      }
    },

    _createPolylinesLayer: function(polyLineArray, hit, ctx) {
      var featureGroup = L.featureGroup();
      var myRenderer = L.canvas({
        padding: 0.5
      });
      var option = $.extend(true, {}, this.options.style.polylineStyle, {
        renderer: myRenderer
      });
      polyLineArray.forEach(function(polyline, index) {
        polyline = L.GeoJSON.coordsToLatLngs(polyline);
        var polylineLayer = L.polyline(polyline, option).addTo(featureGroup);
        if (ctx.hasEventListeners('click')) {
          polylineLayer.on('click', function(ev) {
            var layer = ev.target;
            var latlng = ev.latlng;
            var hits = hit.polylineHit(latlng.lng, latlng.lat);
            var ShapefileTable = ctx.dataset.layers[0].data;
            if (ShapefileTable) {
              var attrs = ShapefileTable.getRecordAt(hits[0]);
              ctx.fire('click', {
                obj: attrs,
                event: ev,
                geometry_type: 'polyline'
              });
            } else {
              console.log('请导入对应的dbf文件。');
            }
          });
        }
      });
      return featureGroup;
    },

    destroy: function() {
      if (this.dataset) {
        var dataset = this.dataset;
        if (dataset.layers[0].leafletLayer)
          this.map.removeLayer(dataset.layers[0].leafletLayer);
      }
      delete this.dataset;
      delete dataset;
    },

    _createPolygonsLayer: function(polygonArray, hit, ctx) {
      var featureGroup = L.featureGroup();
      var myRenderer = L.canvas({
        padding: 0.5
      });
      var option = $.extend(true, {}, this.options.style.polygonStyle, {
        renderer: myRenderer
      });
      polygonArray.forEach(function(polygon, index) {
        polygon = L.GeoJSON.coordsToLatLngs(polygon);
        var polygonLayer = L.polygon([polygon], option).addTo(featureGroup);
        if (ctx.hasEventListeners('click')) {
          polygonLayer.on('click', function(ev) {
            var layer = ev.target;
            var latlng = ev.latlng;
            var hits = hit.polygonHit(latlng.lng, latlng.lat);
            var ShapefileTable = ctx.dataset.layers[0].data;
            if (ShapefileTable) {
              var attrs = ShapefileTable.getRecordAt(hits[0]);
              ctx.fire('click', {
                obj: attrs,
                event: ev,
                geometry_type: 'polygon'
              });
            } else {
              console.log('请导入对应的dbf文件。');
            }
          });
        }
      });
      return featureGroup;
    },

    _createPointsLayer: function(points, ctx) {
      var dataList = [];
      var attrs;
      var ShapefileTable = ctx.dataset.layers[0].data;
      points.forEach(function(point, index) {
        var name = index;
        if (ShapefileTable) {
          attrs = ShapefileTable.getRecordAt(index);
          name = attrs[ctx.options.labelColumn];
        }
        data = {
          name: name,
          properties: attrs,
          coordinates: point[0]
        };
        dataList.push(data);
      });
      var layer = EMap.Layers.CanvasLayer.markerLabel(
        dataList,
        this.options.style.pointStyle
      );
      if (ctx.hasEventListeners('click')) {
        layer.on('click', function(ev) {
          var attrs = ev.obj;
          ctx.fire('click', {
            obj: attrs,
            event: ev,
            geometry_type: 'point'
          });
        });
      }
      return layer;
    },

    onRemove: function(map) {
      if (this.dataset) {
        var dataset = this.dataset;
        if (dataset.layers[0].leafletLayer) {
          map.removeLayer(dataset.layers[0].leafletLayer);
        }
      }
    }
  });
  EMap.Layers.shapeFileLayer = function(file, options) {
    return new EMap.Layers.ShapeFileLayer(file, options);
  };
})();
