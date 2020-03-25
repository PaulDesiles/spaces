<template>
	<div id="container">
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
					@mousedown.stop="hang()"
				/>
			</div>
			<div id="vScrollContainer">
				<div
					ref="vScrollBar"
					class="scrollBar"
					:style="vBarStyle"
					@mousedown.stop="hang()"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import svgPanZoom from 'svg-pan-zoom';

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
			initMouse: {x: 0, y: 0},
			initPan: {x: 0, y: 0},
			isScrollHorizontal: undefined,
			pz: undefined
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
		}
	},
	methods: {
		hang(event) {
			this.initMouse = {x: event.pageX, y: event.pageY};
			this.initPan = this.pz.getPan();
			this.isScrollHorizontal = event.srcElement === this.$refs.hScrollBar;
			window.addEventListener('mousemove', this.move);
			window.addEventListener('mouseup', this.drop);
			window.addEventListener('mouseleave', this.drop);
		},
		move(event) {
			event.preventDefault();
			const deltaX = this.isScrollHorizontal ? (event.pageX - this.initMouse.x) : 0;
			const deltaY = this.isScrollHorizontal ? 0 : (event.pageY - this.initMouse.y);
			this.pz.pan({
				x: this.initPan.x - deltaX,
				y: this.initPan.y - deltaY
			});
		},
		drop() {
			window.removeEventListener('mousemove', this.move, false);
			window.removeEventListener('mouseup', this.move, false);
			window.removeEventListener('mouseleave', this.move, false);
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
