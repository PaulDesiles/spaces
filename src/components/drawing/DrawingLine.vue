<template>
	<line
		:x1="p1.x"
		:y1="p1.y"
		:x2="p2.x"
		:y2="p2.y"
		stroke-width="1"
		:stroke="strokeColor"
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
		strokeColor() {
			return this.hovered ? '#318be7' : '#0005';
		}
	}
};
</script>
