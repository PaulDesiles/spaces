import {Point} from './GeometryHelpers';
import * as Helper from './GeometryHelpers';
import {Intersection, getLineBounds, isInsideBounds} from './Geometry';

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
		this.squaredLength = (this.dx * this.dx) + (this.dy * this.dy);
	}

	contains(p) {
		const APx = p.x - this.A.x;
		const APy = p.y - this.A.y;
		return (Math.abs(APx) <= Math.abs(this.dx)) &&
			(Math.abs(APy) <= Math.abs(this.dy)) &&
			Helper.equiv(this.dx / this.dy, APx / APy);
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

class Vector {
	constructor(A, B) {
		this.dx = B.x - A.x;
		this.dy = B.y - A.y;
		this.length = Math.sqrt((this.dx * this.dx) + (this.dy * this.dy));
	}

	angleWith(v) {
		// 𝐴𝐵→⋅𝐵𝐶→=‖𝐴𝐵→‖‖𝐵𝐶→‖cos𝜃
		const dotProduct = (this.dx * v.dx) + (this.dy * v.dy);
		return Math.acos(dotProduct / (this.length * v.length));
	}

	signedAngleWith(v) {
		const crossProduct = (this.dx * v.dy) - (this.dy * v.dx);
		return Math.sign(crossProduct) * this.angleWith(v);
	}
}

export function getContrainedSnappingElements(snappingPoints, snappingLines, currentShapePoints, parameters) {
	if (currentShapePoints.length === 0) {
		return {
			points: snappingPoints,
			segments: snappingLines
		};
	}

	const lastPoints = currentShapePoints.slice(-2).reverse();
	let lastAngle;
	if (parameters.minAngleRad > 0 && lastPoints.length > 1) {
		lastAngle = Math.atan2(
			lastPoints[1].y - lastPoints[0].y,
			lastPoints[1].x - lastPoints[0].x);
	}

	if (parameters.angleStepRad === 0) {
		return getIntersectionsWithAllowedRegion(snappingPoints, snappingLines, lastPoints, lastAngle, parameters);
	}

	return getIntersectionsWithAngleSteps(snappingPoints, snappingLines, lastPoints[0], lastAngle, parameters);
}

function getIntersectionsWithAllowedRegion(snappingPoints, snappingLines, lastPoints, lastAngle, parameters) {
	// Apply length constraint to points
	const min2 = parameters.minSize * parameters.minSize;
	const max2 = parameters.maxSize * parameters.maxSize;
	snappingPoints = snappingPoints.filter(p => {
		const d2 = lastPoints[0].getSquaredDistanceTo(p);
		return 	d2 > min2 && d2 <= max2;
	});

	// Apply length constraint
	// bound each line to the intersections with min and max circles
	let snappingSegments = [];

	snappingLines
		.map(l => intersectLineWithDonut(l, lastPoints[0], parameters.minSize, parameters.maxSize))
		.flat()
		.forEach(element => {
			if (element instanceof Point) {
				snappingPoints.push(element);
			} else if (element instanceof Segment) {
				snappingSegments.push(element);
			}
		});

	if (lastAngle !== undefined) {
		const lastVector = new Vector(lastPoints[0], lastPoints[1]);
		const pointRespectMinAngle = p => {
			const angle = lastVector.angleWith(new Vector(lastPoints[0], p));
			return angle > parameters.minAngleRad;
		};

		// Apply min-angle constraint to points
		snappingPoints = snappingPoints.filter(p => pointRespectMinAngle(p));

		// Apply min-angle constraint to each segments
		// if it has one intersection with the 'dead-angle' bounds
		// > change the segment bound that doesn't respect the constraint to this intersection
		// if it has two intersections
		// > return two segments to leave the space between intersections empty
		const lowerAngleSegment =
			new Segment(
				lastPoints[0],
				getPolarPoint(
					lastAngle - parameters.minAngleRad,
					parameters.maxSize,
					lastPoints[0])
			);

		const upperAngleSegment =
			new Segment(
				lastPoints[0],
				getPolarPoint(
					lastAngle + parameters.minAngleRad,
					parameters.maxSize,
					lastPoints[0])
			);

		snappingSegments = snappingSegments.map(s => {
			const low = Helper.getIntersection(s.A, s.B, lowerAngleSegment.A, lowerAngleSegment.B, true);
			const up = Helper.getIntersection(s.A, s.B, upperAngleSegment.A, upperAngleSegment.B, true);
			const intersections = [low, up].filter(p => p);

			if (intersections.length === 0) {
				return pointRespectMinAngle(s.A) ? [s] : [];
			}

			if (intersections.length === 1) {
				const i = intersections[0];
				if (Array.isArray(i) && i.length === 2) {
					return new Segment(i[0], i[1]);
				}

				if (pointRespectMinAngle(s.A)) {
					return [new Segment(s.A, i, s.associatedLine)];
				}

				return [new Segment(s.B, i, s.associatedLine)];
			}

			const points = [s.A, s.B, intersections[0], intersections[1]];

			if (s.A.x - s.B.x === 0) {
				points.sort((m, n) => m.y - n.y);
			} else {
				points.sort((m, n) => m.x - n.x);
			}

			return [
				new Segment(points[0], points[1], s.associatedLine),
				new Segment(points[2], points[3], s.associatedLine)
			];
		}).flat();
	}

	snappingSegments
		.forEach(s => {
			if (s instanceof Segment) {
				constrainSegmentToBounds(s);
			}
		});

	return {
		points: snappingPoints.filter(p => p),
		segments: snappingSegments.filter(s => s)
	};
}

function getIntersectionsWithAngleSteps(snappingPoints, snappingLines, lastPoint, lastAngle, parameters) {
	const stepSegments = getStepSegments(lastPoint, lastAngle, parameters);

	const points = snappingPoints.filter(p => p !== lastPoint && stepSegments.some(s => s.contains(p)));
	const segments = [];

	const addPoint = p => {
		if (!points.includes(p) && p !== lastPoint) {
			points.push(p);
		}
	};

	snappingLines
		.forEach(l =>
			stepSegments.forEach(s => {
				const p = Helper.getIntersection(s.A, s.B, l.bounds[0], l.bounds[1], true);

				if (p instanceof Intersection) {
					addPoint(p);
				} else if (p instanceof Point && !p.equiv(lastPoint)) {
					// Search an existing equivalent for this point
					const existing = l.intersections.filter(i => i.equiv(p));

					if (existing.length > 0 && existing[0]) {
						addPoint(existing[0]);
					} else {
						const i = Intersection.createFrom(p);
						i.crossingLines.push(l);
						addPoint(i);
					}
				}

				if (Array.isArray(p) && p.length === 2) {
					segments.push(new Segment(p[0], p[1]));
				}
			})
		);

	return {points, segments};
}

export function getStepSegments(lastPoint, lastAngle, parameters) {
	const stepSegments = [];
	const nbSteps = Math.round(Math.PI / parameters.angleStepRad);
	for (let step = 0; step < nbSteps; step++) {
		const i = step * parameters.angleStepRad;
		const j = i - Math.PI;
		const A = getPolarPoint(i, parameters.maxSize, lastPoint, parameters);
		const B = getPolarPoint(i, parameters.minSize, lastPoint, parameters);
		const C = getPolarPoint(j, parameters.minSize, lastPoint, parameters);
		const D = getPolarPoint(j, parameters.maxSize, lastPoint, parameters);

		if (parameters.minSize === 0) {
			let p1 = A;
			let p2 = D;

			if (lastAngle !== undefined && parameters.minAngleRad > 0) {
				if (!respectMinAngle(i, lastAngle, parameters.minAngleRad)) {
					p1 = lastPoint;
				}

				if (!respectMinAngle(j, lastAngle, parameters.minAngleRad)) {
					p2 = lastPoint;
				}
			}

			if (p1 !== p2) {
				stepSegments.push(new Segment(p1, p2));
			}
		} else {
			if (parameters.minAngleRad === 0 || respectMinAngle(i, lastAngle, parameters.minAngleRad)) {
				stepSegments.push(new Segment(A, B));
			}

			if (parameters.minAngleRad === 0 || respectMinAngle(j, lastAngle, parameters.minAngleRad)) {
				stepSegments.push(new Segment(C, D));
			}
		}
	}

	return stepSegments;
}

function respectMinAngle(a, lastAngle, minAngle) {
	let comparingAngle = lastAngle;
	if (a >= 0 && lastAngle < 0) {
		comparingAngle = lastAngle - (2 * Math.PI);
	}

	return Math.abs(comparingAngle - a) >= minAngle;// - 0.001;
}

export function getPolarPoint(angle, radius, center, drawingBounds) {
	if (radius === 0) {
		return center;
	}

	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	let r = radius;
	let x = (cos * r) + center.x;
	if (drawingBounds && (x < 0 || x > drawingBounds.xmax)) {
		x = Math.min(drawingBounds.xmax, Math.max(0, x));
		r = (x - center.x) / cos;
	}

	let y = (sin * r) + center.y;
	if (drawingBounds && (y < 0 || y > drawingBounds.ymax)) {
		y = Math.min(drawingBounds.ymax, Math.max(0, y));
		r = (y - center.y) / sin;
		x = (cos * r) + center.x;
	}

	return new Point(x, y);
}

export function constrainSegmentToBounds(s) {
	const outPoints = [];
	if (!isInsideBounds(s.A)) {
		outPoints.push(s.A);
	}

	if (!isInsideBounds(s.B)) {
		outPoints.push(s.B);
	}

	if (outPoints.length > 0) {
		const bounds = getLineBounds(s);

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

function intersectLineWithDonut(l, center, radiusMin, radiusMax) {
	const intersectionsWithMax = intersectLineWithCircle(l, center, radiusMax);
	if (intersectionsWithMax.length <= 1) {
		return intersectionsWithMax;
	}

	let intersectionsWithMin = [];
	if (radiusMin > 0) {
		intersectionsWithMin = intersectLineWithCircle(l, center, radiusMin);
	}

	if (intersectionsWithMin.length <= 1) {
		return [new Segment(intersectionsWithMax[0], intersectionsWithMax[1], l)];
	}

	return [
		new Segment(intersectionsWithMax[0], intersectionsWithMin[0], l),
		new Segment(intersectionsWithMax[1], intersectionsWithMin[1], l)
	];
}

export function intersectLineWithCircle(l, center, radius) {
	if (l.dx === 0) {
		const x = l.intersections[0].x;
		return resolve2ndDegreePolynom(
			1,
			-2 * center.y,
			(center.y * center.y) + ((x - center.x) * (x - center.x)) - (radius * radius)
		)
			.map(y => new Point(x, y));
	}

	return resolve2ndDegreePolynom(
		1 + (l.a * l.a),
		2 * ((l.a * (l.b - center.y)) - center.x),
		(center.x * center.x) + ((l.b - center.y) * (l.b - center.y)) - (radius * radius)
	)
		.map(x => new Point(x, l.y(x)));
}

export function resolve2ndDegreePolynom(A, B, C) {
	const possibleXs = [];
	const delta = (B * B) - (4 * A * C);
	if (delta >= 0) {
		const deltaSqrt = Math.sqrt(delta);
		possibleXs.push((-B - deltaSqrt) / (2 * A));

		if (delta > 0) {
			possibleXs.push((-B + deltaSqrt) / (2 * A));
		}
	}

	return possibleXs;
}

// Restrict point position to allowed regions by parameters
export function constrainPointPosition(p, currentShapePoints, parameters) {
	if (currentShapePoints.length > 0) {
		const lastPoints = currentShapePoints.slice(-2).reverse();

		let newPoint = constrainDistanceTo(
			lastPoints[0],
			p,
			parameters.minSize,
			parameters.maxSize
		);
		newPoint = constrainAngleTo(
			lastPoints[0],
			newPoint,
			lastPoints[1],
			parameters.minAngleRad,
			parameters.angleStepRad
		);
		return newPoint;
	}

	return p;
}

// Return new position for p so that the (basePoint, p) length is between min and max
function constrainDistanceTo(basePoint, p, min, max) {
	const dx = p.x - basePoint.x;
	const dy = p.y - basePoint.y;

	if (dx === 0 && dy === 0 && min > 0) {
		return new Point(p.x, p.y - min);
	}

	const squaredLength = (dx * dx) + (dy * dy);
	const newLength = Math.max(min * min, Math.min(max * max, squaredLength));
	if (newLength === squaredLength) {
		return p;
	}

	const f = Math.sqrt(newLength / squaredLength) - 1;
	return new Point(
		p.x + (f * dx),
		p.y + (f * dy)
	);
}

// Return new position for p so that the (this, p) angle with screen is aligned to 'steps' ticks
// and that the angle (previousPoint, this, p) is at least of 'min'
function constrainAngleTo(basePoint, p, previousPoint, min, step) {
	const dx = p.x - basePoint.x;
	const dy = p.y - basePoint.y;

	const currentAngle = Math.atan2(dy, dx);

	let newAngle = currentAngle;
	let stepApplied = false
	if (previousPoint !== undefined && min > 0) {
		const previousVector = new Vector(basePoint, previousPoint);
		const previousAngle = Math.atan2(previousVector.dy, previousVector.dx);
		const currentVector = new Vector(basePoint, p);
		const angleFromPrevious = previousVector.signedAngleWith(currentVector);

		// const steppedMin = step === 0 ? min : (Math.ceil(min / step) * step);

		if (angleFromPrevious >= 0) {
			if (angleFromPrevious < min) {
				newAngle = previousAngle;
				stepApplied = true;
			}
		} else if (angleFromPrevious > -min) {
			newAngle = previousAngle - min;
			newAngle = previousAngle;
			stepApplied = true;
		}
	}

	if (step > 0 && !stepApplied) {
		newAngle = Math.round(newAngle / step) * step;
	}

	if (newAngle !== currentAngle) {
		const length = Math.sqrt((dx * dx) + (dy * dy));
		return new Point(
			basePoint.x + (length * Math.cos(newAngle)),
			basePoint.y + (length * Math.sin(newAngle))
		);
	}

	return p;
}
