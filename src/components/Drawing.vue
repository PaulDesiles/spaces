<template>
	<SvgViewport>
		<g @click="clic($event)">
			<rect
				x="0"
				y="0"
				:width="xmax"
				:height="ymax"
				fill="white"
				border="#000"
				border-width="1"
			/>

			<line
				v-for="guide in projectedGuides"
				:key="guide.id"
				:x1="guide.x1"
				:y1="guide.y1"
				:x2="guide.x2"
				:y2="guide.y2"
				stroke-width="1"
				:stroke="guide.color"
			/>

			<path
				v-for="shape in shapes"
				:key="shape.id"
				:d="getPath(shape.points, true)"
				stroke-width="0"
				fill="black"
			/>

			<Anchor
				v-for="p in visibleGuidesPoints"
				:key="p.id"
				:point="p"
				:type="3"
			/>
		</g>
	</SvgViewport>
</template>

<script>
import SvgViewport from './SvgViewport.vue';
import Anchor from './Anchor.vue';
import {Point, Shape} from './Geometry.js';

// Only first occurence of an object will be returned
function distinct(value, index, self) {
	return self.indexOf(value) === index;
}

export default {
	name: 'Drawing',
	components: {
		SvgViewport,
		Anchor
	},
	data() {
		return {
			xmax: 1000,
			ymax: 600,
			shapes: []
		};
	},
	computed: {
		guides() {
			return this.shapes
				.map(s => s.lines.concat(s.spacedLines))
				.flat()
				.filter(distinct);
		},
		projectedGuides() {
			return this.guides.map(g => {
				// Compute the guide's function intersections with frame borders
				const intersections = [
					{x: 0, y: g.y(0)}, // I_xmin
					{x: g.x(0), y: 0}, // I_ymin
					{x: this.xmax, y: g.y(this.xmax)}, // I_xmax
					{x: g.x(this.ymax), y: this.ymax} // I_ymax
				];

				// Line 'bounds' are the intersections that are still inside the frame
				const lineBounds = [];
				intersections.forEach(p => {
					if (lineBounds.length < 2 &&
						p.x >= 0 &&
						p.x <= this.xmax &&
						p.y >= 0 &&
						p.y <= this.ymax)
					{
						lineBounds.push(p);
					}
				});

				return {
					id: g.id,
					x1: lineBounds[0].x,
					y1: lineBounds[0].y,
					x2: lineBounds[1].x,
					y2: lineBounds[1].y,
					color: (g.isMouseOver ? '#318be7' : '#aaa')
				};
			});
		},
		visibleGuidesPoints() {
			return this.guides
				.map(g => g.intersections)
				.flat()
				.filter(distinct);
		}
	},
	methods: {
		getPath(shape, closeShape) {
			let path = '';
			shape.forEach((s, i) => {
				path += (i === 0 ? 'M' : 'L');
				path += s.x + ' ' + s.y + ' ';
			});
			if (closeShape) {
				path += 'Z';
			}

			return path;
		},
		move(event) {
		},
		clic(event) {
			this.shapes = [];

			const s0 = new Shape([
				new Point(150, 150),
				new Point(180, 130),
				new Point(160, 180)
			]);

			this.shapes.push(s0);

			const s1 = new Shape([
				s0.spacedLines[0].intersections[0],
				s0.spacedLines[0].intersections[1],
				new Point(200, 200)
			]);

			this.shapes.push(s1);

			const s2 = new Shape([
				s1.spacedLines[1].intersections[1],
				new Point(s1.spacedLines[1].x(170), 170),
				new Point(300, 180)
			]);

			this.shapes.push(s2);

			// Check points duplicates
			this.visibleGuidesPoints.forEach((p1, i) => {
				this.visibleGuidesPoints
					.slice(i + 1)
					.forEach(p2 => {
						if (p1.x === p2.x && p1.y === p2.y) {
							console.log(`${p1.id} <=> ${p2.id} : ${p2}`);
						}
					});
			});

			// Check lines duplicates
			this.guides.forEach((l1, i) => {
				this.guides
					.slice(i + 1)
					.forEach(l2 => {
						if (Math.abs(l1.a - l2.a) < 0.01 && Math.abs(l1.b - l2.b) < 0.01) {
							console.log(`${l1.id} <=> ${l2.id}`);
						}
					});
			});
		},
		cancel() {
		}
	}
};
</script>

<style>
body { margin: 0px; }
html, body, #app, #container {
	width:100%;
	height:100%;
}
</style>
