L.Playback = L.Playback || {};

L.Playback.Control = L.Control.extend({

	_html : '<footer class="lp">'
			+ '  <div class="transport">'
			+ '    <div class="navbar">'
			+ '      <div class="navbar-inner">'
			+ '        <ul class="nav">'
			+ '          <li class="ctrl">'
			+ '            <a id="play-pause" href="#"><i id="play-pause-icon" class="fa fa-play fa-lg"></i></a>'
			+ '          </li>'
			+ '          <li class="ctrl dropup">'
			+ '            <a id="clock-btn" class="clock" data-toggle="dropdown" href="#">'
			+ '              <span id="cursor-date"></span><br/>'
			+ '              <span id="cursor-time"></span>'
			+ '            </a>'
			+ '          </li>'
			+ '        </ul>'
			+ '        <ul class="nav pull-right">'
			+ '          <li>'
			+ '            <div id="time-slider"></div>'
			+ '          </li>'
			+ '          <li class="ctrl dropup">'
			+ '            <a id="speed-btn" data-toggle="dropdown" href="#"><i class="fa fa-dashboard fa-lg"></i> <span id="speed-icon-val" class="speed">1</span>x</a>'
			+ '            <div class="speed-menu dropdown-menu" role="menu" aria-labelledby="speed-btn">'
			+ '              <label>播放速度</label>' + '              <input id="speed-input" class="span1 speed" type="text" value="1" />'
			+ '              <div id="speed-slider"></div>' + '            </div>' + '          </li>' + '        </ul>' + '      </div>'
			+ '    </div>' + '  </div>' + ' </footer>',

	initialize : function(playback) {
		this.playback = playback;
		playback.addCallback(this._clockCallback);
	},

	onAdd : function(map) {
		var html = this._html;
		this._container = L.DomUtil.create('div');
		this._container.innerHTML = html;
		this._setup();
		L.DomEvent.disableClickPropagation(this._container);
		return this._container;
	},

	onRemove : function(map) {
		this._container = null;
		$(window).off("click");
	},

	_setup : function() {
		var self = this;
		var playback = this.playback;
		$(this._container).find('#play-pause').click(function() {
					if (playback.isPlaying() === false) {
						playback.start();
						$(self._container).find('#play-pause-icon').removeClass('fa-play');
						$(self._container).find('#play-pause-icon').addClass('fa-pause');
					} else {
						playback.stop();
						$(self._container).find('#play-pause-icon').removeClass('fa-pause');
						$(self._container).find('#play-pause-icon').addClass('fa-play');
					}
				});

		var startTime = playback.getStartTime();
		$(this._container).find('#cursor-date').html(L.Playback.Util.DateStr(startTime));
		$(this._container).find('#cursor-time').html(L.Playback.Util.TimeStr(startTime));

		$(this._container).find('#time-slider').slider({
					min : playback.getStartTime(),
					max : playback.getEndTime(),
					step : playback.getTickLen(),
					value : playback.getTime(),
					slide : function(event, ui) {
						playback.setCursor(ui.value);
						$(self._container).find('#cursor-time').val(ui.value.toString());
						$(self._container).find('#cursor-time-txt').html(new Date(ui.value).toString());
					}
				});

		$(this._container).find("#speed-btn").on('click', function(e) {
					e.preventDefault;
					e.stopPropagation();
					$(this).parent().addClass("open");
				});

		$(window).click(function(e) {
					var speed_menu_pop = $(self._container).find(".speed-menu");
					if (!($.contains(speed_menu_pop[0], e.originalEvent.srcElement)) && !(speed_menu_pop[0] == e.originalEvent.srcElement)) {
						speed_menu_pop.parent().removeClass("open");
					}
				}
		);
		
		$(this._container).find(".speed").html(this.playback.getSpeed()).val(this.playback.getSpeed());

		$(this._container).find('#speed-slider').slider({
					min : 0,
					max : 59,
					step : 1,
					value : self._speedToSliderVal(this.playback.getSpeed()),
					orientation : 'vertical',
					slide : function(event, ui) {
						var speed = self._sliderValToSpeed(parseFloat(ui.value));
						playback.setSpeed(speed);
						$(self._container).find('.speed').html(speed).val(speed);
					}
				});

		$(this._container).find('#speed-input').on('keyup', function(e) {
					var speed = parseFloat($(self._container).find('#speed-input').val());
					if (!speed)
						return;
					playback.setSpeed(speed);
					$(self._container).find('#speed-slider').slider('value', self._speedToSliderVal(speed));
					$(self._container).find('#speed-icon-val').html(speed);
					if (e.keyCode === 13) {
						$(self._container).find('.speed-menu').dropdown('toggle');
					}
				});
	},

	_clockCallback : function(ms) {
		$('#cursor-date').html(L.Playback.Util.DateStr(ms));
		$('#cursor-time').html(L.Playback.Util.TimeStr(ms));
		$('#time-slider').slider('value', ms);
	},

	_speedToSliderVal : function(speed) {
		if (speed < 1)
			return -10 + speed * 10;
		return speed - 1;
	},

	_sliderValToSpeed : function(val) {
		if (val < 0)
			return parseFloat((1 + val / 10).toFixed(2));
		return val + 1;
	},

	_combineDateAndTime : function(date, time) {
		var yr = date.getFullYear();
		var mo = date.getMonth();
		var dy = date.getDate();
		// the calendar uses hour and the timepicker uses hours...
		var hr = time.hours || time.hour;
		if (time.meridian === 'PM' && hr !== 12)
			hr += 12;
		var min = time.minutes || time.minute;
		var sec = time.seconds || time.second;
		return new Date(yr, mo, dy, hr, min, sec).getTime();
	}

}
);
