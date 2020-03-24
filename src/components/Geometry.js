var formsGap = 10;

export class Point {
	constructor(x,y) {
		if (x && y) {
			this.x = x;
			this.y = y;
		}
		else {
			this.x = 0;
			this.y = 0;
		}

		this.isMouseOver = false;
	}

	getSqDistanceFrom(p2) {
		let dx = p2.x - this.x;
		let dy = p2.y - this.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	clone() {
		return new Point(this.x, this.y);
	}
}

export class Segment {
	constructor(p1,p2) {
		this.p1 = p1;
		this.p2 = p2;

		// the line function is (y = a * x + b) 
        // with a = dx / dy
        // and b = y - a * x
        this.dx = p2.x - p1.x;
        this.dy = p2.y - p1.y;
        let a = this.dy / this.dx;
        let b = p1.y - a * p1.x; 
        this.y = x => a * x + b;
        this.x = y => (y - b) / a;

        //pre-calc for projection
        this.squaredLength = this.dx * this.dx + this.dy * this.dy;

		this.isMouseOver = false;

	}

	//https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
	getProjection(p) {
		let t = ((p.x - this.p1.x) * this.dx + (p.y - this.p1.y) * this.dy) / this.squaredLength;
		return new Point(
			this.p1.x + t * this.dx,
            this.p1.y + t * this.dy 
        );
	}

}

export class Shape {
	constructor(points) {
		this.points = points;
		this.guides = getGuides(points);
	}
}

//To know which side of an edge is inside the form
// > the right side of an edge (points[i], points[i+1]) will be inside if clockwise is true
//Sum over the edges, (x2-x1)(y2+y1)
//http://en.wikipedia.org/wiki/Shoelace_formula
//http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order/1165943#1165943
function isFormClockwiseOriented(points) {    
    let i;
    let sum = 0;
    for (i=0; i< points.length - 1; i++) {
        sum += (points[i+1].x - points[i].x) * (points[i+1].y + points[i].y);
    }
    sum += (points[0].x- points[i].x) * (points[0].y + points[i].y);

    return sum <= 0;
}

function getGuides(points) {

	let guides = [];
	let clockwise = isFormClockwiseOriented(points);

	let getCycled = (array, i) => array[i % array.length];

	for (let i=0; i < points.length; i++) {
		guides.push(
			getGuideForBCSegment(
				getCycled(points, i),
				getCycled(points, i+1),
				getCycled(points, i+2),
				getCycled(points, i+3),
				clockwise,
			)
		);
	}

	//if the corner is concave, get intersection between guides
	for (let i=0; i < guides.length; i++) {
		let current = getCycled(guides, i);
		let next = getCycled(guides, i+1);

		if (clockwise != isFormClockwiseOriented([current.p1, current.p2, next.p1, next.p2]))
			current.p2 = next.p1 = getIntersection(current, next);
	}

	return guides;
}

function getGuideForBCSegment(A, B, C, D, isFormClockwise) {
	//move form's segment outside the form to get the guide's line
	let movedBCSegment = moveSegmentOutside(B,C, formsGap, isFormClockwise);

	// compute this line's intersections with the form's previous and next segment
	// to get guide's key points
	let I = getIntersection(new Segment(A,B), movedBCSegment);
	let J = getIntersection(new Segment(C,D), movedBCSegment);

	//TODO : optimize if the corner is concave by not computing a point that will be changed later...

	return new Segment(I,J);
}

function moveSegmentOutside(A, B, distance, isFormClockwise) {
	let dX = B.x - A.x;
	let dY = B.y - A.y;

	if (dX == 0)
		dX = 0.01;
	let x = -1 * dY / dX;
	let sizeFactor = distance / Math.sqrt(x*x + 1);

    if ((dX > 0 && isFormClockwise) || (dX < 0 && !isFormClockwise))
        sizeFactor *= -1;

    return new Segment(
    	new Point(sizeFactor * x + A.x, sizeFactor + A.y),
    	new Point(sizeFactor * x + B.x, sizeFactor + B.y)
 	);
}

function getIntersection(u, v) {
	let x1 = u.p1.x;
	let x2 = u.p2.x;
	let x3 = v.p1.x;
	let x4 = v.p2.x;
	let y1 = u.p1.y;
	let y2 = u.p2.y;
	let y3 = v.p1.y;
	let y4 = v.p2.y;

    let a = ((y4-y3)*(x1-x3)-(x4-x3)*(y1-y3)) / ((x4-x3)*(y2-y1)-(y4-y3)*(x2-x1));
	return new Point(x1 + (x2-x1) * a, y1 + (y2-y1) * a);
}

export const AnchorType = { cursor:1, startPoint:2, guide:3 };
Object.freeze(AnchorType);