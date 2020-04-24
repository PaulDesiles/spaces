<template>
	<div id="container" :style="cursorStyle">
		<svg id="viewer" ref="viewer" xmlns="http://www.w3.org/2000/svg">
			<g
				ref="viewerContent"
				:transform="transformMatrix"
			>
				<slot />
			</g>
		</svg>
		<div id="scrollContainer">
			<div id="hScrollContainer">
				<div
					ref="hScrollBar"
					class="scrollBar"
					:style="hBarStyle"
					@mousedown.stop="horizontalHandler.hang($event)"
				/>
			</div>
			<div id="vScrollContainer">
				<div
					ref="vScrollBar"
					class="scrollBar"
					:style="vBarStyle"
					@mousedown.stop="verticalHandler.hang($event)"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import svgPanZoom from 'svg-pan-zoom';

class PanHandler {
	constructor(deltaModifier, getPan, setPan, registerMouseMove) {
		this.deltaModifier = deltaModifier;
		this.getPan = getPan;
		this.setPan = setPan;
		this.registerMouseMove = registerMouseMove;
		this.initPan = {x: 0, y: 0};
		this.initMouse = {x: 0, y: 0};
		this.panning = false;
	}

	// All events pass threw this method
	// so that "this" refers to current object
	handleEvent(event) {
		switch (event.type) {
			case 'mousedown':
				this.hang(event);
				break;
			case 'mousemove':
				this.move(event);
				break;
			case 'mouseup':
			case 'mouseleave':
				this.drop(event);
				break;
			default:
				break;
		}
	}

	hang(event) {
		event.stopPropagation();
		event.preventDefault();
		this.initPan = this.getPan();
		this.initMouse = {x: event.pageX, y: event.pageY};
		this.panning = true;
		window.addEventListener('mouseup', this, true);
		window.addEventListener('mouseleave', this, true);
		if (this.registerMouseMove) {
			window.addEventListener('mousemove', this, true);
		}
	}

	move(event) {
		event.stopPropagation();
		event.preventDefault();

		if (this.panning) {
			const deltaX = this.deltaModifier.x * (event.pageX - this.initMouse.x);
			const deltaY = this.deltaModifier.y * (event.pageY - this.initMouse.y);

			this.setPan({
				x: this.initPan.x + deltaX,
				y: this.initPan.y + deltaY
			});
		}
	}

	drop(event) {
		if (event) {
			event.stopPropagation();
			event.preventDefault();
		}

		this.panning = false;
		window.removeEventListener('mouseup', this, true);
		window.removeEventListener('mouseleave', this, true);
		if (this.registerMouseMove) {
			window.removeEventListener('mousemove', this, true);
		}
	}
}

export default {
	name: 'SvgViewport',
	data() {
		return {
			minZoom: 0.2,
			maxZoom: 20,
			barsWidth: 14,
			x: 20,
			y: 20,
			zoom: 0.3,
			availableWidth: 1000,
			availableHeight: 1000,
			pz: undefined,
			horizontalHandler: new PanHandler({x: -1, y: 0}, this.getPan, this.setPan, true),
			verticalHandler: new PanHandler({x: 0, y: -1}, this.getPan, this.setPan, true),
			mouseHandler: new PanHandler({x: 1, y: 1}, this.getPan, this.setPan, false),
			mousePanMode: false
		};
	},
	computed: {
		transformMatrix() {
			return `matrix(${this.zoom}, 0, 0, ${this.zoom}, ${this.x}, ${this.y})`;
		},
		hBarSize() {
			return (this.availableWidth - this.barsWidth) / (this.zoom / this.minZoom);
		},
		hBarX() {
			return (1 - (this.x / this.availableWidth)) * (this.availableWidth - this.hBarSize - this.barsWidth);
		},
		vBarSize() {
			return (this.availableHeight - this.barsWidth) / (this.zoom / this.minZoom);
		},
		vBarY() {
			return (1 - (this.y / this.availableHeight)) * (this.availableHeight - this.vBarSize - this.barsWidth);
		},
		hBarStyle() {
			return {
				height: this.barsWidth + 'px',
				width: this.hBarSize + 'px',
				left: this.hBarX + 'px'
			};
		},
		vBarStyle() {
			return {
				width: this.barsWidth + 'px',
				height: this.vBarSize + 'px',
				top: this.vBarY + 'px'
			};
		},
		cursorStyle() {
			return {
				cursor: this.mousePanMode ? (this.mouseHandler.panning ? 'move ' : 'grab') : 'auto'
			};
		}
	},
	methods: {
		initMousePan() {
			if (!this.mousePanMode) {
				this.mousePanMode = true;
				window.addEventListener('mousedown', this.mouseHandler, true);
				// Register mousemove to block events even if not yet used to pan
				window.addEventListener('mousemove', this.mouseHandler, true);
			}
		},
		stopMousePan() {
			if (this.mousePanMode) {
				this.mousePanMode = false;
				this.mouseHandler.drop();
				window.removeEventListener('mousedown', this.mouseHandler, true);
				window.removeEventListener('mousemove', this.mouseHandler, true);
			}
		},
		getPan() {
			return {x: this.x, y: this.y};
		},
		setPan({x, y}) {
			this.x = x;
			this.y = y;
		},
		pointToSvg(domPoint) {
			const p = this.$refs.viewer.createSVGPoint();
			p.x = domPoint.x;
			p.y = domPoint.y;
			const transformed = p.matrixTransform(this.$refs.viewerContent.getScreenCTM().inverse());
			return {
				x: transformed.x,
				y: transformed.y
			};
		}
	},
	mounted() {
		const that = this;

		// this.pz = svgPanZoom('#viewer', {
		// 	panEnabled: false,
		// 	zoomEnabled: true,
		// 	dblClickZoomEnabled: false,
		// 	zoomScaleSensitivity: 0.2,
		// 	minZoom: that.minZoom,
		// 	maxZoom: that.maxZoom,
		// 	fit: true,
		// 	contain: true,
		// 	center: true,
		// 	onZoom() {
		// 		that.zoom = that.pz.getZoom();

		// 		const pan = that.pz.getPan();
		// 		that.x = Math.max(0, pan.x);
		// 		that.y = Math.max(0, pan.y);
		// 	},
		// 	beforePan(oldPoint, newPoint) {
		// 		return {
		// 			x: newPoint.x > 0 && newPoint.x < document.documentElement.clientWidth,
		// 			y: newPoint.y > 0 && newPoint.y < document.documentElement.clientHeight
		// 		};
		// 	},
		// 	onPan() {
		// 		const pan = that.pz.getPan();
		// 		that.x = Math.max(0, pan.x);
		// 		that.y = Math.max(0, pan.y);
		// 	}
		// });
		// this.horizontalHandler.pz = this.pz;
		// this.verticalHandler.pz = this.pz;
		// this.mouseHandler.pz = this.pz;

		window.addEventListener('wheel', onWheel);
		function onWheel(event) {
			event.stopPropagation();
			event.preventDefault();
			if (event.ctrlKey) {
				let newZoom = that.zoom + (event.deltaY * -0.01);
				newZoom = Math.max(that.minZoom, Math.min(that.maxZoom, newZoom));
				if (newZoom !== that.zoom) {
					const ctm = that.$refs.viewerContent.getScreenCTM();
					const point = that.$refs.viewer.createSVGPoint();
					point.x = event.pageX;
					point.y = event.pageY;
					const relativePoint = point.matrixTransform(ctm.inverse());
					const modifier = that.$refs.viewer
						.createSVGMatrix()
						.translate(relativePoint.x, relativePoint.y)
						.scale(newZoom / that.zoom)
						.translate(-relativePoint.x, -relativePoint.y);
					const newCTM = ctm.multiply(modifier);

					that.zoom = newCTM.a;
					that.x = newCTM.e;
					that.y = newCTM.f;
				}
			} else {
				that.x = that.x + (event.deltaX * -3);
				that.y = that.y + (event.deltaY * -3);
			}
		}

		window.addEventListener('resize', onResize);
		function onResize() {
			that.availableWidth = document.documentElement.clientWidth;
			that.availableHeight = document.documentElement.clientHeight;
		}

		onResize();
	}
};
</script>

<style scoped>
	#container {
		width:100%;
		height:100%;
	}
	#viewer {
		display:block;
		background:#ccc;
		width: 100%;
		height: 100%;
	}
	#toolbar {
		position: absolute;
		bottom: 30px;
	}
	#hScrollContainer {
		position: absolute;
		bottom: 0px;
		left: 0px;
		right: 0px;
		background: #66666666;
	}
	#vScrollContainer {
		position: absolute;
		bottom: 0px;
		top: 0px;
		right: 0px;
		background: #66666666;
	}
	.scrollBar {
		position: relative;
		background: #666;
		border-radius: 10px;
	}
</style>
