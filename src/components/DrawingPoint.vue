<template>
	<circle
		:cx="point.x"
		:cy="point.y"
		:r="size"
		:stroke="strokeColor"
		stroke-width="1"
		:fill="fillColor"
	/>
</template>

<script>
import {PointType, Point} from './Geometry.js';

const blue = '#318be7';
const grey = '#aaa';
const transp = 'transparent';
class PointTypeProperties {
	constructor(size, color, filled, sizeOnHover, colorOnHover) {
		this.size = size;
		this.stroke = filled ? transp : color;
		this.fill = filled ? color : transp;

		this.sizeOnHover = sizeOnHover || size;
		this.strokeOnHover = filled ? transp : (colorOnHover || color);
		this.fillOnHover = filled ? (colorOnHover || color) : transp;
	}
}

const props = new Map();
props.set(PointType.cursor, new PointTypeProperties(5, blue, false));
props.set(PointType.startPoint, new PointTypeProperties(5, blue, true, 7, blue + '99'));
props.set(PointType.guide, new PointTypeProperties(3, grey, true, 3, transp));

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
			if (this.hovered) {
				return props.get(this.type).sizeOnHover;
			}

			return props.get(this.type).size;
		},
		strokeColor() {
			if (this.hovered) {
				return props.get(this.type).strokeOnHover;
			}

			return props.get(this.type).stroke;
		},
		fillColor() {
			if (this.hovered) {
				return props.get(this.type).fillOnHover;
			}

			return props.get(this.type).fill;
		}
	}
};
</script>
