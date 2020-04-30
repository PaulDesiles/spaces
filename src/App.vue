<template>
	<div id="app">
		<SvgViewport ref="svgViewport">
			<g
				ref="mainGroup"
				@mousemove="mouseMove($event)"
				@mousedown.left="mouseDown()"
				@mouseup.left="mouseUp($event)"
			>
				<rect
					x="0"
					y="0"
					:width="drawingSize.x"
					:height="drawingSize.y"
					fill="white"
				/>

				<DebugView v-if="debugMode" />

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

				<Guides v-if="showGuides" />

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

		<ParametersPanel />

		<ContextMenu ref="contextMenu" />
	</div>
</template>

<script>
import {mapState, mapGetters} from 'vuex';

import DebugInfo from './components/debug/DebugInfo.vue';
import DebugView from './components/debug/DebugView.vue';

import SvgViewport from './components/SvgViewport.vue';
import DrawingPoint from './components/drawing/DrawingPoint.vue';
import Guides from './components/Guides.vue';

import ParametersPanel from './components/parameters/ParametersPanel.vue';
import ContextMenu from './components/ContextMenu.vue';

import {initBounds, Point, Intersection, Line} from './model/Geometry';
import {constrainPointPosition} from './model/Constraint';

export default {
	name: 'App',
	components: {
		DebugInfo,
		DebugView,
		SvgViewport,
		DrawingPoint,
		Guides,
		ParametersPanel,
		ContextMenu
	},
	data() {
		return {
			debugMode: false,
			showGuides: true,
			snapThreshold: 20,
			mousePosition: new Point(),
			currentPoint: new Point(),
			downBeforeUp: false,
			eventListeners: [
				{event: 'keydown', listener: this.keyDown},
				{event: 'keyup', listener: this.keyUp},
				{event: 'blur', listener: this.windowLostFocus},
				{event: 'contextmenu', listener: this.openContextMenu}
			]
		};
	},
	computed: {
		showStartPoint() {
			return this.currentShapePoints.length > 2;
		},
		startPoint() {
			return this.currentShapePoints[0];
		},
		currentPath() {
			return this.getPath(this.currentShapePoints.concat(this.currentPoint));
		},
		...mapState([
			'shapes',
			'currentShapePoints',
			'hoveredElement'
		]),
		...mapState('parameters', ['drawingSize']),
		...mapGetters([
			'lines',
			'intersections',
			'constrainedElements'
		])
	},
	created() {
		initBounds(this.drawingSize);
	},
	mounted() {
		this.eventListeners.forEach(l => document.addEventListener(l.event, l.listener));
	},
	unmounted() {
		this.eventListeners.forEach(l => document.removeEventListener(l.event, l.listener));
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
			this.$store.commit('validateCurrentShape');
		},
		cancelCurrentShape() {
			if (this.currentShapePoints.length > 0) {
				this.$store.commit('emptyCurrentShape');
			}
		},
		getSnappedPosition(mousePosition) {
			let snappedPoint = constrainPointPosition(
				mousePosition,
				this.currentShapePoints,
				{
					minStroke: this.$store.state.parameters.minStroke,
					maxStroke: this.$store.state.parameters.maxStroke,
					minAngle: this.$store.state.parameters.minAngle,
					angleStep: this.$store.state.parameters.angleStep
				});
			let nearestPoint;
			let nearestDistance = this.snapThreshold * this.snapThreshold;
			let hovered;

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
						hovered = nearestSegment;
					} else {
						hovered = nearestSegment.associatedLine;
					}
				}
			} else {
				snappedPoint = nearestPoint;
				hovered = nearestPoint;
			}

			if (hovered !== this.hoveredElement) {
				this.$store.commit('setHoveredElement', hovered);
			}

			return snappedPoint;
		},
		updateCurrentPoint() {
			this.currentPoint = this.getSnappedPosition(this.mousePosition);
		},
		mouseMove(event) {
			this.mousePosition = this.getPosition(event);
			if (!this.$refs.contextMenu.opened &&
				this.mousePosition.x >= 0 &&
				this.mousePosition.x <= this.drawingSize.x &&
				this.mousePosition.y >= 0 &&
				this.mousePosition.y <= this.drawingSize.y)
			{
				this.updateCurrentPoint();
			}
		},
		mouseDown() {
			if (this.$refs.contextMenu.opened) {
				this.$refs.contextMenu.close();
			} else {
				// We want to react to mouseUp only if mouseDown was also captured
				this.downBeforeUp = true;
			}
		},
		mouseUp(event) {
			if (this.downBeforeUp) {
				this.downBeforeUp = false;
			} else {
				return;
			}

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

				this.$store.commit('addPoint', newPoint);
			}
		},
		openContextMenu(event) {
			event.preventDefault();
			let actions = [];
			if (this.hoveredElement instanceof Line) {
				actions = [
					{
						id: 1,
						title: 'current stroke // to this line',
						onClick: () => {}
					},
					{
						id: 2,
						title: 'next stroke // to this line…',
						onClick: () => {}
					}
				];
			} else if (this.hoveredElement instanceof Intersection) {
				actions = [
					{
						id: 3,
						title: 'current stroke towards this point',
						onClick: () => {}
					}
				];
			}

			this.$refs.contextMenu.initialize(actions, event.clientX, event.clientY);
		},
		cancel() {
			if (this.startPoint === undefined) {
				this.$store.commit('removeLastShape');
			} else {
				this.$store.commit('removeLastPoint');
			}
		},
		keyDown(keyEvent) {
			const key = keyEvent.key.toLowerCase();
			if (key === 'control') {
				this.toggleAngleSteps(true);
			} else if (key === ' ' && !keyEvent.repeat) {
				this.$refs.svgViewport.initMousePan();
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
			} else if (key === 'enter') {
				this.closeCurrentShape();
			} else if (key === 'escape') {
				this.cancelCurrentShape();
			} else if (key === ' ') {
				this.$refs.svgViewport.stopMousePan();
			}
		},
		windowLostFocus() {
			this.toggleAngleSteps(false);
		},
		toggleAngleSteps(activate) {
			this.$store.commit('parameters/toggleAngleSteps', activate);
			this.updateCurrentPoint();
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
