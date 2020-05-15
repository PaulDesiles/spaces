<template>
	<line
		:x1="p1.x"
		:y1="p1.y"
		:x2="p2.x"
		:y2="p2.y"
		:class="lineClass"
	/>
</template>

<script>
import {Point} from '../../core/Point';

export default {
	name: 'DrawingLine',
	props: {
		p1: {
			type: Object,
			default: new Point()
		},
		p2: {
			type: Object,
			default: new Point()
		},
		hovered: Boolean
	},
	computed: {
		lineClass() {
			return this.hovered ? 'hoveredLine' : '';
		}
	}
};
</script>

<style lang="scss" scoped>
@import '~@/global.scss';

line {
	stroke-width: 1;
	stroke: #0005;
}

.hoveredLine {
	stroke: $blue;
}
</style>
