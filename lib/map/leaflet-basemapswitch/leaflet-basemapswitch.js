/**
 * 地图底图切换控件 baseMapConfigs:[ { mapName:'', mapUrl:'', mapAnnotionUrl:
 * cssmapImg:'', mapType:'',mapOptions:{}}, { ..... } ]
 */
L.Control.BaseMapswitchControl = L.Control.extend({
	_className : 'leaflet-control-baseMapSwitch',
	options : {
		position : 'topright',
		border : '1px solid rgb(72, 88, 88);',
		selectBorder : '1px solid rgb(8, 152, 216)'
	},

	initialize : function(options) {
		L.setOptions(this, options);
	},
	onAdd : function(map) {
		var container = L.DomUtil.create('div', this._className);
		this.mapConfigs=this.options.configs;
		this._map = map;
		this._container=container;
		this._initLayout(container);
		return container;
	},
	_initLayout : function(container) {
		var baseMapConfigs = this.mapConfigs;
		var baseMapConfigsLength = baseMapConfigs.length;
		if (baseMapConfigsLength == 0) {
			console.log("请至少配置一个底图服务。");
			return;
		}

		var table = L.DomUtil.create('table', '', container);
		var tr = L.DomUtil.create('tr', '', table);
		var defaultBaseMapConfig = baseMapConfigs[0];
		for (var i = 0; i < baseMapConfigsLength; i++) {
			var img = this._addMapServer(baseMapConfigs[i], tr, false);
			img.style.display = "none";
		}
		this._addMapServer(defaultBaseMapConfig, tr, true);
		this._switchMap(defaultBaseMapConfig);
		return table;
	},
	_addMapServer : function(baseMapConfig, tr, isSwitchPic) {
		var td = L.DomUtil.create('td', '', tr);
		var img = L.DomUtil.create('img', '', td);
		img.setAttribute('class', baseMapConfig.cssmapImg);
		img.style.border = this.options.border;
		img.style.marginRight = '1px';
		img.style.cursor = 'pointer';
		img.style.border = '1px solid #8B8989';
		img.setAttribute('type', baseMapConfig.mapName);
		if (isSwitchPic) {
			img.setAttribute('showOther', false);
			img.setAttribute('type', 'switch');
			img.style.border = this.options.selectBorder;
		}
		L.DomEvent.disableClickPropagation(img);
		L.DomEvent.on(img,'click', this._showMap, this);
		return img;
	},
	_showMap : function(e) {
		var type = $(e.target).attr("type");
		var $tableContainer = $(e.target).parent().parent().parent();
		if (type === "switch") {
			var showOther = e.target.attributes["showOther"].value;
			e.target.setAttribute("showOther", showOther == "false" ? "true" : "false");
			var visible = showOther == "false" ? true : false;
			this._setIconVisible(visible, $tableContainer);
			return;
		}
		var selectBaseMapImage;
		var selectBaseMapIndex;
		var baseMapConfigs = this.mapConfigs;
		for (var i = 0; i < baseMapConfigs.length; i++) {
			var baseMapConfig = baseMapConfigs[i];
			if (type == baseMapConfig.mapName) {
				selectBaseMapIndex = i;
				selectBaseMapImage = baseMapConfig.cssmapImg;
			}
		}

		$tableContainer.find("img[type='switch']").attr("showOther", false);

		$tableContainer.find("img[type='switch']").attr('class', selectBaseMapImage);
		this._setIconVisible(false, $tableContainer);
		this._setSelectIcon(type, $tableContainer);
		this._switchMap(baseMapConfigs[selectBaseMapIndex]);

	},
	/**
	 * 影像图、矢量图图标切换
	 */
	_setIconVisible : function(isVisible, tableContainer) {
		var baseMapConfigs = this.mapConfigs;
		for (var i = 0; i < baseMapConfigs.length; i++) {
			var baseMapConfig = baseMapConfigs[i];
			var type = baseMapConfig.mapName;
			tableContainer.find("img[type='" + type + "']").css("display", isVisible ? "block" : "none");
		}
	},
	_setSelectIcon : function(type, tableContainer) {
		var baseMapConfigs = this.mapConfigs;
		for (var i = 0; i < baseMapConfigs.length; i++) {
			var baseMapConfig = baseMapConfigs[i];
			var mapName = baseMapConfig.mapName;
			if (type == mapName) {
				tableContainer.find("img[type='" + mapName + "']").css("border-color", "rgb(8, 152, 216)");
			} else {
				tableContainer.find("img[type='" + mapName + "']").css("border-color", "rgb(72, 88, 88)");

			}
		}
	},
	_switchMap : function(baseMapConfig) {
		var layerType = baseMapConfig.layerType;
		var layerOption = baseMapConfig.layerOption;

		if (layerType === null || layerType === undefined || layerType.length == 0) {
			console.log("底图服务类型没有配置。");
			return;
		}
		if (this.currentBaseLayer) {
			this._map.removeLayer(this.currentBaseLayer);
			this.currentBaseLayer = null;
		}

		if(layerType!="none"){
			this.currentBaseLayer = EMap.Layers.serviceLayer.createLayer(layerType, layerOption);
			this._map.addLayer(this.currentBaseLayer);
		}

	},

	getCurrentBaseLayers : function() {
		return this.currentBaseLayer;
	},
	
	setCurrentBaseLayers:function(layer){
		this.currentBaseLayer=layer;
	},
	
	hide:function(){
		this._container.style.display="none";
	},
	
	removeBaseLayers:function(){
		if (this.currentBaseLayer) {
			this._map.removeLayer(this.currentBaseLayer);
		}
		return this.currentBaseLayer;
	},
});

L.control.baseMapswitchControl = function(options) {
	return new L.Control.BaseMapswitchControl(options);
};