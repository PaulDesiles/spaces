import {Point} from '../Point';
import {equiv, resolve2ndDegreePolynom} from './MathHelpers';

// To know which side of an edge is inside the shape
// > the right side of an edge (points[i], points[i+1]) will be inside if clockwise is true
// Sum over the edges, (x2-x1)(y2+y1)
// http://en.wikipedia.org/wiki/Shoelace_formula
// http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order/1165943#1165943
export function isShapeClockwiseOriented(points) {
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

			if (insideSegment) {
				// Find the two inner points by comparing their parameter 't'
				// in the line's parametric equation

				const getT = equiv(A.x, B.x) ?
					(p => (p.y - A.y) / ABy) :
					(p => (p.x - A.x) / ABx);

				const sortedPoints = [A, B, C, D]
					.map(p => ({point: p, t: getT(p)}))
					.sort((a, b) => a.t - b.t)
					.map(p => p.point);

				if (sortedPoints[1] === sortedPoints[2]) {
					return sortedPoints[1];
				}

				return [sortedPoints[1], sortedPoints[2]];
			}

			// Avoid intersections calculations since we already know the line
			return [A, B];
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

	// Get the parameter K2 relative to CD
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

export function isInsideBounds(point, xmax, ymax) {
	return point.x >= 0 &&
		point.x <= xmax &&
		point.y >= 0 &&
		point.y <= ymax;
}

export function intersectLineWithCircle(l, center, radius) {
	if (l.dx === 0) {
		const x = l.intersections[0].x;
		return resolve2ndDegreePolynom(
			1,
			-2 * center.y,
			(center.y ** 2) + ((x - center.x) ** 2) - (radius ** 2)
		)
			.map(y => new Point(x, y));
	}

	return resolve2ndDegreePolynom(
		1 + (l.a ** 2),
		2 * ((l.a * (l.b - center.y)) - center.x),
		(center.x ** 2) + ((l.b - center.y) ** 2) - (radius ** 2)
	)
		.map(x => new Point(x, l.y(x)));
}
