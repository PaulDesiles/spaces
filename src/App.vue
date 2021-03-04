<template>
	<div id="app">
		<Menu id="menu" />
		<div id="mainContent">
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
						:d="getPath(shape.points)"
						stroke-width="0"
						fill="black"
					/>

					<template v-if="drawingState">
						<path
							:d="currentPath"
							stroke="black"
							fill="none"
							stroke-width="1"
						/>
						<Guides />
						<DrawingPoint
							v-if="showStartPoint"
							:point="startPoint"
							:type="2"
							:hovered="hoveredElement === startPoint"
						/>
						<DrawingPoint :point="currentPoint" :type="1" />
					</template>
				</g>
			</SvgViewport>

			<DebugInfo
				v-if="debugMode"
				:mouse="mousePosition"
				:cursor="currentPoint"
				:hovered="hoveredElement"
			/>
		</div>

		<Tutorial class="fullScreen" />
		<ExportModal class="fullScreen" />
		<New class="fullScreen" />
	</div>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
import * as states from './store/states';

import DebugInfo from './components/debug/DebugInfo.vue';
import DebugView from './components/debug/DebugView.vue';
import Tutorial from './components/tutorial/Tutorial.vue';
import Menu from './components/menu/Menu.vue';
import ExportModal from './components/exporter/ExportModal.vue';
import New from './components/new/New.vue';

import SvgViewport from './components/SvgViewport.vue';
import DrawingPoint from './components/drawing/DrawingPoint.vue';
import Guides from './components/Guides.vue';

import {Point} from './core/Point';
import {Intersection} from './core/Intersection';
import {Line} from './core/Line';
import {constrainPointPosition} from './core/Constraint';
import {getShapePath} from './core/Helpers/SvgHelpers';

import * as backend from './connection/backend';

export default {
	name: 'App',
	components: {
		DebugInfo,
		DebugView,
		Tutorial,
		Menu,
		ExportModal,
		New,
		SvgViewport,
		DrawingPoint,
		Guides
	},
	data() {
		return {
			debugMode: false,
			snapThreshold: 20,
			mousePosition: new Point(),
			currentPoint: new Point(),
			downBeforeUp: false
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
			return getShapePath(this.currentShapePoints.concat(this.currentPoint), false);
		},
		shouldListenToKeyEvents() {
			return this.interactionState === states.DRAWING || this.interactionState === states.PREVIEW;
		},
		...mapState([
			'shapes',
			'currentShapePoints',
			'hoveredElement',
			'interactionState'
		]),
		...mapState('parameters', ['drawingSize']),
		...mapGetters([
			'lines',
			'intersections',
			'constrainedElements',
			'drawingState'
		])
	},
	watch: {
		shouldListenToKeyEvents() {
			const method = this.shouldListenToKeyEvents ? document.addEventListener : document.removeEventListener;
			method('keydown', this.keyDown);
			method('keyup', this.keyUp);
		},
		$route() {
			this.handleParamChangeAsync();
		},
		shapes() {
			backend.alertShapeChangesAsync(this.$store.state.drawingId, this.shapes);
		}
	},
	mounted() {
		window.addEventListener('blur', this.windowLostFocus);
		this.handleParamChangeAsync();
	},
	beforeDestroy() {
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
		getPath(shape) {
			return getShapePath(shape, true);
		},
		closeCurrentShape() {
			this.$store.commit('validateCurrentShape');
		},
		cancelCurrentShape() {
			if (this.currentShapePoints.length > 0) {
				this.$store.commit('cancelShape');
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
			if (this.mousePosition.x >= 0 &&
				this.mousePosition.x <= this.drawingSize.x &&
				this.mousePosition.y >= 0 &&
				this.mousePosition.y <= this.drawingSize.y)
			{
				this.updateCurrentPoint();
			}
		},
		mouseDown() {
			// We want to react to mouseUp only if mouseDown was also captured
			this.downBeforeUp = true;
		},
		mouseUp(event) {
			if (this.downBeforeUp) {
				this.downBeforeUp = false;
			} else {
				return;
			}

			if (this.drawingState) {
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
			}
		},
		keyDown(keyEvent) {
			const key = keyEvent.key.toLowerCase();
			if (key === 'control') {
				this.toggleAngleSteps(true);
			} else if (key === 'r' && !keyEvent.repeat) {
				this.togglePreviewMode(true);
			} else if (key === ' ' && !keyEvent.repeat) {
				this.$refs.svgViewport.initMousePan();
			}
		},
		keyUp(keyEvent) {
			const key = keyEvent.key.toLowerCase();
			if (key === 'control') {
				this.toggleAngleSteps(false);
			} else if (key === 'z' && keyEvent.ctrlKey) {
				if (keyEvent.shiftKey) {
					this.$store.commit('redo');
				} else {
					this.$store.commit('undo');
				}
			} else if ((key === 'y' && keyEvent.ctrlKey)) {
				this.$store.commit('redo');
			} else if (key === 'd') {
				this.debugMode = !this.debugMode;
			} else if (key === 'r') {
				this.togglePreviewMode(false);
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
			this.togglePreviewMode(false);
		},
		toggleAngleSteps(activate) {
			if (this.$store.state.parameters.toggleAngleSteps !== activate) {
				this.$store.commit('parameters/toggleAngleSteps', activate);
				this.updateCurrentPoint();
			}
		},
		togglePreviewMode(activate) {
			const state = this.$store.state.interactionState;

			if (activate && state === states.DRAWING) {
				this.$store.commit('setInteractionState', states.PREVIEW);
			} else if (!activate && state === states.PREVIEW) {
				this.$store.commit('setInteractionState', states.DRAWING);
			}
		},
		async handleParamChangeAsync() {
			const id = this.$route.params.id;
			if (id) {
				if (id !== this.$store.state.drawingId) {
					const drawing = await backend.getDrawingAsync(id);
					if (drawing) {
						this.$store.dispatch('recreateDrawing', drawing);
						this.$store.commit('setDrawingId', id);
						this.$store.commit('setInteractionState', states.DRAWING);
					}
				}
			} else {
				await this.createDrawingAsync();
			}
		},
		async createDrawingAsync() {
			this.$store.commit('setInteractionState', states.TUTORIAL);
			const parameters = this.$store.state.parameters;
			const id = await backend.createDrawingAsync({
				width: parameters.drawingSize.x,
				height: parameters.drawingSize.y,
				gap: parameters.shapesGap
			});

			if (id) {
				// Silently navigate to /id so as user can come back to this drawing
				this.$store.commit('setDrawingId', id);
				this.$router.push({
					name: 'draw',
					params: {id}
				});
			} else {
				// Offline drawing : drawing will not be stored
				if (this.$store.state.drawingId) {
					this.$store.commit('setDrawingId', undefined);
				}
			}
		}
	}
};
</script>

<style scoped>
#app {
	width:100%;
	height:100%;
	display: grid;
	grid-template-columns: 190px auto;
}

#menu {
	grid-column: 1 / 2;
	background: #f2f2f2;
	box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.3);
	user-select: none;
	z-index: 10;
}

#mainContent {
	grid-column: 2 / 3;
	position: relative;
}

.fullScreen {
	grid-column: 1 / 3;
	z-index: 20;
}

</style>
