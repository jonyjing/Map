(function() {

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = arrowHead;
	} else if (typeof define === 'function' && define.amd) {
		define(function() {
					return arrowHead;
				});
	} else {
		(function() {
			return this || (0, eval)('this');
		}()).arrowHead = arrowHead;
	}
	function arrowHead(startPoint, endPoint) {
		this.startPoint = startPoint;
		this.endPoint = endPoint;
	}
	arrowHead.prototype.draw = function(ctx, arrowHeight, arrowWidth, color) {
		var endRadians = Math.atan((this.endPoint.y - this.startPoint.y) / (this.endPoint.x - this.startPoint.x));
		endRadians += ((this.endPoint.x > this.startPoint.x) ? 90 : -90) * Math.PI / 180;
		ctx.save();
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.translate(this.endPoint.x, this.endPoint.y);
		ctx.rotate(endRadians);
		ctx.moveTo(0, 0);
		ctx.lineTo(arrowWidth / 2, arrowHeight);
		ctx.lineTo(-arrowWidth / 2, arrowHeight);
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	};
}());