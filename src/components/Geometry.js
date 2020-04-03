import {Point} from './GeometryHelpers.js';
export {Point};
import * as Helper from './GeometryHelpers.js';

const formsGap = 10;

export const PointType = {
	cursor: 1,
	startPoint: 2,
	guide: 3
};
Object.freeze(PointType);

let xmax;
let ymax;
export function initBounds(width, height) {
	xmax = width;
	ymax = height;
}

let intersectionCount = 0;
export class Intersection extends Point {
	constructor(x, y) {
		super(x, y);
		this.crossingLines = [];
		this.insideBounds = (x >= 0 && x <= xmax && y >= 0 && y <= ymax);
		this.id = 'P' + intersectionCount++;
	}

	static createFrom(point) {
		return new Intersection(point.x, point.y);
	}
}

let lineCount = 0;
export class Line {
	constructor(p1, p2) {
		this.intersections = [];
		this.addPoint(p1);
		this.addPoint(p2);
		this.parallels = [];

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
		this.squaredLength = (this.dx * this.dx) + (this.dy * this.dy);

		this.bounds = getLineBounds(this);

		this.id = 'L' + lineCount++;
	}

	addPoint(p) {
		if (!this.intersections.includes(p)) {
			this.intersections.push(p);
		}

		if (!p.crossingLines.includes(this)) {
			p.crossingLines.push(this);
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
			(this.dx !== 0 && Helper.equiv(p.y, this.y(p.x))) ||
			(this.dy !== 0 && Helper.equiv(p.x, this.x(p.y)));
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
			M = Intersection.createFrom(
				Helper.getIntersection(
					this.intersections[0],
					this.intersections[1],
					line.intersections[0],
					line.intersections[1]));

			this.addPoint(M);
			line.addPoint(M);
		}

		return M;
	}
}

let shapeCount = 0;
export class Shape {
	constructor(points) {
		this.points = points;
		if (!Helper.isFormClockwiseOriented(this.points)) {
			this.points = this.points.reverse();
		}

		const lineMap = new Map(Helper.mapConsecutive(this.points, (A, B) => {
			let line = A.crossingLines.find(l => l.includes(B));

			if (line === undefined) {
				line = B.crossingLines.find(l => l.includes(A));
			}

			if (line === undefined) {
				line = new Line(A, B);
			} else {
				line.addPoint(A);
				line.addPoint(B);
			}

			return [A, line];
		}));

		this.lines = Array.from(lineMap.values());
		this.spacedLines = [];

		const createParallelLines = (A, B, C, D) => {
			const AB = lineMap.get(A);
			const BC = lineMap.get(B);
			const CD = lineMap.get(C);

			let parallelLine;
			let B2;
			let C2;
			let Btemp;
			let Ctemp;

			// Retrieve previously created line and points
			if (BC.parallels.length > 0) {
				parallelLine = BC.parallels[0]; // TODO: correct this wrong assumption !

				B2 = parallelLine.getKnownIntersectionWith(AB);
				C2 = parallelLine.getKnownIntersectionWith(CD);

				if (B2 === undefined) {
					Btemp = parallelLine.intersections.find(i => i !== C2);
				} else {
					Btemp = B2;
				}

				if (C2 === undefined) {
					Ctemp = parallelLine.intersections.find(i => i !== B2 && i !== Btemp);
				} else {
					Ctemp = C2;
				}
			}

			if (B2 === undefined || C2 === undefined) {
				if (Btemp === undefined || Ctemp === undefined) {
					const movedBC = Helper.moveSegmentOutside(B, C, formsGap);
					Btemp = Btemp || movedBC.A2;
					Ctemp = Ctemp || movedBC.B2;
				}

				// Get intersections with the form's previous and next segment
				// to keep points that have more interest
				if (B2 === undefined) {
					B2 = Intersection.createFrom(Helper.getIntersection(A, B, Btemp, Ctemp));
				}

				if (C2 === undefined) {
					C2 = Intersection.createFrom(Helper.getIntersection(Btemp, Ctemp, C, D));
				}
			}

			if (parallelLine === undefined) {
				parallelLine = new Line(B2, C2);
			} else {
				parallelLine.addPoint(B2);
				parallelLine.addPoint(C2);
			}

			AB.addPoint(B2);
			CD.addPoint(C2);

			Line.linkParallelLines(BC, parallelLine);
			this.spacedLines.push(parallelLine);
		};

		Helper.forEachConsecutive(this.points, createParallelLines, -1);

		Helper.forEachConsecutive(this.spacedLines, (l1, l2) => {
			l1.getOrCreateIntersectionWith(l2);
		});

		this.id = 'S' + shapeCount++;
	}

	updateIntersections(lines) {
		const newLines = this.lines.concat(this.spacedLines);
		lines.forEach(line => {
			newLines.forEach(newLine => {
				line.getOrCreateIntersectionWith(newLine);
			});
		});
	}
}

function getLineBounds(line) {
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
		if ((bounds.length === 0 ||
				(bounds.length === 1 &&
				p.x !== bounds[0].x &&
				p.y !== bounds[0].y)) &&
			p.x >= 0 &&
			p.x <= xmax &&
			p.y >= 0 &&
			p.y <= ymax)
		{
			bounds.push(p);
		}
	});

	return bounds;
}
