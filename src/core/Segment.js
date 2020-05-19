import {Point} from './Point';
import {LineBase} from './LineBase';
import {equiv} from './Helpers/MathHelpers';
import {isInsideBounds} from './Helpers/GeometryHelpers';

export class Segment extends LineBase {
	constructor(A, B, associatedLine) {
		super(A, B);

		this.associatedLine = associatedLine;
	}

	includes(p) {
		const crossproduct = ((p.y - this.A.y) * this.dx) - ((p.x - this.A.x) * this.dy);
		return equiv(Math.abs(crossproduct), 0) &&
			p.x >= Math.min(this.A.x, this.B.x) &&
			p.x <= Math.max(this.A.x, this.B.x) &&
			p.y >= Math.min(this.A.y, this.B.y) &&
			p.y <= Math.max(this.A.y, this.B.y);
	}

	getProjection(p) {
		const t = this.getProjectionParametricCoordinate(p);

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

	constrainToBounds(xmax, ymax) {
		const outPoints = [];
		if (!isInsideBounds(this.A, xmax, ymax)) {
			outPoints.push(this.A);
		}

		if (!isInsideBounds(this.B, xmax, ymax)) {
			outPoints.push(this.B);
		}

		if (outPoints.length > 0) {
			const bounds = this.getLineBounds(xmax, ymax);

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

			this.onCoordinatesChanged();
		}
	}
}
