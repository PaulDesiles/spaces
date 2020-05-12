import {Point} from './Point';
import {Intersection} from './Intersection';
import {equiv} from './Helpers/MathHelpers';
import {isInsideBounds, getIntersection} from './Helpers/GeometryHelpers';

let lineCount = 0;
export class Line {
	constructor(p1, p2, xmax, ymax) {
		this.intersections = [];
		this.addPoint(p1);
		this.addPoint(p2);
		this.parallels = [];
		this.linkedShapes = [];

		// The line function is (y = a * x + b)
		// with a = dx / dy
		// and b = y - a * x
		this.dx = p2.x - p1.x;
		this.dy = p2.y - p1.y;
		this.a = this.dy / this.dx;
		this.b = p1.y - (this.a * p1.x);

		this.y = x => {
			if (this.dx === 0) {
				return Infinity;
			}

			return (this.a * x) + this.b;
		};

		this.x = y => {
			if (this.dx === 0) {
				return p1.x;
			}

			if (this.dy === 0) {
				return Infinity;
			}

			return (y - this.b) / this.a;
		};

		// Pre-calc for projection
		this.squaredLength = (this.dx ** 2) + (this.dy ** 2);

		this.bounds = getLineBounds(this, xmax, ymax);

		this.id = 'L' + lineCount++;
	}

	addPoint(p) {
		if (p instanceof Intersection) {
			if (!this.intersections.includes(p)) {
				this.intersections.push(p);
			}

			if (!p.crossingLines.includes(this)) {
				p.crossingLines.push(this);
			}
		}
	}

	static linkParallelLines(l1, l2) {
		if (!l1.parallels.includes(l2)) {
			l1.parallels.push(l2);
			l2.parallels.push(l1);
		}
	}

	includes(p) {
		return this.intersections.includes(p) ||
			(this.dx !== 0 && equiv(p.y, this.y(p.x))) ||
			(this.dy !== 0 && equiv(p.x, this.x(p.y)));
	}

	// See https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
	getProjection(p) {
		const M = this.intersections[0];
		const t = (((p.x - M.x) * this.dx) + ((p.y - M.y) * this.dy)) / this.squaredLength;
		return new Point(
			M.x + (t * this.dx),
			M.y + (t * this.dy)
		);
	}

	getKnownIntersectionWith(line) {
		return this.intersections.find(i => i.crossingLines.includes(line));
	}

	getOrCreateIntersectionWith(line) {
		let M = this.getKnownIntersectionWith(line);
		if (M === undefined) {
			M = getIntersection(
				this.intersections[0],
				this.intersections[1],
				line.intersections[0],
				line.intersections[1]);

			if (M instanceof Point) {
				const I = Intersection.createFrom(M);
				this.addPoint(I);
				line.addPoint(I);
			}
		}

		return M;
	}
}

export function getLineBounds(line, xmax, ymax) {
	// Handle special cases
	if (line.dx === 0) {
		const x = line.intersections[0].x;
		return [new Point(x, 0), new Point(x, ymax)];
	}

	if (line.dy === 0) {
		const y = line.intersections[0].y;
		return [new Point(0, y), new Point(xmax, y)];
	}

	// Compute the guide's function intersections with frame borders
	const intersections = [
		new Point(0, line.y(0)), // I_xmin
		new Point(line.x(0), 0), // I_ymin
		new Point(xmax, line.y(xmax)), // I_xmax
		new Point(line.x(ymax), ymax) // I_ymax
	];

	// Line 'bounds' are the intersections that are still inside the frame
	const bounds = [];
	intersections.forEach(p => {
		if (bounds.length === 0 ||
				(bounds.length === 1 &&
					p.x !== bounds[0].x &&
					p.y !== bounds[0].y)) {
			if (isInsideBounds(p, xmax, ymax)) {
				bounds.push(p);
			}
		}
	});

	return bounds;
}
