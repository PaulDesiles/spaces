const formsGap = 10;

export class Point {
	constructor(x, y) {
		if (x && y) {
			this.x = x;
			this.y = y;
		} else {
			this.x = 0;
			this.y = 0;
		}

		this.isMouseOver = false;
	}

	getSqDistanceFrom(p) {
		const dx = p.x - this.x;
		const dy = p.y - this.y;
		return Math.sqrt((dx * dx) + (dy * dy));
	}

	clone() {
		return new Point(this.x, this.y);
	}
}

export class Segment {
	constructor(A, B) {
		this.A = A;
		this.B = B;
	}
}

export class Guide extends Segment {
	constructor(A, B, hidePoints) {
		super(A, B);
		this.hidePoints = hidePoints;

		// The line function is (y = a * x + b)
		// with a = dx / dy
		// and b = y - a * x
		this.dx = B.x - A.x;
		this.dy = B.y - A.y;
		const a = this.dy / this.dx;
		const b = A.y - (a * A.x);
		this.y = x => (a * x) + b;
		this.x = y => (y - b) / a;

		// Pre-calc for projection
		this.squaredLength = (this.dx * this.dx) + (this.dy * this.dy);

		this.isMouseOver = false;
	}

	// See https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
	getProjection(p) {
		const t = (((p.x - this.A.x) * this.dx) + ((p.y - this.A.y) * this.dy)) / this.squaredLength;
		return new Point(
			this.A.x + (t * this.dx),
			this.A.y + (t * this.dy)
		);
	}
}

export class Shape {
	constructor(points) {
		this.points = points;
		this.guides = getGuides(points);
	}
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

function getGuides(points) {
	const stickedGuides = []; // Guides in contact with the form
	const spacedGuides = []; // Guides spaces from the form
	const clockwise = isFormClockwiseOriented(points);

	const getCycled = (array, i) => array[i % array.length];

	for (let i = 0; i < points.length; i++) {
		stickedGuides.push(
			new Guide(getCycled(points, i), getCycled(points, i + 1), true));

		spacedGuides.push(
			getGuideForBCSegment(
				getCycled(points, i),
				getCycled(points, i + 1),
				getCycled(points, i + 2),
				getCycled(points, i + 3),
				clockwise
			)
		);
	}

	// If the corner is concave, get intersection between guides
	for (let i = 0; i < spacedGuides.length; i++) {
		const current = getCycled(spacedGuides, i);
		const next = getCycled(spacedGuides, i + 1);

		if (clockwise !== isFormClockwiseOriented([current.A, current.B, next.A, next.B])) {
			const intersection = getIntersection(current.A, current.B, next.A, next.B);
			current.B = intersection;
			next.A = intersection;
		}
	}

	return spacedGuides
		.map(g => new Guide(g.A, g.B, false))
		.concat(stickedGuides);
}

function getGuideForBCSegment(A, B, C, D, isFormClockwise) {
	// Move form's segment outside the form to get the guide's line
	const movedBCSegment = moveSegmentOutside(B, C, formsGap, isFormClockwise);

	// Compute this line's intersections with the form's previous and next segment
	// to get guide's key points
	const I = getIntersection(A, B, movedBCSegment.A, movedBCSegment.B);
	const J = getIntersection(C, D, movedBCSegment.A, movedBCSegment.B);

	// TODO : optimize if the corner is concave by not computing a point that will be changed later...

	return new Segment(I, J);
}

function moveSegmentOutside(A, B, distance, isFormClockwise) {
	let dx = B.x - A.x;
	const dy = B.y - A.y;

	if (dx === 0) {
		dx = 0.01;
	}

	const x = -1 * dy / dx;
	let sizeFactor = distance / Math.sqrt((x * x) + 1);

	if ((dx > 0 && isFormClockwise) || (dx < 0 && !isFormClockwise)) {
		sizeFactor *= -1;
	}

	return new Segment(
		new Point((sizeFactor * x) + A.x, sizeFactor + A.y),
		new Point((sizeFactor * x) + B.x, sizeFactor + B.y)
	);
}

function getIntersection(A, B, C, D) {
	const dx = B.x - A.x;
	const dy = B.y - A.y;
	const a =
		(((D.y - C.y) * (A.x - C.x)) - ((D.x - C.x) * (A.y - C.y))) /
		(((D.x - C.x) * dy) - ((D.y - C.y) * dx));
	return new Point(A.x + (dx * a), A.y + (dy * a));
}

export const AnchorType = {
	cursor: 1,
	startPoint: 2,
	guide: 3
};
Object.freeze(AnchorType);
