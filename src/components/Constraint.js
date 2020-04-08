import {Point} from './GeometryHelpers.js';
import * as Helper from './GeometryHelpers.js';

// Only first occurence of an object will be returned
function distinct(value, index, self) {
	return self.indexOf(value) === index;
}

/*

var pos = constraint(mousePos);
pos.trySnap();

*/


class Segment {
	constructor(A, B) {
		this.A = A;
		this.B = B;
	}
}


export function getAvailableSnappingElements(parameters, shapes, points) {
	const lines = shapes
		.map(s => s.lines.concat(s.spacedLines))
		.flat()
		.filter(distinct);

	if (points.length === 0) {
		return lines;
	}

	const lastPoint = points[points.length - 1];

	if (parameters.angleStepRad === 0) {
		// Apply length constraint
		// each line is bounded to the intersections with min and max circles
		let segments = lines
			.map(l => intersectLineWithDonut(l, lastPoint, parameters.minSize, parameres.maxSize)
			.flat();

		// Apply min-angle constraint to each segment
		// if it has one intersection with the 'dead-angle' bounds
		// > change the segment bound that doesn't respect the constraint to this intersection
		// if it has two intersections
		// > return two segments to live the space between intersections empty
		if (parameters.minAngleRad > 0 && points.length > 1) {

			const beforeLastPoint = points[points.length - 2];
			const previousSegmentAngle = Math.atan2(
				beforeLastPoint.y - lastPoint.y, 
				beforeLastPoint.x - lastPoint.x);

			const respectMinConstraint = p => {
				const dx = lastPoint.x - p.x;
				const dy = lastPoint.y - p.y;
				const angleWithLastSegment = previousSegmentAngle - Math.atan2(dy, dx);
				return Math.abs(angleWithLastSegment) > parameters.minAngleRad;
			};
			const lowerAngleSegment =
				new Segment(
					lastPoint, 
					getPolarPoint(previousSegmentAngle - min, parameters.maxSize, lastPoint)
				);

			const upperAngleSegment = 
				new Segment(
					lastPoint, 
					getPolarPoint(previousSegmentAngle + min, parameters.maxSize, lastPoint)
				);

			segments.map(s => {
				var intersections =
					[Helper.getIntersection(s.A, s.B, s.lowerAngleSegment.A, s.lowerAngleSegment.B, true)]
					.concat(Helper.getIntersection(s.A, s.B, s.upperAngleSegment.A, s.upperAngleSegment.B, true))
					.filter(p => p !== undefined);
					
				if (intersections.length === 0) {
					return [s];
				}

				if (intersections.length === 1) {
					if (respectMinConstraint(A)) {
						return [new Segment(s.A, intersections[0])];
					}

					return [new Segment(s.B, intersections[0])];
				}

				let points [s.A, s.B, intersections[0], intersections[1]];
				if (s.A.x - s.B.x !== 0) {
					points = points.sort(p.x);
				} else {
					points = points.sort(p.y);
				}

				return [  
					new Segment(points[0], points[1]),
					new Segment(points[2], points[3]),
				];
			});
		}

		return segments;
	}

	// Compute all segments corresponding at each angle step
	// then get all intersections points with lines
	const stepSegments = [];
	const points = [];
	for (let i = parameters.minAngleRad; i < Math.PI; i += parameters.angleStepRad) {
		const stepSegments[];
		const j = i - Math.PI;
		const A = getPolarPoint(i, parameters.minSize, lastPoint);
		const B = getPolarPoint(i, parameters.maxSize, lastPoint);
		const C = getPolarPoint(j, parameters.minSize, lastPoint);
		const D = getPolarPoint(j, parameters.maxSize, lastPoint);

		if (parameters.minAngleRad === 0) {
			const p1 = i > minAngleRad ? A : lastPoint;
			const p2 = j < -minAngleRad ? D : lastPoint;

			if (p1 !== p2) {
				stepSegments.push(new Segment(p1, p2));
			}
		} else {
			if (i > minAngleRad) {
				stepSegments.push(new Segment(A, B));
			}

			if (j < -minAngleRad) {
				stepSegments.push(new Segment(C, D));
			}
		}
	}

	return lines.forEach(l => {
		segments.forEach(s =>
			Helper.getIntersection(s.A, s.B, l.bounds[0], l.bounds[1])
		);
	})
	.filter(p => p);
}

function getPolarPoint(angle, radius, center) {
	if (radius === 0)
		return center;

	return new Point(
		Math.cos(angle) * radius + center.x,
		Math.sin(angle) * radius + center.y,
	);
}

function intersectLineWithDonut(l, centerPoint, radiusMin, radiusMax) {
	const intersectionsWithMax = intersectLineWithCircle(l, centerPoint, radiusMax);
	if (intersectionsWithMax.length <= 1) {
		return intersectionsWithMax;
	}

	let intersectionsWithMin = [];
	if (radiusMin > 0) {
		intersectionsWithMin = intersectLineWithCircle(l, centerPoint, radiusMin);
	}

	if (intersectionsWithMin <= 1) {
		return [new Segment(intersectionsWithMax[0], intersectionsWithMax[1])];
	}

	return [
		new Segment(intersectionsWithMax[0], intersectionsWithMin[0]),
		new Segment(intersectionsWithMax[1], intersectionsWithMin[1])
	];
}

function intersectLineWithCircle(l, centerPoint, radius) {
	return resolve2ndDegreePolynom(
		1 + l.a * l.a,
		2* (l.a * (l.b - centerPoint.y) - centerPoint.x),
		(centerPoint.x * centerPoint.x) + ((l.b - centerPoint.y) * (l.b - centerPoint.y)) - (radius * radius)
	)
	.map(x => new Point(x, (a * x) + b));
}

function resolve2ndDegreePolynom(A, B, C) {
	const possibleXs = [];
	const delta = (B * B) + (4 * A * C);
	if (delta >= 0) {
		const deltaSqrt = Math.sqrt(delta);
		points.add((-B - deltaSqrt) / (2 * A));

		if (delta > 0) {
			points.add((-B + deltaSqrt) / (2 * A));
		}
	}

	return possibleXs;
}
