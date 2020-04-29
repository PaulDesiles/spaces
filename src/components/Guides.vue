<template>
	<g>
		<DrawingLine
			v-for="line in lines"
			:key="line.id"
			:p1="line.bounds[0]"
			:p2="line.bounds[1]"
			:hovered="amIHovered(line)"
		/>
		<DrawingPoint
			v-for="p in intersections"
			:key="p.id"
			:point="p"
			:type="3"
			:hovered="amIHovered(p)"
		/>
	</g>
</template>

<script>
import {mapState, mapGetters} from 'vuex';

import DrawingPoint from './DrawingPoint.vue';
import DrawingLine from './DrawingLine.vue';
import {Intersection, Line} from './Geometry';

export default {
	name: 'Guides',
	components: {
		DrawingPoint,
		DrawingLine
	},
	computed: {
		...mapState([
			'hoveredElement'
		]),
		...mapGetters([
			'lines',
			'intersections'
		])
	},
	methods: {
		amIHovered(myModel) {
			return this.hoveredElement === myModel ||
				(this.hoveredElement instanceof Intersection &&
					myModel instanceof Line &&
					this.hoveredElement.crossingLines.includes(myModel));
		}
	}
};
</script>
