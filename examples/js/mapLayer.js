(function() {
  var bicycleRental = [
    {
      name: '0',
      coordinates: [113.51719830906823, 36.874271546130565],
      popupContent: 'point0'
    },
    {
      name: '1',
      coordinates: [112.78650793284505, 36.085157934599465],
      popupContent: 'point1'
    },
    {
      name: '2',
      coordinates: [112.51059866348706, 37.6288620780618],
      popupContent: 'point2'
    },
    {
      name: '3',
      coordinates: [112.05006595344133, 35.85396088688104],
      popupContent: 'point3'
    },
    {
      name: '4',
      coordinates: [114.58966386059083, 37.38167374785628],
      popupContent: 'point4'
    },
    {
      name: '5',
      coordinates: [114.83439785869044, 34.23865172990129],
      popupContent: 'point5'
    },
    {
      name: '6',
      coordinates: [111.12615359531266, 37.57570942197009],
      popupContent: 'point6'
    },
    {
      name: '7',
      coordinates: [111.79069582762638, 34.7271338179016],
      popupContent: 'point7'
    },
    {
      name: '8',
      coordinates: [111.780132145849, 34.85742895357796],
      popupContent: 'point8'
    },
    {
      name: '9',
      coordinates: [111.9824521494214, 35.078911668315946],
      popupContent: 'point9'
    },
    {
      name: '10',
      coordinates: [110.15429690205806, 37.97763849605904],
      popupContent: 'point10'
    },
    {
      name: '11',
      coordinates: [110.12280843658627, 36.9776878789885],
      popupContent: 'point11'
    },
    {
      name: '12',
      coordinates: [110.05220000879747, 35.48917891206061],
      popupContent: 'point12'
    },
    {
      name: '13',
      coordinates: [114.40575178455306, 35.83720479712193],
      popupContent: 'point13'
    },
    {
      name: '14',
      coordinates: [110.22119097909665, 35.76189902861379],
      popupContent: 'point14'
    },
    {
      name: '15',
      coordinates: [111.42060335858052, 38.13086586269008],
      popupContent: 'point15'
    },
    {
      name: '16',
      coordinates: [114.25509065200787, 36.78849548727085],
      popupContent: 'point16'
    },
    {
      name: '17',
      coordinates: [109.4040400820856, 36.628150808613405],
      popupContent: 'point17'
    },
    {
      name: '18',
      coordinates: [111.7170923589266, 35.89457175291165],
      popupContent: 'point18'
    },
    {
      name: '19',
      coordinates: [112.14300669282251, 35.21043814071997],
      popupContent: 'point19'
    },
    {
      name: '20',
      coordinates: [112.48609113233742, 34.77417121309143],
      popupContent: 'point20'
    },
    {
      name: '21',
      coordinates: [110.97554945008572, 36.30660652541977],
      popupContent: 'point21'
    },
    {
      name: '22',
      coordinates: [111.01720532333948, 35.90528608313014],
      popupContent: 'point22'
    },
    {
      name: '23',
      coordinates: [112.98967366288731, 36.81681107751051],
      popupContent: 'point23'
    },
    {
      name: '24',
      coordinates: [110.60478548318558, 34.720251620691855],
      popupContent: 'point24'
    },
    {
      name: '25',
      coordinates: [114.68439712224034, 35.72474441649865],
      popupContent: 'point25'
    },
    {
      name: '26',
      coordinates: [114.00757917692049, 36.855109423866274],
      popupContent: 'point26'
    },
    {
      name: '27',
      coordinates: [114.51930226563687, 37.58526276715811],
      popupContent: 'point27'
    },
    {
      name: '28',
      coordinates: [114.93115644427965, 37.19457914406777],
      popupContent: 'point28'
    },
    {
      name: '29',
      coordinates: [112.99822277411104, 36.856380117273154],
      popupContent: 'point29'
    },
    {
      name: '30',
      coordinates: [111.12642448505116, 35.438496357662174],
      popupContent: 'point30'
    },
    {
      name: '31',
      coordinates: [114.69962155491564, 37.33271014900239],
      popupContent: 'point31'
    },
    {
      name: '32',
      coordinates: [111.0016682530492, 37.079110045326686],
      popupContent: 'point32'
    },
    {
      name: '33',
      coordinates: [114.63065184322893, 37.78319111019137],
      popupContent: 'point33'
    },
    {
      name: '34',
      coordinates: [109.98811595494912, 34.507619469752896],
      popupContent: 'point34'
    },
    {
      name: '35',
      coordinates: [110.90025564739695, 34.7801416019374],
      popupContent: 'point35'
    },
    {
      name: '36',
      coordinates: [114.95556569105183, 36.90607110004008],
      popupContent: 'point36'
    },
    {
      name: '37',
      coordinates: [111.00978991274398, 37.26027145625484],
      popupContent: 'point37'
    },
    {
      name: '38',
      coordinates: [112.20133837642541, 35.43109759367454],
      popupContent: 'point38'
    },
    {
      name: '39',
      coordinates: [111.67063436789746, 37.87264199069816],
      popupContent: 'point39'
    },
    {
      name: '40',
      coordinates: [113.79488297423482, 35.680673235011],
      popupContent: 'point40'
    },
    {
      name: '41',
      coordinates: [111.85294606495845, 34.717201540757536],
      popupContent: 'point41'
    },
    {
      name: '42',
      coordinates: [111.27304701628252, 34.302141604299976],
      popupContent: 'point42'
    },
    {
      name: '43',
      coordinates: [112.48607965942976, 35.84266280854162],
      popupContent: 'point43'
    },
    {
      name: '44',
      coordinates: [111.92194224840591, 35.68870180362939],
      popupContent: 'point44'
    },
    {
      name: '45',
      coordinates: [111.51684187328038, 34.95455993041189],
      popupContent: 'point45'
    },
    {
      name: '46',
      coordinates: [111.7507049164297, 37.33364875698314],
      popupContent: 'point46'
    },
    {
      name: '47',
      coordinates: [113.70784268210684, 37.41138235270783],
      popupContent: 'point47'
    },
    {
      name: '48',
      coordinates: [113.18409387290399, 36.41758849168803],
      popupContent: 'point48'
    },
    {
      name: '49',
      coordinates: [109.55763681689031, 37.757199743641635],
      popupContent: 'point49'
    }
  ];

  var campus = [
    {
      name: '多边形一',
      coordinates: [
        [
          [113.851318359375, 24.156778233303413],
          [115.30151367187501, 24.216909537721747],
          [115.213623046875, 23.644524198573688],
          [114.64233398437499, 23.28171917560003],
          [113.99414062499999, 23.61432859499169],
          [113.51074218749999, 23.835600986620936],
          [113.851318359375, 24.156778233303413]
        ]
      ],
      popupContent: 'polygon1'
    },
    {
      name: '多边形二',
      coordinates: [
        [
          [112.708740234375, 22.563293244707797],
          [112.708740234375, 22.978623970384913],
          [113.37890625, 22.978623970384913],
          [113.37890625, 22.563293244707797],
          [112.708740234375, 22.563293244707797]
        ]
      ],
      popupContent: 'polygon2'
    }
  ];

  var bus_lines = [
    {
      name: '6',
      coordinates: [
        [113.19282531738281, 23.142885569598484],
        [113.1924819946289, 23.12709990340347],
        [113.192138671875, 23.114154270852755],
        [113.19282531738281, 23.10973352496588],
        [113.19694519042969, 23.100891596532662],
        [113.20003509521484, 23.088575083404056],
        [113.20175170898438, 23.074678175027337],
        [113.20484161376953, 23.062043375744093],
        [113.21170806884766, 23.05414602371663],
        [113.21891784667969, 23.05256649771178],
        [113.22956085205077, 23.05477782892971],
        [113.23780059814452, 23.055725531189672],
        [113.25050354003906, 23.055409631177646],
        [113.26080322265624, 23.055725531189672],
        [113.27213287353516, 23.061727490559797],
        [113.27831268310547, 23.065202186804893]
      ],
      popupContent: 'bus_line1'
    },
    {
      name: '7',
      coordinates: [
        [113.24432373046875, 23.110996610073308],
        [113.23505401611328, 23.111628148170936],
        [113.22818756103516, 23.11668034599766],
        [113.22509765625, 23.12204809782476],
        [113.2247543334961, 23.134992968776594],
        [113.22887420654297, 23.140991387774854],
        [113.236083984375, 23.14446403400596],
        [113.24432373046875, 23.14919931569687],
        [113.25050354003906, 23.150462029224087],
        [113.25668334960938, 23.148567954471414],
        [113.26114654541014, 23.147936590271478],
        [113.26869964599608, 23.14256987448654],
        [113.27281951904297, 23.143832650473467],
        [113.27796936035156, 23.146673852948457],
        [113.2855224609375, 23.146673852948457],
        [113.29444885253906, 23.151409056561047],
        [113.29822540283203, 23.156775418370398],
        [113.30406188964844, 23.158985034283596],
        [113.30886840820312, 23.156459755978883],
        [113.31367492675781, 23.156144092843537],
        [113.32157135009766, 23.161825915469624]
      ],
      popupContent: 'bus_line2'
    }
  ];

  bicycleRental_max = [];
  for (var i = 0; i < 100000; i++) {
    var point = {
      name: i + '',
      coordinates: [107.9654563919944, 33.207966631294232],
      popupContent: 'point' + i
    };
    x = 107.9654563919944 + Math.random() * (6 - 1 + 1) + 1;
    y = 33.207966631294232 + Math.random() * (4 - 1 + 1) + 1;
    point.coordinates = [x, y];
    bicycleRental_max.push(point);
  }

  var map = new EMap.Map('mapDiv', {
    crs: L.CRS.EPSG4490,
    continuousWorld: true
  });
  var layerControl = EMap.Controls.layerControl();
  layerControl.addTo(map);

  var heatMapLayer = EMap.Layers.heatLayer(bicycleRental);

  var pointLayer = EMap.Layers.FeatureLayer.point(bicycleRental, {
    isLabelShow: false,
    style: {
      radius: 3,
      color: '#ff7800',
      weight: 5,
      opacity: 0.3
    }
  });

  var lineLayer = EMap.Layers.FeatureLayer.lineString(bus_lines, {
    isLabelShow: true,
    style: {
      dashArray: '10,5'
    }
  });
  var polygonLayer = EMap.Layers.FeatureLayer.polygon(campus, {
    isLabelShow: true,
    style: {
      weight: 1,
      fillOpacity: 0.6
    }
  });

  var clusterLayer = EMap.Layers.clusterLayer(bicycleRental);

  var layer = EMap.Layers.CanvasLayer.markerLabel(bicycleRental_max, {
    text_style: {
      font_color: 'blue'
    },
    featureType: EMap.Utils.PointType
  });

  var layer2 = EMap.Layers.CanvasLayer.markerLabel(bus_lines, {
    zIndex: 301,
    text_style: {
      font_color: 'red'
    },
    icon_style: {
      width: 18,
      height: 18,
      url: './images/map/marker1.png'
    },
    featureType: EMap.Utils.LineStringType
  });
  var layer3 = EMap.Layers.CanvasLayer.markerLabel(campus, {
    text_style: {
      color: 'red'
    },
    featureType: EMap.Utils.PolygonType
  });
  function createPieChartOptions() {
    var option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        show: false,
        data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
      },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: true,
              position: 'center',
              textStyle: {
                fontSize: '12',
                fontWeight: 'bold',
                color: 'red'
              },
              backgroundColor: '#ffffff',
              padding: 1
            }
          },
          data: []
        }
      ]
    };
    for (var i = 0; i < pieDataList.length; i++) {
      var pieData = pieDataList[i];
      var option_clone = $.extend(true, {}, option);
      option_clone.series[0].name = pieData.area_name;
      option_clone.series[0].data = pieData.area_data;
      option_clone.series[0].label.normal.formatter = function(params) {
        return params.seriesName;
      };
      pieData.chartOptions = option_clone;
    }
    return pieDataList;
  }
  var dataList = createPieChartOptions();
  var chartLayer = EMap.Layers.echartMarkerLayer(dataList, {
    style: {
      chartWidth: 70,
      chartHeight: 70
    }
  });

  var echartOptions_scatter = createChartOptions_scatter();
  var echartMapLayer_scatter = EMap.Layers.CanvasLayer.echartMap({
    chartOptions: echartOptions_scatter
  });

  var echartOptions_lines = createChartOptions_lines();
  var echartMapLayer_lines = EMap.Layers.CanvasLayer.echartMap({
    chartOptions: echartOptions_lines
  });

  var length = citysData.length;
  var maxValue = citysData[0].value;
  var minValue = citysData[length - 1].value;
  var maxlevel = (maxValue - minValue) / minValue;
  var citysLayer = EMap.Layers.FeatureLayer.point(citysData, {
    style: function(feature) {
      var city_gdp = feature.value;
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

  var legend = EMap.Controls.legendControl({
    点: '#ff7800',
    线: 'rgb(51, 136, 255)',
    面: '#B0DE5C'
  });
  map.addControl(legend);

  var layerInfo = EMap.Controls.layerInfoControl({
    position: 'topright',
    updateContent: function(props) {
      return (
        '<h4>区域名称</h4>' +
        (props
          ? '<b>' +
            (props.name == null ? props.ID : props.name) +
            '</b><br />' +
            props.popupContent +
            ''
          : '把鼠标移入区域')
      );
    }
  });
  map.addControl(layerInfo);

  layerControl.addOverlay(pointLayer, '点');
  layerControl.addOverlay(citysLayer, '城市');
  layerControl.addOverlay(lineLayer, '线');
  layerControl.addOverlay(polygonLayer, '面');
  layerControl.addOverlay(heatMapLayer, '热力图');
  layerControl.addOverlay(clusterLayer, '聚合图');
  layerControl.addOverlay(chartLayer, 'echart统计图');
  layerControl.addOverlay(echartMapLayer_scatter, 'echart统计散点图');
  layerControl.addOverlay(echartMapLayer_lines, 'echart线图');
  layerControl.addOverlay(layer, '点标注');
  layerControl.addOverlay(layer2, '线标注');
  layerControl.addOverlay(layer3, '面标注');

  pointLayer.on('click', function(e) {
    var buffered = turf.buffer(e.layer.feature, 5, 'kilometers');
    L.geoJson(buffered).addTo(map);
  });

  polygonLayer.eachLayer(function(layer) {
    layer.on({
      mouseover: function(e) {
        layerInfo.updateContent(e.target.feature.properties);
      },
      mouseout: function(e) {
        layerInfo.updateContent();
      }
    });
  });

  layer.on('click', function(e) {
    alert(e.obj[0].name);
  });

  layer2.on('click', function(e) {
    alert(e.obj[0].name);
  });

  layer3.on('click', function(e) {
    alert(e.obj[0].name);
  });
})();
