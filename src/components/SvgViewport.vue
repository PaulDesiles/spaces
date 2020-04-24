<template>
	<div id="container" :style="cursorStyle">
		<svg id="viewer" ref="viewer" xmlns="http://www.w3.org/2000/svg">
			<g ref="viewerContent">
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
	constructor(panHorizontally, panVertically, invert) {
		this.panHorizontally = panHorizontally;
		this.panVertically = panVertically;
		this.direction = invert ? 1 : -1;
		this.initMouse = {x: 0, y: 0};
		this.initPan = {x: 0, y: 0};
		this.panning = false;
	}

	// All events pass threw this method
	// so that "this" refers to current object
	handleEvent(event) {
		switch(event.type) {
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
		this.initMouse = {x: event.pageX, y: event.pageY};
		this.initPan = this.pz.getPan();
		window.addEventListener('mouseup', this, true);
		window.addEventListener('mouseleave', this, true);
		this.panning = true;
	}

	move(event) {
		event.stopPropagation();
		event.preventDefault();

		if (this.panning) {
			const deltaX = this.panHorizontally ? (event.pageX - this.initMouse.x) : 0;
			const deltaY = this.panVertically ? (event.pageY - this.initMouse.y) : 0;
			this.pz.pan({
				x: this.initPan.x + (deltaX * this.direction),
				y: this.initPan.y + (deltaY * this.direction)
			});
		}
	}

	drop(event) {
		if (event) {
			event.stopPropagation();
			event.preventDefault();
		}

		window.removeEventListener('mouseup', this, true);
		window.removeEventListener('mouseleave', this, true);

		this.panning = false;
	}
}

export default {
	name: 'SvgViewport',
	data() {
		return {
			minZoom: 0.2,
			maxZoom: 20,
			barsWidth: 14,
			x: 0,
			y: 0,
			zoom: 1,
			availableWidth: 1000,
			availableHeight: 1000,
			pz: undefined,
			horizontalHandler: new PanHandler(true, false),
			verticalHandler: new PanHandler(false, true),
			mouseHandler: new PanHandler(true, true, true),
			mousePanMode: false
		};
	},
	computed: {
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

		this.pz = svgPanZoom('#viewer', {
			panEnabled: false,
			zoomEnabled: true,
			dblClickZoomEnabled: false,
			zoomScaleSensitivity: 0.2,
			minZoom: that.minZoom,
			maxZoom: that.maxZoom,
			fit: true,
			center: true,
			onZoom() {
				that.zoom = that.pz.getZoom();

				const pan = that.pz.getPan();
				that.x = Math.max(0, pan.x);
				that.y = Math.max(0, pan.y);
			},
			beforePan(oldPoint, newPoint) {
				return {
					x: newPoint.x > 0 && newPoint.x < document.documentElement.clientWidth,
					y: newPoint.y > 0 && newPoint.y < document.documentElement.clientHeight
				};
			},
			onPan() {
				const pan = that.pz.getPan();
				that.x = Math.max(0, pan.x);
				that.y = Math.max(0, pan.y);
			}
		});
		this.horizontalHandler.pz = this.pz;
		this.verticalHandler.pz = this.pz;
		this.mouseHandler.pz = this.pz;

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
