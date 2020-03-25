<template>
	<div id="app">
		<SvgViewport ref="svgViewport">
			<g
				ref="mainGroup"
				@click="clic($event)"
				@mousemove="move($event)"
				@keyup.z.ctrl="cancel()"
			>
				<rect
					x="0"
					y="0"
					:width="xmax"
					:height="ymax"
					fill="white"
					border="#000"
					border-width="1"
				/>

				<template v-for="guide in projectedGuides">
					<line
						:x1="guide.x1"
						:y1="guide.y1"
						:x2="guide.x2"
						:y2="guide.y2"
						stroke-width="1"
						:stroke="guide.color"
					/>
				</template>

				<path
					v-for="shape in shapes"
					:d="getPath(shape.points, true)"
					stroke-width="0"
					fill="black"
				/>

				<path
					:d="currentPath"
					stroke="black"
					fill="none"
					stroke-width="1"
				/>

				<template v-for="guide in guides" v-if="!guide.hidePoints">
					<anchor :point="guide.A" :type="3" />
					<anchor :point="guide.B" :type="3" />
				</template>

				<anchor v-if="showStartPoint" :point="startPoint" :type="2" />

				<anchor :point="currentPoint" :type="1" />
			</g>
		</SvgViewport>
	</div>
</template>

<script>
import SvgViewport from './components/SvgViewport.vue'
import Anchor from './components/Anchor.vue'
import * as Geo from './components/Geometry.js'

export default {
	name: 'App',
	components: {
		SvgViewport,
		Anchor
	},
	data() {
		return {
			snapThreshold: 20,
			xmax: 1000,
			ymax: 600,
			currentPoint: new Geo.Point(),
			currentShape: [],
			shapes: []
		};
	},
	computed: {
		showStartPoint() {
			return this.currentShape.length > 2;
		},
		startPoint() {
			if (this.currentShape.length <= 0) {
				return undefined;
			}

			return this.currentShape[0];
		},
		currentPath() {
			return this.getPath(this.currentShape.concat(this.currentPoint));
		},
		guides() {
			return this.shapes.map(s => s.guides).flat();
		},
		projectedGuides() {
			return this.guides.map(g => {
				// Compute the guide's function intersections with frame borders
				const intersections = [
					{x: 0, y: g.y(0)}, // I_xmin
					{x: g.x(0), y: 0}, // I_ymin
					{x: this.xmax, y: g.y(this.xmax)}, // I_xmax
					{x: g.x(this.ymax), y: this.ymax} // I_ymax
				];

				// Line 'bounds' are the intersections that are still inside the frame
				const lineBounds = [];
				intersections.forEach(p => {
					if (lineBounds.length < 2 &&
						p.x >= 0 &&
						p.x <= this.xmax &&
						p.y >= 0 &&
						p.y <= this.ymax)
					{
						lineBounds.push(p);
					}
				});

				return {
					x1: lineBounds[0].x,
					y1: lineBounds[0].y,
					x2: lineBounds[1].x,
					y2: lineBounds[1].y,
					color: (g.isMouseOver ? '#318be7' : '#aaa')
				};
			});
		}
	},
	methods: {
		getPosition(event) {
			const newP = this.$refs.svgViewport.pointToSvg({
				x: event.pageX,
				y: event.pageY
			});
			return new Geo.Point(newP.x, newP.y);
		},
		getPath(shape, closeShape) {
			let path = '';
			shape.forEach((s, i) => {
				path += (i === 0 ? 'M' : 'L');
				path += s.x + ' ' + s.y + ' ';
			});
			if (closeShape) {
				path += 'Z';
			}

			return path;
		},
		isSnappedAtStartPoint(point) {
			return this.showStartPoint && point.getSqDistanceFrom(this.currentShape[0]) < this.snapThreshold;
		},
		closeCurrentShape() {
			this.shapes.push(new Geo.Shape(this.currentShape));
			this.currentShape = [];
		},
		getSnappedPosition(mouseEvent, updateUI) {
			let snappedPoint = this.getPosition(mouseEvent);
			let nearestPoint;
			let nearestDistance = this.snapThreshold;
			const allAnchors = this.guides
				.filter(g => !g.hidePoints)
				.map(g => [g.A, g.B])
				.flat();

			if (this.showStartPoint) {
				allAnchors.unshift(this.startPoint);
			}

			allAnchors.forEach(a => {
				if (updateUI) {
					a.isMouseOver = false;
				}

				const d = a.getSqDistanceFrom(snappedPoint);
				if (d < nearestDistance) {
					nearestDistance = d;
					nearestPoint = a;
				}
			});

			if (nearestPoint === undefined) {
				let nearestGuide;
				this.guides.forEach(g => {
					if (updateUI) {
						g.isMouseOver = false;
					}

					const p = g.getProjection(snappedPoint);
					const d = p.getSqDistanceFrom(snappedPoint);
					if (d < nearestDistance) {
						nearestDistance = d;
						nearestPoint = p;
						nearestGuide = g;
					}
				});

				if (nearestPoint !== undefined) {
					snappedPoint = nearestPoint;

					if (updateUI) {
						nearestGuide.isMouseOver = true;
					}
				}
			} else {
				snappedPoint = nearestPoint;

				if (updateUI) {
					nearestPoint.isMouseOver = true;

					this.guides
						.filter(g => g.isMouseOver)
						.forEach(g => {
							g.isMouseOver = false;
						});
				}
			}

			return snappedPoint;
		},
		move(event) {
			this.currentPoint = this.getSnappedPosition(event, true);
		},
		clic(event) {
			const snappedPoint = this.getSnappedPosition(event, false);
			if (this.showStartPoint && snappedPoint === this.startPoint) {
				this.closeCurrentShape();
			} else {
				this.currentShape.push(snappedPoint.clone());
			}
		},
		cancel() {
			if (this.startPoint === undefined) {
				this.shapes.pop();
			} else {
				this.currentShape.pop();
			}
		}
	}
};
</script>

<style>
body { margin: 0px; }
html, body, #app, #container {
	width:100%;
	height:100%;
}
</style>
