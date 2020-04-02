const formsGap = 10;
const epsylon = 0.001;

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

// **************
// *** Models ***
// **************

export class Point {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	getSquaredDistanceTo(p) {
		const dx = p.x - this.x;
		const dy = p.y - this.y;
		return (dx * dx) + (dy * dy);
	}
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
		this.y = x => (this.a * x) + this.b;
		this.x = y => (y - this.b) / this.a;

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
		return this.intersections.includes(p) || equiv(p.y, this.y(p.x));
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
		if (this.getKnownIntersectionWith(line) === undefined) {
			const M = Intersection.createFrom(
				getIntersection(
					this.intersections[0],
					this.intersections[1],
					line.intersections[0],
					line.intersections[1]));

			this.addPoint(M);
			line.addPoint(M);
		}
	}
}

let shapeCount = 0;
export class Shape {
	constructor(points) {
		this.points = points;
		if (!isFormClockwiseOriented(this.points)) {
			this.points = this.points.reverse();
		}

		const lineMap = new Map(mapConsecutive(this.points, (A, B) => {
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

		forEachConsecutive(this.points, (A, B, C, D) => {
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
					const movedBC = moveSegmentOutside(B, C, formsGap);
					Btemp = Btemp || movedBC.A2;
					Ctemp = Ctemp || movedBC.B2;
				}

				// Get intersections with the form's previous and next segment
				// to keep points that have more interest
				if (B2 === undefined) {
					B2 = Intersection.createFrom(getIntersection(A, B, Btemp, Ctemp));
				}

				if (C2 === undefined) {
					C2 = Intersection.createFrom(getIntersection(Btemp, Ctemp, C, D));
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
		});

		forEachConsecutive(this.spacedLines, (l1, l2) => {
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

// ***************************************
// *** Utility and Calculation Methods ***
// ***************************************

export function equiv(x, y) {
	return Math.abs(x - y) < epsylon;
}

// Loop over array to find its i-th element
function loopedGet(array, i) {
	return array[i % array.length];
}

// Call a function to consecutive elements of an array (looping)
function forEachConsecutive(array, callback) {
	const l = array.length;
	const nbArguments = callback.length;
	for (let i = 0; i !== l; ++i) {
		const parameters = [];
		for (let j = 0; j !== nbArguments; j++) {
			parameters.push(array[(i + j) % l]);
		}

		callback(...parameters);
	}
}

// Apply a transformation function to consecutive elements of an array (looping)
function mapConsecutive(array, transformator) {
	const transformed = [];
	const l = array.length;
	const nbArguments = transformator.length;
	for (let i = 0; i !== l; ++i) {
		const parameters = [];
		for (let j = 0; j !== nbArguments; j++) {
			parameters.push(array[(i + j) % l]);
		}

		transformed.push(transformator(...parameters));
	}

	return transformed;
}

// To know which side of an edge is inside the form
// > the right side of an edge (points[i], points[i+1]) will be inside if clockwise is true
// Sum over the edges, (x2-x1)(y2+y1)
// http://en.wikipedia.org/wiki/Shoelace_formula
// http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order/1165943#1165943
function isFormClockwiseOriented(points) {
	let i;
	let sum = 0;
	for (i = 0; i < points.length - 1; i++) {
		sum += (points[i + 1].x - points[i].x) * (points[i + 1].y + points[i].y);
	}

	sum += (points[0].x - points[i].x) * (points[0].y + points[i].y);

	return sum <= 0;
}

function moveSegmentOutside(A, B, distance) {
	let dx = B.x - A.x;
	const dy = B.y - A.y;

	if (dx === 0) {
		dx = 0.01;
	}

	const x = -1 * dy / dx;
	let sizeFactor = distance / Math.sqrt((x * x) + 1);

	if (dx > 0) { // Or dx < 0 if not clockwise
		sizeFactor *= -1;
	}

	return {
		A2: new Point((sizeFactor * x) + A.x, sizeFactor + A.y),
		B2: new Point((sizeFactor * x) + B.x, sizeFactor + B.y)
	};
}

function getIntersection(A, B, C, D) {
	const dx = B.x - A.x;
	const dy = B.y - A.y;
	const a =
		(((D.y - C.y) * (A.x - C.x)) - ((D.x - C.x) * (A.y - C.y))) /
		(((D.x - C.x) * dy) - ((D.y - C.y) * dx));
	return new Point(A.x + (dx * a), A.y + (dy * a));
}

function getLineBounds(line) {
	// Compute the guide's function intersections with frame borders
	const intersections = [
		{x: 0, y: line.y(0)}, // I_xmin
		{x: line.x(0), y: 0}, // I_ymin
		{x: xmax, y: line.y(xmax)}, // I_xmax
		{x: line.x(ymax), y: ymax} // I_ymax
	];

	// Line 'bounds' are the intersections that are still inside the frame
	const lineBounds = [];
	intersections.forEach(p => {
		if (lineBounds.length < 2 &&
			p.x >= 0 &&
			p.x <= xmax &&
			p.y >= 0 &&
			p.y <= ymax)
		{
			lineBounds.push(p);
		}
	});

	return lineBounds;
}
