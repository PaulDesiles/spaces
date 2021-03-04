import Vue from 'vue';
import Vuex from 'vuex';
import parameters from './parameters';
import EventBus from '../EventBus';
import {Shape} from '../core/Shape';
import {Intersection} from '../core/Intersection';
import {Point} from '../core/Point';
import {getContrainedSnappingElements} from '../core/Constraint';
import {distinct} from '../core/Helpers/ArrayHelpers';
import {isInsideBounds} from '../core/Helpers/GeometryHelpers';
import * as states from './states';

Vue.use(Vuex);

const getters = {
	lines(state) {
		return state.shapes
			.map(s => s.lines.concat(s.spacedLines))
			.flat()
			.filter(distinct);
	},
	intersections(state, getters) {
		return getters.lines
			.map(l => l.intersections)
			.flat()
			.filter(distinct)
			.filter(p => isInsideBounds(p, state.parameters.drawingSize.x, state.parameters.drawingSize.y));
	},
	constrainedElements(state, getters) {
		const points = [...getters.intersections];
		if (state.currentShapePoints.length > 2) {
			points.push(state.currentShapePoints[0]);
		}

		return getContrainedSnappingElements(
			points,
			getters.lines,
			state.currentShapePoints,
			{
				drawingSize: state.parameters.drawingSize,
				minStroke: state.parameters.minStroke,
				maxStroke: state.parameters.maxStroke,
				minAngle: state.parameters.minAngle,
				angleStep: state.parameters.angleStep
			});
	},
	canUndo(state) {
		return state.shapes.length > 0 || state.currentShapePoints.length > 0;
	},
	canRedo(state) {
		return state.redoStack.length > 0;
	},
	drawingState(state) {
		return state.interactionState === states.DRAWING;
	}
};

const createShape = function (state, points) {
	const newShape = new Shape(
		points,
		state.parameters.drawingSize.x,
		state.parameters.drawingSize.y,
		state.parameters.shapesGap);
	newShape.updateIntersections(getters.lines(state));
	return newShape;
};

const closeCurrentShape = function (state) {
	const newShape = createShape(state, state.currentShapePoints);
	state.shapes.push(newShape);
	state.currentShapePoints = [];
};

const debug = process.env.NODE_ENV !== 'production';
export default new Vuex.Store({
	strict: debug,
	state: {
		drawingId: undefined,
		interactionState: states.INIT,
		shapes: [],
		currentShapePoints: [],
		hoveredElement: undefined,
		redoStack: []
	},
	modules: {
		parameters
	},
	mutations: {
		setDrawingId(state, id) {
			state.drawingId = id;
		},
		setInteractionState(state, uiState) {
			state.interactionState = uiState;
		},
		addPoint(state, point) {
			state.currentShapePoints.push(point);
			state.redoStack = [];
		},
		validateCurrentShape(state) {
			closeCurrentShape(state);
			state.redoStack = [];
		},
		addShape(state, { points, remoteId }) {
			const newShape = createShape(state, points);
			newShape.remoteId = remoteId;
			state.shapes.push(newShape);
		},
		setHoveredElement(state, element) {
			state.hoveredElement = element;
		},

		undo(state) {
			if (state.currentShapePoints.length > 0) {
				state.redoStack.push(state.currentShapePoints.pop());
			} else if (state.shapes.length > 0) {
				const shape = state.shapes.pop();
				state.currentShapePoints = shape.points;
				shape.removeAllLinks();
				state.redoStack.push('closeShape');
			}
		},
		cancelShape(state) {
			if (state.currentShapePoints.length > 0) {
				const reversed = [...state.currentShapePoints].reverse();
				state.redoStack.push(...reversed);
				state.currentShapePoints = [];
			}
		},
		redo(state) {
			if (state.redoStack.length > 0) {
				const last = state.redoStack.pop();
				if (last instanceof Point) {
					state.currentShapePoints.push(last);
				} else if (last === 'closeShape') {
					closeCurrentShape(state);
				}
			}
		},
		reset(state) {
			state.shapes = [];
			state.currentShapePoints = [];
			state.hoveredElement = undefined;
			state.redoStack = [];
		}
	},
	getters,
	actions: {
		createNew(context, parameters) {
			context.commit('reset');
			context.commit('parameters/setDrawingProperties', parameters);
			EventBus.$emit('newDrawing');
			context.commit('setInteractionState', states.DRAWING);
		},
		recreateDrawing(context, drawing) {
			context.commit('reset');
			context.commit('parameters/setDrawingProperties', drawing.parameters);
			drawing.shapes.forEach(s => {
				context.commit('addShape', {
					points: s.points.map(p => new Intersection(p.x, p.y)),
					remoteId: s._id
				});
			});
			EventBus.$emit('newDrawing');
		}
	}
});
