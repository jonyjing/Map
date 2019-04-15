L.CRS.EPSG4490 = new L.Proj.CRS(
  'EPSG:4490',
  '+proj=longlat +ellps=GRS80 +no_defs',
  {
    resolutions: [
      1.40625,
      0.703125,
      0.3515625,
      0.17578125,
      0.087890625,
      0.0439453125,
      0.02197265625,
      0.010986328125,
      0.0054931640625,
      0.00274658203125,
      0.001373291015625,
      0.0006866455206208891,
      0.00034332276031044456,
      0.00017166138015522228,
      8583069007761114e-20,
      4291534503880557e-20,
      21457672519402785e-21,
      10728836259701392e-21,
      5364418129850696e-21,
      2682209064925349e-21,
      13411045324626745e-22,
      6.705522537e-7
    ],
    origin: [-180, 90],
    bounds: L.bounds([-180, -90], [180, 90])
  }
);
var apiKey = '60ff613465605f48e9571d1d19ffd5fc';
L.TileLayer.TDT = L.TileLayer.extend({
  layername: 'vec',
  initialize: function(t, options) {
    var options = options || {};
    this.layername = options.layer || this.layername;
    L.setOptions(this, options);
  },
  getTileUrl: function(coords) {
    var e = coords.y,
      i = coords.x,
      n = coords.z;
    var url = '';
    var params =
      '?Service=WMTS&Request=GetTile&Version=1.0.0&Style=Default&Format=tiles&serviceMode=KVP&layer=' +
      this.layername +
      '&TileMatrixSet=c&TileMatrix=' +
      n +
      '&TileRow=' +
      e +
      '&TileCol=' +
      i;
    if (this.options.localMapServer != undefined) {
      url = this.options.localMapServer;
      return url + params;
    } else {
      url =
        'http://t' +
        parseInt(7 * Math.random()) +
        '.tianditu.com/' +
        this.layername +
        '_c/wmts';
      return url + params + '&tk=' + apiKey || TDT_key;
    }
  }
});
L.tileLayer.tdt = function(options) {
  return new L.TileLayer.TDT(null, options);
};

L.TileLayer.TDTMercator = L.TileLayer.extend({
  layername: 'vec',
  initialize: function(t, options) {
    var options = options || {};
    this.layername = options.layer || this.layername;
    L.setOptions(this, options);
  },
  getTileUrl: function(coords) {
    var e = coords.y,
      i = coords.x,
      n = coords.z;
    return (
      'http://t' +
      parseInt(7 * Math.random()) +
      '.tianditu.cn/' +
      this.layername +
      '_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=' +
      this.layername +
      '&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL=' +
      i +
      '&TILEROW=' +
      e +
      '&TILEMATRIX=' +
      n
    );
  }
});
L.tileLayer.tdtMercator = function(t) {
  return new L.TileLayer.TDTMercator(null, t);
};
