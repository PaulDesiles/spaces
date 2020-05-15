<template>
	<circle
		:cx="point.x"
		:cy="point.y"
		:r="size"
		:class="circleClass"
	/>
</template>

<script>
import {Point} from '../../core/Point';

const PointType = {
	cursor: 1,
	startPoint: 2,
	guide: 3
};
Object.freeze(PointType);

function getClass(type) {
	switch (type) {
		case 1: return 'cursor';
		case 2: return 'startPoint';
		case 3: return 'guide';
		default: return '';
	}
}

export default {
	name: 'DrawingPoint',
	props: {
		point: {
			type: Object,
			default: new Point()
		},
		type: {
			type: Number,
			default: PointType.guide
		},
		hovered: Boolean
	},
	computed: {
		size() {
			switch (this.type) {
				case 1: return 5;
				case 2: return this.hovered ? 7 : 5;
				case 3: return 3;
				default: return 0;
			}
		},
		circleClass() {
			return getClass(this.type) + (this.hovered ? 'Hovered' : '');
		}
	}
};
</script>

<style lang="scss" scoped>
@import '~@/global.scss';

$gray: #aaa;

circle {
	stroke-width: 1;
}

.cursor {
	stroke: $blue;
	fill: transparent;
}

.startPoint {
	stroke: $blue;
	fill: $blue;

	&Hovered {
		fill: $tranparent-blue;
	}
}

.guide {
	stroke: $gray;
	fill: $gray;

	&Hovered {
		fill: transparent;
	}
}

</style>
