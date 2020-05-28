export default {
	namespaced: true,
	state: {
		drawingSize: {x: 1000, y: 600},
		shapesGap: 10,
		snapThreshold: 20,
		minStroke: 0,
		maxStroke: 1000,
		minAngle: 10 * Math.PI / 180,
		selectedAngleStep: 10 * Math.PI / 180,
		angleStep: 0
	},
	mutations: {
		setMinStroke(state, value) {
			state.minStroke = value;
		},
		setMaxStroke(state, value) {
			state.maxStroke = value;
		},
		setMinAngle(state, value) {
			state.minAngle = value;
		},
		setSelectedAngleStep(state, value) {
			state.selectedAngleStep = value;
		},
		toggleAngleSteps(state, value) {
			const newValue = value ? state.selectedAngleStep : 0;
			if (state.angleStep !== newValue) {
				state.angleStep = newValue;
			}
		},
		setDrawingProperties(state, properties) {
			state.drawingSize.x = properties.width;
			state.drawingSize.y = properties.height;
			state.shapesGap = properties.gap;
		}
	}
};
