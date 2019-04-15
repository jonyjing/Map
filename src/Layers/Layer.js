(function() {
	EMap.Layers = L.Layer.extend({
				options : {

				},
				initialize : function(options) {
					this._layers = {};
					L.setOptions(this, options);
				},
				onAdd:function(map){
					
				},
				onRemove:function(){
					
				}
			});
}());