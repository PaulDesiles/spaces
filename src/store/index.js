import Vue from 'vue';
import Vuex from 'vuex';
import parameters from './parameters';
import {Shape} from '../components/Geometry';

Vue.use(Vuex);

// Only first occurence of an object will be returned
function distinct(value, index, self) {
	return self.indexOf(value) === index;
}

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
			.filter(p => p.insideBounds);
	}
};

const debug = process.env.NODE_ENV !== 'production';
export default new Vuex.Store({
	strict: debug,
	state: {
		shapes: [],
		currentShapePoints: [],
		hoveredElement: undefined
	},
	modules: {
		parameters
	},
	mutations: {
		addPoint(state, point) {
			state.currentShapePoints.push(point);
		},
		removeLastPoint(state) {
			if (state.currentShapePoints.length > 0) {
				state.currentShapePoints.pop();
			}
		},
		emptyCurrentShape(state) {
			state.currentShapePoints = [];
		},

		validateCurrentShape(state) {
			const newShape = new Shape(state.currentShapePoints);
			newShape.updateIntersections(getters.lines(state));
			state.currentShapePoints = [];
			state.shapes.push(newShape);
		},
		removeLastShape(state) {
			if (state.shapes.length > 0) {
				state.shapes.pop();
			}
		},
		emptyShapes(state) {
			state.shapes = [];
		},

		setHoveredElement(state, element) {
			state.hoveredElement = element;
		}
	},
	actions: {

	},
	getters
});
