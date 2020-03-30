const formsGap = 10;
export const AnchorType = {
	cursor: 1,
	startPoint: 2,
	guide: 3
};
Object.freeze(AnchorType);

// **************
// *** Models ***
// **************

export class Point {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	toString() {
		return `(${round(this.x)}, ${round(this.y)})`;
	}
}

let intersectionCount = 0;
export class Intersection extends Point {
	constructor(x, y) {
		super(x, y);
		this.crossingLines = [];
		this.id = 'i' + intersectionCount++;
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
		const a = this.dy / this.dx;
		const b = p1.y - (a * p1.x);
		this.y = x => (a * x) + b;
		this.x = y => (y - b) / a;
		this.a = a;
		this.b = b;

		this.id = 'l' + lineCount++;
	}

	addPoint(p) {
		if (!this.intersections.includes(p)) {
			this.intersections.push(p);
		}

		if (!p.crossingLines.includes(this)) {
			p.crossingLines.push(this);
		}
	}

	includes(p) {
		return this.intersections.includes(p) || p.y === this.y(p.x);
	}

	static linkParallelLines(l1, l2) {
		if (!l1.parallels.includes(l2)) {
			l1.parallels.push(l2);
			l2.parallels.push(l1);
		}
	}
}

let shapeCount = 0;
export class Shape {
	constructor(points) {
		this.points = points.map(p => {
			if (p instanceof Intersection) {
				return p;
			}

			return new Intersection(p.x, p.y);
		});
		if (!isFormClockwiseOriented(this.points)) {
			this.points = this.points.reverse();
		}

		const lineMap = new Map(mapConsecutive(this.points, (A, B) => {
			let line = A.crossingLines.find(l => l.includes(B));
			if (line === undefined) {
				line = new Line(A, B);
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

				B2 = parallelLine.intersections.find(i => i.crossingLines.includes(AB));
				C2 = parallelLine.intersections.find(i => i.crossingLines.includes(CD));

				if (B2 === undefined) {
					Btemp = parallelLine.intersections.find(i => i !== C2);
				}

				if (C2 === undefined) {
					Ctemp = parallelLine.intersections.find(i => i !== B2 && i !== Btemp);
				}
			}

			if (B2 === undefined || C2 === undefined) {
				if (Btemp === undefined || Ctemp === undefined) {
					const movedBC = moveSegmentOutside(B, C, formsGap);
					Btemp = movedBC.A2;
					Ctemp = movedBC.B2;
				}

				// Get intersections with the form's previous and next segment
				// to keep points that have more interest
				B2 = Intersection.createFrom(getIntersection(A, B, Btemp, Ctemp));
				C2 = Intersection.createFrom(getIntersection(Btemp, Ctemp, C, D));

				if (parallelLine === undefined) {
					parallelLine = new Line(B2, C2);
				} else {
					parallelLine.addPoint(B2);
					parallelLine.addPoint(C2);
				}
			}

			AB.addPoint(B2);
			CD.addPoint(C2);

			Line.linkParallelLines(BC, parallelLine);
			this.spacedLines.push(parallelLine);
		});

		forEachConsecutive(this.spacedLines, (l1, l2) => {
			const M = Intersection.createFrom(
				getIntersection(
					l1.intersections[0],
					l1.intersections[1],
					l2.intersections[0],
					l2.intersections[1]));

			l1.intersections.push(M);
			l2.intersections.push(M);
		});

		this.id = 's' + shapeCount++;
	}
}

// ***************************************
// *** Utility and Calculation Methods ***
// ***************************************

function round(x) {
	return Math.round(x * 100) / 100;
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

function getSquaredDistanceBetweenPoints(A, B) {
	const dx = B.x - A.x;
	const dy = B.y - A.y;
	return (dx * dx) + (dy * dy);
}

function getDistanceBetweenPoints(A, B) {
	return Math.sqrt(getSquaredDistanceBetweenPoints(A, B));
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
