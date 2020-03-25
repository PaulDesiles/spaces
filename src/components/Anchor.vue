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
import {AnchorType, Point} from './Geometry.js';

const blue = '#318be7';
const grey = '#aaa';
const transp = 'transparent';
class AnchorTypeProperties {
	constructor(size, color, plain, sizeOnHover, colorOnHover) {
		this.size = size;
		this.stroke = plain ? transp : color;
		this.fill = plain ? color : transp;

		this.sizeOnHover = sizeOnHover || size;
		this.strokeOnHover = plain ? transp : (colorOnHover || color);
		this.fillOnHover = plain ? (colorOnHover || color) : transp;
	}
}

const props = new Map();
props.set(AnchorType.cursor, new AnchorTypeProperties(5, blue, false));
props.set(AnchorType.startPoint, new AnchorTypeProperties(5, blue, true, 7));
props.set(AnchorType.guide, new AnchorTypeProperties(3, grey, true, 3, transp));

export default {
	name: 'Anchor',
	props: {
		point: {
			type: Object,
			default: new Point()
		},
		type: {
			type: Number,
			default: AnchorType.guide
		}
	},
	computed: {
		size() {
			if (this.point.isMouseOver) {
				return props.get(this.type).sizeOnHover;
			}

			return props.get(this.type).size;
		},
		strokeColor() {
			if (this.point.isMouseOver) {
				return props.get(this.type).strokeOnHover;
			}

			return props.get(this.type).stroke;
		},
		fillColor() {
			if (this.point.isMouseOver) {
				return props.get(this.type).fillOnHover;
			}

			return props.get(this.type).fill;
		}
	}
};
</script>
