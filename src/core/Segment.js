import {Point} from './Point';
import {getLineBounds} from './Line';
import {equiv} from './Helpers/MathHelpers';
import {isInsideBounds} from './Helpers/GeometryHelpers';

// Not linked to Line YET on purpose
// so as to keep its possibilities to minimum
export class Segment {
	constructor(A, B, associatedLine) {
		this.A = A;
		this.B = B;
		this.associatedLine = associatedLine;
		this.intersections = [A, B]; //to use getLineBounds...
		this.initialize();
	}

	initialize() {
		this.dx = this.B.x - this.A.x;
		this.dy = this.B.y - this.A.y;
		this.a = this.dy / this.dx;
		this.b = this.A.y - (this.a * this.A.x);

		this.y = x => {
			if (this.dx === 0) {
				return Infinity;
			}

			return (this.a * x) + this.b;
		};

		this.x = y => {
			if (this.dx === 0) {
				return this.A.x;
			}

			if (this.dy === 0) {
				return Infinity;
			}

			return (y - this.b) / this.a;
		};

		// Pre-calc for projection
		this.squaredLength = (this.dx ** 2) + (this.dy ** 2);
	}

	contains(p) {
		const crossproduct = ((p.y - this.A.y) * this.dx) - ((p.x - this.A.x) * this.dy);
		return equiv(Math.abs(crossproduct), 0) &&
			p.x >= Math.min(this.A.x, this.B.x) &&
			p.x <= Math.max(this.A.x, this.B.x) &&
			p.y >= Math.min(this.A.y, this.B.y) &&
			p.y <= Math.max(this.A.y, this.B.y);
	}

	// See https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
	getProjection(p) {
		const t = (((p.x - this.A.x) * this.dx) + ((p.y - this.A.y) * this.dy)) / this.squaredLength;
		if (t <= 0) {
			return this.A;
		}

		if (t >= 1) {
			return this.B;
		}

		return new Point(
			this.A.x + (t * this.dx),
			this.A.y + (t * this.dy)
		);
	}
}

export function constrainSegmentToBounds(s, xmax, ymax) {
	const outPoints = [];
	if (!isInsideBounds(s.A, xmax, ymax)) {
		outPoints.push(s.A);
	}

	if (!isInsideBounds(s.B, xmax, ymax)) {
		outPoints.push(s.B);
	}

	if (outPoints.length > 0) {
		const bounds = getLineBounds(s, xmax, ymax);

		outPoints.forEach(p => {
			let bound;
			if (bounds.length !== 2) {
				bound = {x: 0, y: 0};
			} else if (p.getSquaredDistanceTo(bounds[0]) < p.getSquaredDistanceTo(bounds[1])) {
				bound = bounds[0];
			} else {
				bound = bounds[1];
			}

			p.x = bound.x;
			p.y = bound.y;
		});

		s.initialize();
	}
}
