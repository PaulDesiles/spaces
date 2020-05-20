import Vue from 'vue';
import Vuex from 'vuex';
import parameters from './parameters';
import {Shape} from '../core/Shape';
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

const closeCurrentShape = function (state) {
	const newShape = new Shape(
		state.currentShapePoints,
		state.parameters.drawingSize.x,
		state.parameters.drawingSize.y,
		state.parameters.formsGap);
	newShape.updateIntersections(getters.lines(state));
	state.currentShapePoints = [];
	state.shapes.push(newShape);
};

const debug = process.env.NODE_ENV !== 'production';
export default new Vuex.Store({
	strict: debug,
	state: {
		interactionState: states.TUTORIAL,
		shapes: [],
		currentShapePoints: [],
		hoveredElement: undefined,
		redoStack: []
	},
	modules: {
		parameters
	},
	mutations: {
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
		newDrawing(state, parameters) {
			state.shapes = [];
			state.currentShapePoints = [];
			state.hoveredElement = undefined;
			state.redoStack = [];

			state.parameters.drawingSize.x = parameters.width;
			state.parameters.drawingSize.y = parameters.height;
			state.parameters.formsGap = parameters.gap;

			state.interactionState = states.DRAWING;
		}
	},
	getters
});
