import Vue from 'vue';
import Vuex from 'vuex';
import parameters from './parameters';

Vue.use(Vuex);

// Only first occurence of an object will be returned
function distinct(value, index, self) {
	return self.indexOf(value) === index;
}

const debug = process.env.NODE_ENV !== 'production';
export default new Vuex.Store({
	strict: debug,
	state: {
		shapes: [],
		currentShapePoints: [],
		hoveredElement: undefined
	},
	// modules: {
	// 	parameters
	// },
	mutations: {
		addShape(state, shape) {
			state.shapes.push(shape);
		},
		removeLastShape(state) {
			if (state.shapes.length > 0) {
				state.shapes.pop();
			}
		},
		emptyShapes(state) {
			state.shapes = [];
		},

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

		setHoveredElement(state, element) {
			state.hoveredElement = element;
		}
	},
	actions: {

	},
	getters: {
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
	}
});
