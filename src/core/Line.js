import {Point} from './Point';
import {Intersection} from './Intersection';
import {LineBase} from './LineBase';
import {getIntersection} from './Helpers/GeometryHelpers';

let lineCount = 0;
export class Line extends LineBase {
	constructor(p1, p2, xmax, ymax) {
		super(p1, p2);

		this.intersections = [];
		this.addPoint(p1);
		this.addPoint(p2);
		this.parallels = [];
		this.linkedShapes = [];

		this.updateLineBounds(xmax, ymax);

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
		return this.intersections.includes(p) || super.includes(p);
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

	updateLineBounds(xmax, ymax) {
		this.bounds = this.getLineBounds(xmax, ymax);
	}
}
