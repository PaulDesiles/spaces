<template>
	<div id="app">
		<SvgViewport ref="svgViewport">
			<g
				ref="mainGroup"
				@click="clic($event)"
				@mousemove="move($event)"
			>
				<rect
					x="0"
					y="0"
					:width="parameters.xmax"
					:height="parameters.ymax"
					fill="white"
				/>

				<DebugView
					v-if="debugMode"
					:parameters="parameters"
					:currentShapePoints="currentShapePoints"
					:constrainedElements="constrainedElements"
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

				<Guides
					v-if="showGuides"
					:lines="lines"
					:intersections="intersections"
					:hoveredElement="hoveredElement"
				/>

				<DrawingPoint
					v-if="showStartPoint"
					:point="startPoint"
					:type="2"
					:hovered="hoveredElement === startPoint"
				/>

				<DrawingPoint :point="currentPoint" :type="1" />
			</g>
		</SvgViewport>
		<DebugInfo
			v-if="debugMode"
			:mouse="mousePosition"
			:cursor="currentPoint"
			:hovered="hoveredElement"
		/>
		<ParametersPanel>
			<Toolbar v-bind="parameters" @updateParameter="parameterChanged" />
		</ParametersPanel>
	</div>
</template>

<script>
import DebugInfo from './components/DebugInfo.vue';
import DebugView from './components/DebugView.vue';

import SvgViewport from './components/SvgViewport.vue';
import DrawingPoint from './components/DrawingPoint.vue';
import Guides from './components/Guides.vue';

import Toolbar from './components/Toolbar.vue';
import ParametersPanel from './components/ParametersPanel.vue';

import {initBounds, Point, Intersection, Line, Shape} from './components/Geometry';
import {constrainPointPosition, getContrainedSnappingElements} from './components/Constraint';

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
		DebugView,
		SvgViewport,
		DrawingPoint,
		Guides,
		Toolbar,
		ParametersPanel
	},
	data() {
		return {
			parameters: {
				xmax: drawingWidth,
				ymax: drawingHeight,
				minSize: 0,
				maxSize: 1000,
				minAngleRad: 10 * Math.PI / 180,
				selectedAngleStepRad: 10 * Math.PI / 180,
				angleStepRad: 0
			},
			debugMode: false,
			showGuides: true,
			snapThreshold: 20,
			mousePosition: new Point(),
			currentPoint: new Point(),
			currentShapePoints: [],
			shapes: [],
			constrainedElements: {
				points: [],
				segments: []
			},
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
	created() {
		window.addEventListener('keydown', this.keyDown);
		window.addEventListener('keyup', this.keyUp);
		window.addEventListener('blur', this.windowLostFocus);
	},
	destroyed() {
		window.removeEventListener('keydown', this.keyDown);
		window.removeEventListener('keyup', this.keyUp);
		window.removeEventListener('blur', this.windowLostFocus);
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
		getSnappedPosition(mousePosition) {
			let snappedPoint = constrainPointPosition(mousePosition, this.currentShapePoints, this.parameters);
			let nearestPoint;
			let nearestDistance = this.snapThreshold * this.snapThreshold;
			this.hoveredElement = undefined;

			const {points, segments} = this.constrainedElements;

			points.forEach(p => {
				const d = p.getSquaredDistanceTo(snappedPoint);
				if (d < nearestDistance) {
					nearestDistance = d;
					nearestPoint = p;
				}
			});

			if (nearestPoint === undefined) {
				let nearestSegment;
				segments.forEach(s => {
					const p = s.getProjection(snappedPoint);
					const d = p.getSquaredDistanceTo(snappedPoint);
					if (d < nearestDistance) {
						nearestDistance = d;
						nearestPoint = p;
						nearestSegment = s;
					}
				});

				if (nearestPoint !== undefined) {
					snappedPoint = nearestPoint;

					if (nearestSegment instanceof Line) {
						this.hoveredElement = nearestSegment;
					} else {
						this.hoveredElement = nearestSegment.associatedLine;
					}
				}
			} else {
				snappedPoint = nearestPoint;
				this.hoveredElement = nearestPoint;
			}

			return snappedPoint;
		},
		updateConstraints() {
			const points = [];
			if (this.showStartPoint) {
				points.push(this.startPoint);
			}

			// StartPoint is added first to have snapping priority over the other points
			this.constrainedElements = getContrainedSnappingElements(
				points.concat(this.intersections),
				this.lines,
				this.currentShapePoints,
				this.parameters);
		},
		updateCurrentPoint() {
			this.currentPoint = this.getSnappedPosition(this.mousePosition);
		},
		move(event) {
			this.mousePosition = this.getPosition(event);
			this.updateCurrentPoint();
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

			this.updateConstraints();
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
			this.updateConstraints();
		},
		keyDown(keyEvent) {
			if (keyEvent.key.toLowerCase() === 'control') {
				this.toggleAngleSteps(true);
			}
		},
		keyUp(keyEvent) {
			const key = keyEvent.key.toLowerCase();
			if (key === 'control') {
				this.toggleAngleSteps(false);
			} else if (key === 'd') {
				this.debugMode = !this.debugMode;
			} else if (key === 'h') {
				this.showGuides = !this.showGuides;
			}
		},
		windowLostFocus() {
			this.toggleAngleSteps(false);
		},
		toggleAngleSteps(activate) {
			const newValue = activate ? this.parameters.selectedAngleStepRad : 0;
			if (this.parameters.angleStepRad !== newValue) {
				this.parameters.angleStepRad = newValue;
				this.updateConstraints();
				this.updateCurrentPoint();
			}
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
html, body, #app {
	width:100%;
	height:100%;
}
</style>
