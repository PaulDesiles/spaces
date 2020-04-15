import {Point} from './GeometryHelpers';
import * as Helper from './GeometryHelpers';
import {Intersection} from './Geometry';

// Not linked to Line YET on purpose
// so as to keep its possibilities to minimum
class Segment {
	constructor(A, B, associatedLine) {
		this.A = A;
		this.B = B;
		this.associatedLine = associatedLine;
		this.dx = B.x - A.x;
		this.dy = B.y - A.y;
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

export function getContrainedSnappingElements(snappingPoints, snappingLines, currentShapePoints, parameters) {
	if (currentShapePoints.length === 0) {
		return {
			points: snappingPoints,
			segments: snappingLines
		};
	}

	const lastPoints = currentShapePoints.slice(-2).reverse();

	if (parameters.angleStepRad === 0) {
		return getIntersectionsWithAllowedRegion(snappingPoints, snappingLines, lastPoints, parameters);
	}

	return getIntersectionsWithAngleSteps(snappingPoints, snappingLines, lastPoints[0], parameters);
}

function getIntersectionsWithAllowedRegion(snappingPoints, snappingLines, lastPoints, parameters) {
	// Apply length constraint to points
	const min2 = parameters.minSize * parameters.minSize;
	const max2 = parameters.maxSize * parameters.maxSize;
	snappingPoints = snappingPoints.filter(p => {
		const d2 = lastPoints[0].getSquaredDistanceTo(p);
		return 	d2 > min2 && d2 <= max2;
	});

	// Apply length constraint
	// bound each line to the intersections with min and max circles
	let snappingSegments = snappingLines
		.map(l => intersectLineWithDonut(l, lastPoints[0], parameters.minSize, parameters.maxSize))
		.flat();

	if (parameters.minAngleRad > 0 && lastPoints.length > 1) {
		const previousSegmentAngle = Math.atan2(
			lastPoints[1].y - lastPoints[0].y,
			lastPoints[1].x - lastPoints[0].x);

		const respectMinAngle = p => {
			const dx = lastPoints[0].x - p.x;
			const dy = lastPoints[0].y - p.y;
			const angleWithLastSegment = previousSegmentAngle - Math.atan2(dy, dx);
			return Math.abs(angleWithLastSegment) > parameters.minAngleRad;
		};

		// Apply min-angle constraint to points
		snappingPoints = snappingPoints.filter(p => respectMinAngle(p));

		// Apply min-angle constraint to each segments
		// if it has one intersection with the 'dead-angle' bounds
		// > change the segment bound that doesn't respect the constraint to this intersection
		// if it has two intersections
		// > return two segments to leave the space between intersections empty
		const lowerAngleSegment =
			new Segment(
				lastPoints[0],
				getPolarPoint(
					previousSegmentAngle - parameters.minAngleRad,
					parameters.maxSize,
					lastPoints[0])
			);

		const upperAngleSegment =
			new Segment(
				lastPoints[0],
				getPolarPoint(
					previousSegmentAngle + parameters.minAngleRad,
					parameters.maxSize,
					lastPoints[0])
			);

		snappingSegments = snappingSegments.map(s => {
			const intersections =
				[Helper.getIntersection(s.A, s.B, lowerAngleSegment.A, lowerAngleSegment.B, true),
					Helper.getIntersection(s.A, s.B, upperAngleSegment.A, upperAngleSegment.B, true)]
					.filter(p => p !== undefined);

			if (intersections.length === 0) {
				return [s];
			}

			if (intersections.length === 1) {
				if (respectMinAngle(s.A)) {
					return [new Segment(s.A, intersections[0], s.associatedLine)];
				}

				return [new Segment(s.B, intersections[0], s.associatedLine)];
			}

			let points = [s.A, s.B, intersections[0], intersections[1]];

			if (s.A.x - s.B.x === 0) {
				points = points.sort(p => p.y);
			} else {
				points = points.sort(p => p.x);
			}

			return [
				new Segment(points[0], points[1], s.associatedLine),
				new Segment(points[2], points[3], s.associatedLine)
			];
		}).flat();
	}

	return {
		points: snappingPoints,
		segments: snappingSegments
	};
}

function getIntersectionsWithAngleSteps(snappingPoints, snappingLines, lastPoint, parameters) {
	const stepSegments = getStepSegments(lastPoint, parameters);

	const intersections = snappingPoints
		.filter(p => stepSegments.some(s => s.contains(p)))
		.concat(
			snappingLines
				.map(l =>
					stepSegments.map(s => {
						const p = Helper.getIntersection(s.A, s.B, l.bounds[0], l.bounds[1]);
						const i = Intersection.createFrom(p);
						i.crossingLines.push(l);
						return i;
					})
				).flat()
				.filter(p => p)
		);

	return {
		points: intersections,
		segments: []
	};
}

function getStepSegments(lastPoint, parameters) {
	const stepSegments = [];

	for (let i = parameters.minAngleRad; i < Math.PI; i += parameters.angleStepRad) {
		const j = i - Math.PI;
		const A = getPolarPoint(i, parameters.minSize, lastPoint);
		const B = getPolarPoint(i, parameters.maxSize, lastPoint);
		const C = getPolarPoint(j, parameters.minSize, lastPoint);
		const D = getPolarPoint(j, parameters.maxSize, lastPoint);

		if (parameters.minAngleRad === 0) {
			const p1 = i > parameters.minAngleRad ? A : lastPoint;
			const p2 = j < -parameters.minAngleRad ? D : lastPoint;

			if (p1 !== p2) {
				stepSegments.push(new Segment(p1, p2));
			}
		} else {
			if (i > parameters.minAngleRad) {
				stepSegments.push(new Segment(A, B));
			}

			if (j < -parameters.minAngleRad) {
				stepSegments.push(new Segment(C, D));
			}
		}
	}

	return stepSegments;
}

function getPolarPoint(angle, radius, center) {
	if (radius === 0) {
		return center;
	}

	return new Point(
		(Math.cos(angle) * radius) + center.x,
		(Math.sin(angle) * radius) + center.y
	);
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

	if (intersectionsWithMin <= 1) {
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
