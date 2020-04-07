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

				<DrawingLine
					v-for="line in lines"
					:key="line.id"
					:p1="line.bounds[0]"
					:p2="line.bounds[1]"
					:hovered="amIHovered(line)"
				/>

				<path
					v-for="shape in shapes"
					:key="shape.id"
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

				<DrawingPoint
					v-for="p in intersections"
					:key="p.id"
					:point="p"
					:type="3"
					:hovered="amIHovered(p)"
				/>

				<DrawingPoint
					v-if="showStartPoint"
					:point="startPoint"
					:type="2"
					:hovered="amIHovered(startPoint)"
				/>

				<DrawingPoint :point="currentPoint" :type="1" />
			</g>
		</SvgViewport>
		<DebugInfo
			:mouse="mousePosition"
			:cursor="currentPoint"
			:hovered="hoveredElement"
		/>
		<Toolbar v-bind="parameters" @updateParameter="parameterChanged" />
	</div>
</template>

<script>
import DebugInfo from './components/DebugInfo.vue';
import SvgViewport from './components/SvgViewport.vue';
import DrawingPoint from './components/DrawingPoint.vue';
import DrawingLine from './components/DrawingLine.vue';
import Toolbar from './components/Toolbar.vue';
import {initBounds, Point, Intersection, Line, Shape} from './components/Geometry.js';

// Only first occurence of an object will be returned
function distinct(value, index, self) {
	return self.indexOf(value) === index;
}

const drawingWidth = 1000;
const drawingHeight = 600;
initBounds(1000, 600);

export default {
	name: 'App',
	components: {
		DebugInfo,
		SvgViewport,
		DrawingPoint,
		DrawingLine,
		Toolbar
	},
	data() {
		return {
			parameters: {
				minSize: 0,
				maxSize: 1000,
				minAngleRad: 0,
				angleStepRad: 0
			},
			snapThreshold: 20,
			xmax: drawingWidth,
			ymax: drawingHeight,
			mousePosition: new Point(),
			currentPoint: new Point(),
			currentShapePoints: [],
			shapes: [],
			hoveredElement: undefined
		};
	},
	computed: {
		showStartPoint() {
			return this.currentShapePoints.length > 2;
		},
		startPoint() {
			if (this.currentShapePoints.length <= 0) {
				return undefined;
			}

			return this.currentShapePoints[0];
		},
		currentPath() {
			return this.getPath(this.currentShapePoints.concat(this.currentPoint));
		},
		lines() {
			return this.shapes
				.map(s => s.lines.concat(s.spacedLines))
				.flat()
				.filter(distinct);
		},
		intersections() {
			return this.lines
				.map(l => l.intersections)
				.flat()
				.filter(distinct)
				.filter(p => p.insideBounds);
		}
	},
	methods: {
		getPosition(event) {
			const newP = this.$refs.svgViewport.pointToSvg({
				x: event.pageX,
				y: event.pageY
			});
			return new Point(newP.x, newP.y);
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
		closeCurrentShape() {
			const newShape = new Shape(this.currentShapePoints);
			newShape.updateIntersections(this.lines);
			this.shapes.push(newShape);
			this.currentShapePoints = [];
			this.checkForDuplicates();
		},
		applyConstraints(mousePosition) {
			if (this.currentShapePoints.length > 0) {
				const last = this.currentShapePoints[this.currentShapePoints.length - 1];
				let before;
				if (this.currentShapePoints.length > 1) {
					before = this.currentShapePoints[this.currentShapePoints.length - 2];
				}

				let newPoint = last.constrainDistanceTo(
					mousePosition,
					this.parameters.minSize,
					this.parameters.maxSize
				);
				newPoint = last.constrainAngleTo(
					newPoint,
					before,
					this.parameters.minAngleRad,
					this.parameters.angleStepRad
				);
				return newPoint;
			}

			return mousePosition;
		},
		getSnappedPosition(mousePosition) {
			let snappedPoint = this.applyConstraints(mousePosition);
			let nearestPoint;
			let nearestDistance = this.snapThreshold * this.snapThreshold;

			this.hoveredElement = undefined;

			const searchNearestPoint = function (p) {
				const d = p.getSquaredDistanceTo(snappedPoint);
				if (d < nearestDistance) {
					nearestDistance = d;
					nearestPoint = p;
				}
			};

			if (this.showStartPoint) {
				searchNearestPoint(this.startPoint);
			}

			this.intersections.forEach(searchNearestPoint);

			if (nearestPoint === undefined) {
				let nearestGuide;
				this.lines.forEach(g => {
					const p = g.getProjection(snappedPoint);
					const d = p.getSquaredDistanceTo(snappedPoint);
					if (d < nearestDistance) {
						nearestDistance = d;
						nearestPoint = p;
						nearestGuide = g;
					}
				});

				if (nearestPoint !== undefined) {
					snappedPoint = nearestPoint;
					this.hoveredElement = nearestGuide;
				}
			} else {
				snappedPoint = nearestPoint;
				this.hoveredElement = nearestPoint;
			}

			return snappedPoint;
		},
		amIHovered(myModel) {
			return this.hoveredElement === myModel ||
				(this.hoveredElement instanceof Intersection &&
					myModel instanceof Line &&
					this.hoveredElement.crossingLines.includes(myModel));
		},
		move(event) {
			this.mousePosition = this.getPosition(event);
			this.currentPoint = this.getSnappedPosition(this.mousePosition);
		},
		clic(event) {
			const snappedPoint = this.getSnappedPosition(this.getPosition(event));

			if (this.showStartPoint && snappedPoint === this.startPoint) {
				this.closeCurrentShape();
			} else {
				let newPoint = snappedPoint;
				if (!(newPoint instanceof Intersection)) {
					newPoint = new Intersection(snappedPoint.x, snappedPoint.y);
					if (this.hoveredElement instanceof Line) {
						newPoint.crossingLines.push(this.hoveredElement);
						// Warning : the line is not yet aknowledge of this link
						// it will be at shape creation
					}
				}

				this.currentShapePoints.push(newPoint);
			}
		},
		cancel() {
			if (this.startPoint === undefined) {
				this.shapes.pop();
			} else {
				this.currentShapePoints.pop();
			}
		},
		parameterChanged(infos) {
			this.parameters[infos.name] = infos.value;
		},
		checkForDuplicates() {
			// Check points duplicates
			// this.intersections.forEach((p1, i) => {
			// 	this.intersections
			// 		.slice(i + 1)
			// 		.forEach(p2 => {
			// 			if (equiv(p1.x, p2.x) && equiv(p1.y, p2.y)) {
			// 				console.log(`${p1.id} <=> ${p2.id}`);
			// 			}
			// 		});
			// });

			// // Check lines duplicates
			// this.lines.forEach((l1, i) => {
			// 	this.lines
			// 		.slice(i + 1)
			// 		.forEach(l2 => {
			// 			if (equiv(l1.a, l2.a) && equiv(l1.b, l2.b)) {
			// 				console.log(`${l1.id} <=> ${l2.id}`);
			// 			}
			// 		});
			// });
		}
	}
};
</script>

<style>
body {
	margin: 0px;
	font-family: Arial, Helvetica;
	font-size: 10pt;
}
html, body, #app, #container {
	width:100%;
	height:100%;
}
</style>
