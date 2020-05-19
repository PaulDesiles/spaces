import {Point} from './Point';
import {equiv} from './Helpers/MathHelpers';
import {isInsideBounds} from './Helpers/GeometryHelpers';
import {lazyInit} from './Helpers/LazyInit';

export class LineBase {
	constructor(p1, p2) {
		this.A = p1;
		this.B = p2;
		this.onCoordinatesChanged();
	}

	onCoordinatesChanged() {
		// The line function is (y = ax + b)
		lazyInit(this, {
			dx: () => this.B.x - this.A.x,
			dy: () => this.B.y - this.A.y,
			a: () => this.dy / this.dx,
			b: () => this.A.y - (this.a * this.A.x),
			squaredLength: () => (this.dx ** 2) + (this.dy ** 2)
		});
	}

	y(x) {
		if (this.dx === 0) {
			return Infinity;
		}

		return (this.a * x) + this.b;
	}

	x(y) {
		if (this.dx === 0) {
			return this.A.x;
		}

		if (this.dy === 0) {
			return Infinity;
		}

		return (y - this.b) / this.a;
	}

	includes(p) {
		return (this.dx !== 0 && equiv(p.y, this.y(p.x))) ||
			(this.dy !== 0 && equiv(p.x, this.x(p.y)));
	}

	// See https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
	getProjection(p) {
		const t = this.getProjectionParametricCoordinate(p);
		return new Point(
			this.A.x + (t * this.dx),
			this.A.y + (t * this.dy)
		);
	}

	getProjectionParametricCoordinate(p) {
		return (((p.x - this.A.x) * this.dx) + ((p.y - this.A.y) * this.dy)) / this.squaredLength;
	}

	getLineBounds(xmax, ymax) {
		// Handle special cases
		if (this.dx === 0) {
			return [new Point(this.A.x, 0), new Point(this.A.x, ymax)];
		}

		if (this.dy === 0) {
			return [new Point(0, this.A.y), new Point(xmax, this.A.y)];
		}

		// Compute the guide's function intersections with frame borders
		const intersections = [
			new Point(0, this.y(0)), // I_xmin
			new Point(this.x(0), 0), // I_ymin
			new Point(xmax, this.y(xmax)), // I_xmax
			new Point(this.x(ymax), ymax) // I_ymax
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
}
