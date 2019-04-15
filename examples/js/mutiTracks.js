(function($) {
  L.Icon.Default.imagePath = 'images/map/';
  var tiandituCRS = new L.Proj.CRS(
    'EPSG:4490',
    '+proj=longlat +ellps=GRS80 +no_defs',
    {
      resolutions: [
        1.40625,
        0.7031249999891485,
        0.35156249999999994,
        0.17578124999999997,
        0.08789062500000014,
        0.04394531250000007,
        0.021972656250000007,
        0.01098632812500002,
        0.00549316406250001,
        0.0027465820312500017,
        0.0013732910156250009,
        0.000686645507812499,
        0.0003433227539062495,
        0.00017166137695312503,
        0.00008583068847656251,
        0.000042915344238281406,
        0.000021457672119140645,
        0.000010728836059570307,
        0.000005364418029785169
      ],
      origin: [-180, 90],
      bounds: L.bounds([-180, 90], [180, -90])
    }
  );
  var time_str =
    '9:20,9:30,9:40,9:50,10:00 ,10:10 ,10:20 ,10:30 ,10:40 ,10:50 ,11:00 ,11:10 ,11:20 ,11:30 ,11:40 ,11:50 ,12:00 ,12:10 ,12:20 ,12:30 ,12:40 ,12:50 ,13:00 ,13:10 ,13:20 ,13:30 ,13:40 ,13:50 ,14:00 ,14:10 ,14:20 ,14:30 ,14:40 ,14:50 ,15:00 ,15:10 ,15:20 ,15:30 ,15:40 ,15:50 ,16:00 ,16:10 ,16:20 ,16:30 ,16:40 ,16:50 ,17:00 ,17:10';
  var track1 =
    '[113.3603024482727,23.138307917711174], [113.36062431335449,23.138702549030203], [113.36066722869873,23.138801206678476], [113.36073160171509,23.13868281749184], [113.3604311943054,23.13783435859517], [113.36079597473143,23.1373607978066], [113.36163282394409,23.137025357902782], [113.36163282394409,23.13436154064061], [113.36390733718872,23.133256534248734], [113.36897134780882,23.13033611638608], [113.37161064147948,23.129014014417447], [113.37214708328247,23.129823063438046], [113.37242603302002,23.129586269107854], [113.37221145629883,23.129507337571564], [113.373863697052,23.12735643533046], [113.37321996688843,23.12727750248209], [113.37349891662598,23.12670523794255], [113.37435722351074,23.1293692072713], [113.37409973144531,23.129527070459996], [113.3740782737732,23.12919161096194], [113.37448596954346,23.129132412139903], [113.37427139282225,23.129250809757846], [113.37360620498656,23.128599621565897], [113.36191177368164,23.134440469320193], [113.35712671279907,23.133098675449496], [113.35734128952026,23.131441146839578], [113.35532426834106,23.131460879443516], [113.35515260696411,23.132704027638514], [113.35517406463622,23.131894995995527], [113.35631132125854,23.131401681623], [113.35553884506224,23.131697670464252], [113.35556030273438,23.1323883085536], [113.35579633712769,23.1323883085536], [113.35573196411133,23.132526435744694], [113.35564613342285,23.132309378666235], [113.35721254348755,23.131401681623], [113.35691213607788,23.12834309201627], [113.35772752761841,23.125442300665345], [113.36390733718872,23.12368600875255], [113.36622476577759,23.12303479354913], [113.36633205413818,23.12380441117724], [113.36719036102295,23.12445562264534], [113.36856365203857,23.124080683095183], [113.3665680885315,23.124297753488765], [113.36710453033447,23.12380441117724], [113.36688995361328,23.12380441117724], [113.36693286895752,23.12392281349744], [113.36710453033447,23.12394254720731]';
  var track2 =
    '[113.36088180541992,23.138544696641972], [113.36028099060059,23.13858415975646], [113.36071014404297,23.13874201209823], [113.36066722869873,23.138150064858355], [113.36105346679688,23.137952748530978], [113.36148262023926,23.134558862252476], [113.36208343505858,23.13313814016673], [113.36088180541992,23.1324672383945], [113.36088180541992,23.130888632750818], [113.35903644561768,23.13073077116456], [113.3592939376831,23.128757485660287], [113.35963726043701,23.127494567703327], [113.35736274719238,23.126784171127614], [113.35551738739012,23.125876436695364], [113.3572769165039,23.12631057132056], [113.35774898529053,23.126626304711035], [113.3613109588623,23.1250081632305], [113.36088180541992,23.12520549860231], [113.3610963821411,23.125244965641844], [113.36148262023926,23.125244965641844], [113.36122512817383,23.125560701540124], [113.36148262023926,23.12560016847517], [113.36015224456787,23.124416155373602], [113.37165355682372,23.121692885587816], [113.368821144104,23.116640876439114], [113.367919921875,23.100575802607995], [113.336763381958,23.101246863810463], [113.32388877868652,23.099115246049198], [113.32440376281738,23.097575723296266], [113.32496166229247,23.09615460971145], [113.3274507522583,23.09749677293593], [113.32620620727539,23.097457297738348], [113.32569122314453,23.09710202043826], [113.32560539245604,23.097417822529177], [113.32612037658691,23.097062545124693], [113.32586288452148,23.097575723296266], [113.32590579986571,23.09875997313371], [113.32225799560547,23.098838922751682], [113.31015586853026,23.098523124001392], [113.30972671508789,23.115969892168145], [113.3100700378418,23.126784171127614], [113.3049201965332,23.131441146839578], [113.30208778381348,23.13033611638608], [113.29642295837402,23.127810298307228], [113.2898998260498,23.126863104266242], [113.29384803771973,23.127731365725925], [113.2924747467041,23.12709990340347], [113.29298973083496,23.126468438108688], [113.29341888427734,23.12670523794255], [113.29298973083496,23.126073770790068], [113.29341888427734,23.12638950473784], [113.29256057739258,23.126468438108688]';
  var times = track_time(time_str);
  function track_coordinates(coordinates_str) {
    var coordinates = [];
    var array = coordinates_str.split(', ');
    for (var i = 0; i < array.length; i++) {
      coordinates.push(JSON.parse(array[i]));
    }
    return coordinates;
  }

  function track_time(time_str) {
    var times = [];
    var time_array = time_str.split(',');
    for (var i = 0; i < time_array.length; i++) {
      var time = '2017/05/19 ' + $.trim(time_array[i]) + ':00';
      var datatime = new Date(time);
      times.push(datatime.getTime());
    }
    return times;
  }

  function createTrackData(track_str, trackName) {
    var coordinates = track_coordinates(track_str);
    var trackData = {
      type: 'Feature',
      geometry: {
        type: 'MultiPoint',
        coordinates: coordinates
      },
      properties: {
        time: times,
        name: '监控人员' + trackName
      }
    };
    return trackData;
  }

  var track_1 = createTrackData(track1, '1');
  var track_2 = createTrackData(track2, '2');
  var baseLayersConfigs = [
    {
      mapName: '天地图矢量',
      layerType: 'tdt',
      cssmapImg: 'baseMapSwitch-vector',
      layerOption: {
        crs_name: 'EPSG4490',
        layer: 'vec',
        layerTheme: 'Dark'
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
    crs: tiandituCRS,
    baseMapSwitchControl: {
      configs: baseLayersConfigs,
      show: true
    },
    continuousWorld: true
  });
  var _colorIdx = 0,
    _colors = [
      'orange',
      'green',
      'blue',
      'purple',
      'darkred',
      'cadetblue',
      'red',
      'darkgreen',
      'darkblue',
      'darkpurple'
    ];
  function _assignColor() {
    return _colors[_colorIdx++ % 10];
  }
  var playbackOptions = {
    maxInterpolationTime: 10 * 60 * 1000,
    orientIcons: false,
    AddArrow: true,
    tickLen: 1000,
    speed: 100,
    arrowColor: '#fff',
    arrowSize: 9,
    marker: function(feature) {
      return {
        icon: L.AwesomeMarkers.icon({
          prefix: 'fa',
          icon: 'bullseye',
          markerColor: _assignColor()
        }),
        getPopup: function(feature) {
          return feature.properties.name;
        },
        labels: true
      };
    }
  };
  var playback, control;

  $('#load').on('click', loadPlayTracks);

  $('#clear').on('click', clearPlayTracks);

  function loadPlayTracks() {
    playback = new L.Playback(map, [track_1, track_2], null, playbackOptions);
    control = new L.Playback.Control(playback);
    control.addTo(map);
  }

  function clearPlayTracks() {
    playback.destroy();
    if (control) {
      map.removeControl(control);
      control = null;
    }
  }
})(jQuery);
