<template>
	<div id="debugPanel">
		<p>mouse	: {{ display(mouse) }}</p>
		<p>cursor	: {{ display(cursor) }}</p>
		<p>hovered	: {{ hoveredInfos }}</p>
	</div>
</template>

<script>
import {Point, Intersection, Line} from './Geometry2.js';

export default {
	name: 'DebugInfo',
	props: {
		mouse: {
			type: Object,
			default: new Point()
		},
		cursor: {
			type: Object,
			default: new Point()
		},
		hovered: {
			type: Object,
			default: undefined
		}
	},
	computed: {
		hoveredInfos() {
			if (this.hovered instanceof Intersection) {
				return this.hovered.id +
					' > ' +
					this.hovered.crossingLines.reduce(
						(a, current) => {
							let concat = a;
							if (concat !== '') {
								concat += ', ';
							}

							concat += current.id;
							return concat;
						},
						''
					);
			}

			if (this.hovered instanceof Line) {
				return this.hovered.id;
			}

			return '-';
		}
	},
	methods: {
		round(x) {
			return Math.round(x * 100) / 100;
		},
		display(p) {
			return `(${this.round(p.x)},	${this.round(p.y)})`;
		},
	}
};
</script>

<style scoped>
#debugPanel {
	position: absolute;
	top: 5px;
	left: 5px;
	background: #33333366;
	padding: 7px 10px;
	border-radius: 5px;
	min-width: 180px;
}

p {
	margin: 2px;
	font-size: 10pt;
	font-family: Arial, Helvetica;
}
</style>
