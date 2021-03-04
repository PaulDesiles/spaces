<template>
	<div
		id="container"
		:style="cursorStyle"
		@wheel.prevent="onWheel($event)"
	>
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

import EventBus from '../EventBus';

class PanHandler {
	constructor(getDeltaRatio, getPan, setPan, registerMouseMove) {
		if (getDeltaRatio) {
			this.getDeltaRatio = getDeltaRatio;
		} else {
			this.getDeltaRatio = () => ({x: 1, y: 1});
		}

		this.getPan = getPan;
		this.setPan = setPan;
		this.registerMouseMove = registerMouseMove;
		this.initPan = {x: 0, y: 0};
		this.initMouse = {x: 0, y: 0};
		this.panning = false;
	}

	// All events pass through this method
	// in order to have "this" refering to the current object
	handleEvent(event) {
		switch (event.type) {
			case 'mousedown':
				this.hang(event);
				break;
			case 'mousemove':
				this.move(event);
				break;
			case 'mouseup':
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
		if (this.registerMouseMove) {
			window.addEventListener('mousemove', this, true);
		}
	}

	move(event) {
		event.stopPropagation();
		event.preventDefault();

		if (this.panning) {
			const ratio = this.getDeltaRatio();
			const deltaX = ratio.x * (event.pageX - this.initMouse.x);
			const deltaY = ratio.y * (event.pageY - this.initMouse.y);

			this.setPan(
				this.initPan.x + deltaX,
				this.initPan.y + deltaY
			);
		}
	}

	drop(event) {
		if (event) {
			event.stopPropagation();
			event.preventDefault();
		}

		this.panning = false;
		window.removeEventListener('mouseup', this, true);
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
			zoom: 0.7,
			offset: {x: 0, y: 0},
			availableWidth: 1000,
			availableHeight: 1000,
			horizontalHandler: new PanHandler(this.hBarPanRatio, this.getPan, this.setPan, true),
			verticalHandler: new PanHandler(this.vBarPanRatio, this.getPan, this.setPan, true),
			mouseHandler: new PanHandler(undefined, this.getPan, this.setPan, false),
			mousePanMode: false
		};
	},
	mounted() {
		// DIV don't throw Resize events : we need to listen on whole window
		window.addEventListener('resize', this, false);
		this.onResize();
		this.centerDrawing();
		EventBus.$on('newDrawing', this.centerDrawing);
	},
	beforeDestroy() {
		window.removeEventListener('resize', this, false);
		EventBus.$off('newDrawing', this.centerDrawing);
	},
	computed: {
		drawingWidth() {
			return this.$store.state.parameters.drawingSize.x;
		},
		drawingHeight() {
			return this.$store.state.parameters.drawingSize.y;
		},
		transformMatrix() {
			return `matrix(${this.zoom}, 0, 0, ${this.zoom}, ${this.x}, ${this.y})`;
		},
		panBounds() {
			const margin = 20;
			return {
				minX: margin - (this.drawingWidth * this.zoom),
				minY: margin - (this.drawingHeight * this.zoom),
				maxX: this.availableWidth - margin,
				maxY: this.availableHeight - margin
			};
		},
		hBarSize() {
			return (this.availableWidth - this.barsWidth) / (this.zoom / this.minZoom);
		},
		hBarMaxSize() {
			return this.availableWidth - this.hBarSize - this.barsWidth;
		},
		hBarStyle() {
			const xRatio = (this.x - this.panBounds.minX) / (this.panBounds.maxX - this.panBounds.minX);
			const barX = (1 - xRatio) * this.hBarMaxSize;

			return {
				height: this.barsWidth + 'px',
				width: this.hBarSize + 'px',
				left: barX + 'px'
			};
		},
		vBarSize() {
			return (this.availableHeight - this.barsWidth) / (this.zoom / this.minZoom);
		},
		vBarMaxSize() {
			return this.availableHeight - this.vBarSize - this.barsWidth;
		},
		vBarStyle() {
			const yRatio = (this.y - this.panBounds.minY) / (this.panBounds.maxY - this.panBounds.minY);
			const barY = (1 - yRatio) * this.vBarMaxSize;

			return {
				width: this.barsWidth + 'px',
				height: this.vBarSize + 'px',
				top: barY + 'px'
			};
		},
		cursorStyle() {
			return {
				cursor: this.mousePanMode ? (this.mouseHandler.panning ? 'grabbing' : 'grab') : 'auto'
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
		setPan(x, y) {
			const bounds = this.panBounds;
			this.x = Math.max(bounds.minX, Math.min(bounds.maxX, x));
			this.y = Math.max(bounds.minY, Math.min(bounds.maxY, y));
		},
		hBarPanRatio() {
			const ratio = (this.panBounds.maxX - this.panBounds.minX) / this.hBarMaxSize;
			return {x: -ratio, y: 0};
		},
		vBarPanRatio() {
			const ratio = (this.panBounds.maxY - this.panBounds.minY) / this.vBarMaxSize;
			return {x: 0, y: -ratio};
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
		},
		handleEvent(event) {
			switch (event.type) {
				case 'resize':
					this.onResize(event);
					break;
				default:
					break;
			}
		},
		onResize() {
			const rect = this.$refs.viewer.getBoundingClientRect();
			this.offset = {x: rect.x, y: rect.y};
			this.availableWidth = rect.width;
			this.availableHeight = rect.height;
		},
		onWheel(event) {
			if (event.ctrlKey) {
				let newZoom = this.zoom * (1 - (Math.sign(event.deltaY) * 0.1));
				newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
				if (newZoom !== this.zoom) {
					const ctm = this.$refs.viewerContent.getScreenCTM();
					const point = this.$refs.viewer.createSVGPoint();
					point.x = event.pageX;
					point.y = event.pageY;
					const relativePoint = point.matrixTransform(ctm.inverse());
					const modifier = this.$refs.viewer
						.createSVGMatrix()
						.translate(relativePoint.x, relativePoint.y)
						.scale(newZoom / this.zoom)
						.translate(-relativePoint.x, -relativePoint.y);
					const newCTM = ctm.multiply(modifier);

					this.zoom = newCTM.a;
					this.setPan(
						newCTM.e - this.offset.x,
						newCTM.f - this.offset.y
					);
				}
			} else {
				this.setPan(
					this.x + (Math.sign(event.deltaX) * -10),
					this.y + (Math.sign(event.deltaY) * -10)
				);
			}
		},
		centerDrawing() {
			const margin = 30;
			const margin2 = margin * 2;
			const screenRatio = this.availableWidth / this.availableHeight;
			const drawingRatio = (this.drawingWidth + margin2 + this.barsWidth) / (this.drawingHeight + margin2 + this.barsWidth);
			if (drawingRatio > screenRatio) {
				this.zoom = (this.availableWidth - margin2 - this.barsWidth) / this.drawingWidth;
				this.x = margin;
				this.y = ((this.availableHeight - this.barsWidth - (this.zoom * this.drawingHeight)) / 2);
			} else {
				this.zoom = (this.availableHeight - margin2 - this.barsWidth) / this.drawingHeight;
				this.y = margin;
				this.x = ((this.availableWidth - this.barsWidth - (this.zoom * this.drawingWidth)) / 2);
			}
		}
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
