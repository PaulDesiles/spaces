const epsylon = 0.001;

export class Point {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	getSquaredDistanceTo(p) {
		const dx = p.x - this.x;
		const dy = p.y - this.y;
		return (dx ** 2) + (dy ** 2);
	}

	equiv(p) {
		return equiv(this.x, p.x) && equiv(this.y, p.y);
	}
}

export function equiv(x, y) {
	return Math.abs(x - y) < epsylon;
}

// Loop over array to find its i-th element
export function loopedGet(array, i) {
	const l = array.length;
	let index = i;
	while (index < 0) {
		index += l;
	}

	return array[index % l];
}

// Call a function to consecutive elements of an array (looping)
export function forEachConsecutive(array, callback, startingIndex) {
	const l = array.length;
	const nbArguments = callback.length;
	startingIndex = startingIndex || 0;
	while (startingIndex < 0) {
		startingIndex += l;
	}

	for (let i = startingIndex; i !== (l + startingIndex); ++i) {
		const parameters = [];
		for (let j = 0; j !== nbArguments; j++) {
			parameters.push(array[(i + j) % l]);
		}

		callback(...parameters);
	}
}

// Apply a transformation function to consecutive elements of an array (looping)
export function mapConsecutive(array, transformator) {
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
export function isFormClockwiseOriented(points) {
	let i;
	let sum = 0;
	for (i = 0; i < points.length - 1; i++) {
		sum += (points[i + 1].x - points[i].x) * (points[i + 1].y + points[i].y);
	}

	sum += (points[0].x - points[i].x) * (points[0].y + points[i].y);

	return sum <= 0;
}

// Return a new segment A2B2 parallel to AB and distant of 'distance' at the left side of AB vector
export function moveSegmentOutside(A, B, distance) {
	let dx = B.x - A.x;
	const dy = B.y - A.y;

	if (dx === 0) {
		dx = 0.01;
	}

	const x = -dy / dx;
	let sizeFactor = distance / Math.sqrt((x * x) + 1);

	if (dx > 0) { // Or dx < 0 if not clockwise
		sizeFactor *= -1;
	}

	return {
		A2: new Point((sizeFactor * x) + A.x, sizeFactor + A.y),
		B2: new Point((sizeFactor * x) + B.x, sizeFactor + B.y)
	};
}

// Return intersection point between AB and CD
export function getIntersection(A, B, C, D, insideSegment) {
	const ABx = B.x - A.x;
	const ABy = B.y - A.y;
	const CDx = D.x - C.x;
	const CDy = D.y - C.y;
	const CAx = A.x - C.x;
	const CAy = A.y - C.y;

	const I = (CDy * CAx) - (CDx * CAy);
	const J = (CDx * ABy) - (CDy * ABx);

	if (equiv(J, 0)) {
		if (equiv(I, 0)) {
			// AB and CD are collinear
			// find the two inner points by comparing their parameter 't'
			// in the line's parametric equation

			const sortedPoints = [A, B, C, D]
				.map(p => ({point: p, t: (p.x - A.x) / ABx}))
				.sort((a, b) => a.t - b.t)
				.map(p => p.point);

			return [sortedPoints[1], sortedPoints[2]];
		}

		// AB parallel to CD
		return undefined;
	}

	const K = I / J;
	if (insideSegment && (K < 0 || K > 1)) {
		// The intersection is outside AB
		return undefined;
	}

	if (equiv(K, 0)) {
		return A;
	}

	if (equiv(K, 1)) {
		return B;
	}

	// get the parameter K2 relative to CD
	const I2 = (ABy * (-CAx)) - (ABx * (-CAy));
	const J2 = -J;
	const K2 = I2 / J2;
	if (insideSegment && (K2 < 0 || K2 > 1)) {
		// The intersection is outside CD
		return undefined;
	}

	if (equiv(K2, 0)) {
		return C;
	}

	if (equiv(K2, 1)) {
		return D;
	}

	return new Point(A.x + (ABx * K), A.y + (ABy * K));
}
