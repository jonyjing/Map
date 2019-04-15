(function() {
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = circle_wave;
	} else if (typeof define === 'function' && define.amd) {
		define(function() {
					return circle_wave;
				});
	} else {
		(function() {
			return this || (0, eval)('this');
		}()).circle_wave = circle_wave;
	}

	function circle_wave(style) {
		this.style = style;
		this.style.color = EMap.Utils.fomatterColor(style.color);
		this.init_opacity = 1;// 初始的透明度
		this.r = style.r; // 动画中当前的半径
		this.opacity = 1; // 动画中当前的透明度
		this.r_step = 0.1; // 半径增大的速度
		this.opacity_step = 0.96; // 透明度的变化系数
		this.finised = true;// 当前动画是否完成
	}

	circle_wave.prototype = {

		reset : function() {
			this.opacity = this.init_opacity;
			this.r = this.style.r;
			this.finised = true;
		},
		draw : function(ctx, startDraw) {
			if (startDraw) {
				this.finised = false;
			}
			// 绘制波纹
			if (this.finised == false) {
				ctx.beginPath();
				ctx.arc(this.style.x, this.style.y, this.r, 0, Math.PI * 2, false);
				var rgbastrs = this.style.color.split(",");
				rgbastrs[3] = this.opacity;
				ctx.strokeStyle = rgbastrs.join(",");
				ctx.stroke();
				this.update();
			}
		},
		update : function() {
			if (this.opacity > 0.033) {
				this.r += this.r_step;
				if (this.r > 10) {
					this.opacity *= this.opacity_step;
				}
			} else {
				this.reset();
			}
		},

		createCircle : function(ctx) {
			ctx.fillStyle = this.style.color;
			ctx.beginPath();
			ctx.arc(this.style.x, this.style.y, this.style.r, 0, 2 * Math.PI);
			ctx.fill();
			ctx.closePath();
		},

		getBounds : function() {
			var topLeft_x = this.style.x - this.style.r;
			var topLeft_y = this.style.y - this.style.r;
			var width = this.style.r * 2;
			var height = width;
			return {
				x : topLeft_x,
				y : topLeft_y,
				w : width,
				h : height
			};
		}
	};
}());