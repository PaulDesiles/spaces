<template>
	<g id="DebugView">
		<line
			v-for="s in stepSegments"
			:key="s.id"
			:x1="s.A.x"
			:y1="s.A.y"
			:x2="s.B.x"
			:y2="s.B.y"
			stroke-width="4"
			stroke="#00ff0022"
		/>

		<line
			v-for="s in snappingSegments"
			:key="s.id"
			:x1="s.A.x"
			:y1="s.A.y"
			:x2="s.B.x"
			:y2="s.B.y"
			stroke-width="4"
			stroke="#ff000033"
		/>

		<circle
			v-for="p in snappingPoints"
			:key="p.id"
			:cx="p.x"
			:cy="p.y"
			r="6"
			fill="#ff000033"
		/>
	</g>
</template>

<script>
import {mapState, mapGetters} from 'vuex';

import {Point, Line} from './Geometry';
import {Segment, getStepSegments, getPolarPoint} from './Constraint';

// Only first occurence of an object will be returned
function distinct(value, index, self) {
	return self.indexOf(value) === index;
}

export default {
	name: 'DebugView',
	computed: {
		snappingPoints() {
			return this.constrainedElements.points
				.filter(p => p)
				.filter(distinct)
				.map(p => ({
					id: 'tmp' + p.id,
					x: p.x,
					y: p.y
				}));
		},
		snappingSegments() {
			return this.constrainedElements.segments.filter(s => s)
				.filter(distinct)
				.map((s, i) => {
					let id = 'tmp';
					let A = new Point();
					let B = new Point();

					if (s instanceof Line) {
						id += s.id;
						A = s.bounds[0];
						B = s.bounds[1];
					} else if (s instanceof Segment) {
						id += 'Seg' + i;
						A = s.A;
						B = s.B;
					}

					return {id, A, B};
				});
		},
		stepSegments() {
			if (this.currentShapePoints.length > 0) {
				const lastPoints = this.currentShapePoints.slice(-2).reverse();
				let lastAngle;
				if (this.minAngle > 0 && lastPoints.length > 1) {
					lastAngle = Math.atan2(
						lastPoints[1].y - lastPoints[0].y,
						lastPoints[1].x - lastPoints[0].x);
				}

				if (this.angleStep > 0) {
					return getStepSegments(
						lastPoints,
						lastAngle,
						{
							drawingSize: this.drawingSize,
							minStroke: this.minStroke,
							maxStroke: this.maxStroke,
							minAngle: this.minAngle,
							angleStep: this.angleStep
						})
						.map((s, i) => ({
							id: 'Seg' + i,
							A: s.A,
							B: s.B
						}));
				} else {
					const lowerAngleSegment =
						new Segment(
							lastPoints[0],
							getPolarPoint(
								lastAngle - this.minAngle,
								this.maxStroke,
								lastPoints[0])
						);

					const upperAngleSegment =
						new Segment(
							lastPoints[0],
							getPolarPoint(
								lastAngle + this.minAngle,
								this.maxStroke,
								lastPoints[0])
						);

					return [lowerAngleSegment, upperAngleSegment];
				}
			}

			return [];
		},
		...mapState(['currentShapePoints']),
		...mapState('parameters', [
			'drawingSize',
			'minStroke',
			'maxStroke',
			'minAngle',
			'angleStep'
		]),
		...mapGetters(['constrainedElements'])
	}
};
</script>
