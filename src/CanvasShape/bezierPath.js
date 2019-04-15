(function() {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuadraticBezier;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return QuadraticBezier;
    });
  } else {
    (function() {
      return this || (0, eval)('this');
    })().QuadraticBezier = QuadraticBezier;
  }

  function QuadraticBezier(startPoint, endPoint, style, data) {
    this.k = 0;
    this.k_step = 0.005;
    this.angle = 45;
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.data = data;
    this.style = style;
    this.lineStyle = style.pathStyle || 'straight';
    this.controlPoint = this.getBezierControlPoint(
      this.lineStyle,
      style.curveness || 0.2
    );
    if (typeof style.lineColor === 'function') {
      this.lineColor = style.lineColor.call(null, data);
    } else {
      this.lineColor = style.lineColor;
    }
    this.lineColor = EMap.Utils.fomatterColor(this.lineColor);
    this._points = this.getBezierPathPoints();
  }

  QuadraticBezier.prototype = {
    createBezierLine: function(ctx) {
      ctx.strokeStyle = this.lineColor;
      ctx.beginPath();
      ctx.moveTo(this.startPoint.x, this.startPoint.y);
      ctx.quadraticCurveTo(
        this.controlPoint.x,
        this.controlPoint.y,
        this.endPoint.x,
        this.endPoint.y
      );
      ctx.stroke();
    },

    draw: function(ctx) {
      var point = this.getBezierPathPoint();
      var nextPoint = this.getBezierPathPoint(this.k); // 用于计算方向角
      var endRadians = Math.atan(
        (nextPoint.y - point.y) / (nextPoint.x - point.x)
      );
      endRadians += ((nextPoint.x > point.x ? 0 : -180) * Math.PI) / 180;
      ctx.save();
      ctx.beginPath();
      if (this.style.image !== undefined && this.style.image !== null) {
        ctx.font = this.style.image.font;
        ctx.lineWidth = 1;
        ctx.translate(point.x, point.y);
        ctx.rotate(endRadians);
        ctx.strokeStyle = this.style.image.color;
        ctx.strokeText(this.style.image.pathImageFont, -4, 4);
        ctx.fillText(this.style.image.pathImageFont, -4, 4);
      } else {
        ctx.arc(
          point.x,
          point.y,
          (this.style.weight * 3) / 4,
          0,
          2 * Math.PI,
          false
        );
        var gradient1 = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          this.style.weight
        );
        gradient1.addColorStop(0, 'rgba(255,255,255,1)');
        gradient1.addColorStop(1, this.style.wavesColor);
        ctx.fillStyle = gradient1;
        ctx.fill();
      }
      ctx.closePath();
      ctx.restore();
    },

    update: function() {
      if (this.k > 1) {
        this.k = 0;
        this.k_step = 0.005;
      } else {
        var currentPoint = this.getBezierPathPoint(this.k);
        if (this.k > 0.9) {
          this.k_step = 0.002;
        }
        this.k = this.k + this.k_step;
      }
    },

    getBounds: function() {},

    getBezierPathPoints: function() {
      var points = [];
      for (var t = 0; t < 1; t = t + this.k_step) {
        var point = this.getBezierPathPoint(t);
        points.push(point);
      }
      return points;
    },

    getBezierControlPoint: function(lineStyle, curveness) {
      if (lineStyle === 'curve') {
        /*var x0;
				var y0;
				var rx0 = this.startPoint.x;
				var ry0 = this.startPoint.y;
				var x = (this.startPoint.x + this.endPoint.x) / 2;
				var y = (this.startPoint.y + this.endPoint.y) / 2;
				var a = 25;
				x0 = (x - rx0) * Math.cos(a) - (y - ry0) * Math.sin(a) + rx0;
				y0 = (x - rx0) * Math.sin(a) + (y - ry0) * Math.cos(a) + ry0;
				return {
					x : x0,
					y : y0
				};*/
        var cp = [
          (this.startPoint.x + this.endPoint.x) / 2 -
            (this.startPoint.y - this.endPoint.y) * curveness,
          (this.startPoint.y + this.endPoint.y) / 2 -
            (this.endPoint.x - this.startPoint.x) * curveness
        ];

        return {
          x: cp[0],
          y: cp[1]
        };
      } else {
        return this.endPoint;
      }
    },

    distance: function(p1, p2) {
      var dx = p1.x - p2.x,
        dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
    },

    getBezierPathPoint: function(percent) {
      var t = percent === undefined ? this.k : percent;
      var k = 1 - t;
      var p1x = this.startPoint.x;
      var p1y = this.startPoint.y;
      var cx = this.controlPoint.x;
      var cy = this.controlPoint.y;
      var p2x = this.endPoint.x;
      var p2y = this.endPoint.y;

      var tx = k * k * p1x + 2 * (1 - t) * t * cx + t * t * p2x;

      var ty = k * k * p1y + 2 * (1 - t) * t * cy + t * t * p2y;
      if (percent === undefined) {
        this.update();
      }
      return {
        x: tx,
        y: ty
      };
    }
  };
})();
