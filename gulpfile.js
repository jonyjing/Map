'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  cssmin = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  clean = require('gulp-clean');

// 合并，压缩leaflet及插件文件
gulp.task('miniLeafletJs', function() {
  return gulp
    .src([
      'lib/rtree.min.js',
      'lib/map/turf.min.js',
      'lib/map/leaflet-1.2.0/leaflet.js',
      'lib/map/Proj4Leaflet/lib/proj4-compressed.js',
      'lib/map/Proj4Leaflet/src/proj4leaflet.js',
      'lib/map/geojson-polylineEncoding.js',
      'lib/map/leaflet-tilefilter.js',
      'lib/map/leaflet.contextmenu/leaflet.contextmenu.min.js',
      'lib/map/leaflet-basemapswitch/leaflet-basemapswitch.js',
      'lib/map/leaflet.TileLayer.WMTS/leaflet-tilelayer-wmts.min.js',
      'lib/map/Leaflet.MousePosition/L.Control.MousePosition.js',
      'lib/map/Leaflet.heat/leaflet-heat.js',
      'lib/map/Leaflet-clusterMarkers/leaflet.markercluster.js',
      'lib/map/Leaflet.draw-master/leaflet.draw.js',
      'lib/map/leaflet.polylineDecorator.js',
      'lib/map/TDTLayer.js'
    ])
    .pipe(concat('leaflet-all.js'))
    .pipe(uglify())
    .pipe(rename('leaflet-all.min.js'))
    .pipe(gulp.dest('./dist/version1.2'));
});

// 合并，压缩框架内的所有css文件
gulp.task('miniCss', function() {
  return gulp
    .src([
      'lib/fontAwesome/css/font-awesome.min.css',
      'lib/map/leaflet-1.2.0/leaflet.css',
      'lib/map/Leaflet.MousePosition/L.Control.MousePosition.css',
      'lib/map/Leaflet-clusterMarkers/MarkerCluster.css',
      'lib/map/Leaflet-clusterMarkers/MarkerCluster.Default.css',
      'lib/map/Leaflet.draw-master/css/leaflet.draw.css',
      'lib/map/leaflet.contextmenu/leaflet.contextmenu.min.css',
      'css/map.css'
    ])
    .pipe(concat('map-all.css'))
    .pipe(cssmin())
    .pipe(rename('map-all.min.css'))
    .pipe(gulp.dest('./dist/version1.2/css'));
});

// 合并，压缩EMap框架
gulp.task('miniEMap', function() {
  return gulp
    .src([
      'src/EMap.js',
      'src/Utils.js',
      'src/CanvasShape/*.js',
      'src/Controls.js',
      'src/Map.js',
      'src/Layers/Layer.js',
      'src/Layers/CanvasLayer.js',
      'src/Layers/FeatureLayer.js',
      'src/Layers/ClusterLayer.js',
      'src/Layers/HeatLayer.js',
      'src/Layers/EchartMarkerLayer.js',
      'src/Layers/ShapeFileLayer.js',
      'src/Layers/CanvasLayer.EchartMap.js',
      'src/Layers/CanvasLayer.MarkerLabel.js',
      'src/Layers/CanvasLayer.WaveCircle.js',
      'src/Layers/CanvasLayer.Migrate.js',
      'src/Layers/FeatureLayer.Point.js',
      'src/Layers/FeatureLayer.LineString.js',
      'src/Layers/FeatureLayer.Polygon.js',
      'src/Layers.js'
    ])
    .pipe(concat('emap-all.js'))
    .pipe(uglify())
    .pipe(rename('emap-all.min.js'))
    .pipe(gulp.dest('./dist/version1.2'));
});

//合并，压缩读取shape文件的包
gulp.task('miniShape', function() {
  return gulp
    .src([
      'src/shapefile/mapshaper.js',
      'src/shapefile/geometry.js',
      'src/shapefile/binArray.js',
      'src/shapefile/shp.js',
      'src/shapefile/shapeTable.js'
    ])
    .pipe(concat('shapefile-all.js'))
    .pipe(uglify())
    .pipe(rename('shapefile.min.js'))
    .pipe(gulp.dest('./dist/modules/shapefile'));
});

gulp.task('clean', function() {
  return gulp
    .src(['./dist/version1.2/*.js', '!./dist/ucharts-all.min.js'], {
      read: false
    })
    .pipe(
      clean({
        force: true
      })
    );
});

gulp.task('moveFonts', function() {
  return gulp
    .src(['lib/fontAwesome/fonts/*.*'])
    .pipe(gulp.dest('./dist/version1.2/fonts'));
});

gulp.task('moveImages', function() {
  return gulp.src(['images/**/*']).pipe(gulp.dest('./dist/version1.2/images'));
});

//定义一个有依赖的任务
gulp.task(
  'default',
  gulp.series(
    'clean',
    gulp.parallel(
      'moveFonts',
      'moveImages',
      'miniCss',
      'miniLeafletJs',
      'miniEMap'
    ),
    function() {
      return gulp
        .src([
          './dist/version1.2/leaflet-all.min.js',
          './dist/version1.2/emap-all.min.js'
        ])
        .pipe(concat('eshore.map.min.js'))
        .pipe(gulp.dest('./dist/version1.2'));
    }
  )
);

//-----------------------------------------------------------合并压缩功能模块src/css------------------------------------------//

//-----------------------------------------------------------多单轨迹播放------------------------------------------//
gulp.task('muti_track_miniCss', function() {
  gulp
    .src(['modules/muti-tracksPlay/images/*.*'])
    .pipe(gulp.dest('./dist/modules/muti-track/images'));
  return gulp
    .src([
      'modules/muti-tracksPlay/lib/jquery-ui/jquery-ui.min.css',
      'modules/muti-tracksPlay/leaflet.playback.css'
    ])
    .pipe(concat('muti-track-all.css'))
    .pipe(cssmin())
    .pipe(rename('muti-track-all.min.css'))
    .pipe(gulp.dest('./dist/modules/muti-track'));
});

gulp.task('muti_track_miniJs', function() {
  gulp
    .src(['modules/muti-tracksPlay/leaflet.playback.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));

  return gulp
    .src([
      'modules/muti-tracksPlay/lib/jquery-ui/jquery-ui.min.js',
      'modules/muti-tracksPlay/leaflet.playback.js',
      'modules/muti-tracksPlay/playbackControl.js'
    ])
    .pipe(concat('muti-track-all.js'))
    .pipe(uglify())
    .pipe(rename('muti-track-all.min.js'))
    .pipe(gulp.dest('./dist/modules/muti-track'));
});
