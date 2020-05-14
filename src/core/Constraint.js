import {Point, getPolarPoint} from './Point';
import {Intersection} from './Intersection';
import {Segment, constrainSegmentToBounds} from './Segment';
import * as Geometry from './Helpers/GeometryHelpers';
import {Vector} from './Helpers/MathHelpers';

export function getContrainedSnappingElements(snappingPoints, snappingLines, currentShapePoints, parameters) {
	if (currentShapePoints.length === 0) {
		return {
			points: snappingPoints,
			segments: snappingLines
		};
	}

	const lastPoints = currentShapePoints.slice(-2).reverse();
	let lastAngle;
	if (parameters.minAngle > 0 && lastPoints.length > 1) {
		lastAngle = Math.atan2(
			lastPoints[1].y - lastPoints[0].y,
			lastPoints[1].x - lastPoints[0].x);
	}

	if (parameters.angleStep === 0) {
		return getIntersectionsWithAllowedRegion(snappingPoints, snappingLines, lastPoints, lastAngle, parameters);
	}

	return getIntersectionsWithAngleSteps(snappingPoints, snappingLines, lastPoints, lastAngle, parameters);
}

export function getIntersectionsWithAllowedRegion(snappingPoints, snappingLines, lastPoints, lastAngle, parameters) {
	// Apply length constraint to points
	const min2 = parameters.minStroke ** 2;
	const max2 = parameters.maxStroke ** 2;
	snappingPoints = snappingPoints.filter(p => {
		const d2 = lastPoints[0].getSquaredDistanceTo(p);
		return 	d2 > min2 && d2 <= max2;
	});

	// Apply length constraint
	// bound each line to the intersections with min and max circles
	let snappingSegments = [];

	snappingLines
		.map(l => intersectLineWithDonut(l, lastPoints[0], parameters.minStroke, parameters.maxStroke))
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
			return angle >= parameters.minAngle;
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
					lastAngle - parameters.minAngle,
					parameters.maxStroke,
					lastPoints[0])
			);

		const upperAngleSegment =
			new Segment(
				lastPoints[0],
				getPolarPoint(
					lastAngle + parameters.minAngle,
					parameters.maxStroke,
					lastPoints[0])
			);

		snappingSegments = snappingSegments.map(s => {
			const low = Geometry.getIntersection(s.A, s.B, lowerAngleSegment.A, lowerAngleSegment.B, true);
			const up = Geometry.getIntersection(s.A, s.B, upperAngleSegment.A, upperAngleSegment.B, true);
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
				constrainSegmentToBounds(s, parameters.drawingSize.x, parameters.drawingSize.y);
			}
		});

	return {
		points: snappingPoints.filter(p => p),
		segments: snappingSegments.filter(s => s)
	};
}

export function getIntersectionsWithAngleSteps(snappingPoints, snappingLines, lastPoints, lastAngle, parameters) {
	const stepSegments = getStepSegments(lastPoints, lastAngle, parameters);

	const points = snappingPoints.filter(p => p !== lastPoints[0] && stepSegments.some(s => s.contains(p)));
	const segments = [];

	const addPoint = p => {
		if (!points.includes(p) && p !== lastPoints[0]) {
			points.push(p);
		}
	};

	snappingLines
		.forEach(l =>
			stepSegments.forEach(s => {
				const p = Geometry.getIntersection(s.A, s.B, l.bounds[0], l.bounds[1], true);

				if (p instanceof Intersection) {
					addPoint(p);
				} else if (p instanceof Point && !p.equiv(lastPoints[0])) {
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

export function getStepSegments(lastPoints, lastAngle, parameters) {
	let pointRespectMinAngle = _ => true;

	if (lastPoints.length > 1) {
		const lastVector = new Vector(lastPoints[0], lastPoints[1]);
		pointRespectMinAngle = p => {
			const angle = lastVector.angleWith(new Vector(lastPoints[0], p));
			return angle >= parameters.minAngle;
		};
	}

	const stepSegments = [];
	const nbSteps = Math.round(Math.PI / parameters.angleStep);
	for (let step = 0; step < nbSteps; step++) {
		const i = step * parameters.angleStep;
		const j = i - Math.PI;
		const A = getPolarPoint(i, parameters.maxStroke, lastPoints[0], parameters.drawingSize);
		const B = getPolarPoint(i, parameters.minStroke, lastPoints[0], parameters.drawingSize);
		const C = getPolarPoint(j, parameters.minStroke, lastPoints[0], parameters.drawingSize);
		const D = getPolarPoint(j, parameters.maxStroke, lastPoints[0], parameters.drawingSize);

		if (parameters.minStroke === 0) {
			let p1 = A;
			let p2 = D;

			if (lastAngle !== undefined && parameters.minAngle > 0) {
				if (!pointRespectMinAngle(p1)) {
					p1 = lastPoints[0];
				}

				if (!pointRespectMinAngle(p2)) {
					p2 = lastPoints[0];
				}
			}

			if (p1 !== p2) {
				stepSegments.push(new Segment(p1, p2));
			}
		} else {
			if (parameters.minAngle === 0 || pointRespectMinAngle(A)) {
				stepSegments.push(new Segment(A, B));
			}

			if (parameters.minAngle === 0 || pointRespectMinAngle(D)) {
				stepSegments.push(new Segment(C, D));
			}
		}
	}

	return stepSegments;
}

export function intersectLineWithDonut(l, center, radiusMin, radiusMax) {
	const intersectionsWithMax = Geometry.intersectLineWithCircle(l, center, radiusMax);
	if (intersectionsWithMax.length <= 1) {
		return intersectionsWithMax;
	}

	let intersectionsWithMin = [];
	if (radiusMin > 0) {
		intersectionsWithMin = Geometry.intersectLineWithCircle(l, center, radiusMin);
	}

	if (intersectionsWithMin.length <= 1) {
		return [new Segment(intersectionsWithMax[0], intersectionsWithMax[1], l)];
	}

	return [
		new Segment(intersectionsWithMax[0], intersectionsWithMin[0], l),
		new Segment(intersectionsWithMax[1], intersectionsWithMin[1], l)
	];
}

// Restrict point position to allowed regions by parameters
export function constrainPointPosition(p, currentShapePoints, parameters) {
	if (currentShapePoints.length > 0) {
		const lastPoints = currentShapePoints.slice(-2).reverse();

		let newPoint = constrainDistance(
			lastPoints[0],
			p,
			parameters.minStroke,
			parameters.maxStroke
		);
		newPoint = constrainAngle(
			lastPoints[0],
			newPoint,
			lastPoints[1],
			parameters.minAngle,
			parameters.angleStep
		);
		return newPoint;
	}

	return p;
}

// Return new position for p so that the (basePoint, p) length is between min and max
export function constrainDistance(basePoint, p, min, max) {
	const dx = p.x - basePoint.x;
	const dy = p.y - basePoint.y;

	if (dx === 0 && dy === 0 && min > 0) {
		return new Point(p.x, p.y - min);
	}

	const squaredLength = (dx ** 2) + (dy ** 2);
	const newLength = Math.max(min ** 2, Math.min(max ** 2, squaredLength));
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
export function constrainAngle(basePoint, p, previousPoint, min, step) {
	const dx = p.x - basePoint.x;
	const dy = p.y - basePoint.y;

	const currentAngle = Math.atan2(dy, dx);

	let newAngle = currentAngle;
	let stepApplied = false;
	if (previousPoint !== undefined && min > 0) {
		const previousVector = new Vector(basePoint, previousPoint);
		const previousAngle = Math.atan2(previousVector.dy, previousVector.dx);
		const currentVector = new Vector(basePoint, p);
		const angleFromPrevious = previousVector.signedAngleWith(currentVector);

		const S = Math.sign(angleFromPrevious);
		let steppedMin = previousAngle + (min * S);
		let minAngleFromPrevious = (min * S);
		if (step > 0) {
			steppedMin = Math.ceil(steppedMin / step) * step;
			if (S < 0) {
				steppedMin -= step;
			}

			minAngleFromPrevious = (steppedMin - previousAngle) / S;
		}

		if (Math.abs(angleFromPrevious) < Math.abs(minAngleFromPrevious)) {
			newAngle = steppedMin;
			stepApplied = true;
		}
	}

	if (step > 0 && !stepApplied) {
		newAngle = Math.round(newAngle / step) * step;
	}

	if (newAngle !== currentAngle) {
		const length = Math.hypot(dx, dy);
		return new Point(
			basePoint.x + (length * Math.cos(newAngle)),
			basePoint.y + (length * Math.sin(newAngle))
		);
	}

	return p;
}
