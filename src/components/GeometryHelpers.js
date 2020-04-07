const epsylon = 0.001;

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

	// Return new position for p so that the (this, p) length is between min and max
	constrainDistanceTo(p, min, max) {
		const dx = p.x - this.x;
		const dy = p.y - this.y;

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
	// and that the angle (previousPoint, this, p) is at lest of 'min'
	constrainAngleTo(p, previousPoint, min, step) {
		const dx = p.x - this.x;
		const dy = p.y - this.y;

		const currentAngle = Math.atan2(dy, dx);

		let newAngle = currentAngle;
		if (previousPoint !== undefined && min > 0) {
			const previousDeltaX = previousPoint.x - this.x;
			const previousDeltaY = previousPoint.y - this.y;
			const previousAngle = Math.atan2(previousDeltaY, previousDeltaX);
			const angleFromPrevious = previousAngle - currentAngle;

			if (angleFromPrevious >= 0) {
				if (angleFromPrevious < min) {
					newAngle = previousAngle - min;
				}
			} else if (angleFromPrevious > -min) {
				newAngle = previousAngle + min;
			}
		}

		if (step > 0) {
			let steppedAngle = Math.floor(newAngle / step) * step;
			if (Math.abs(steppedAngle - newAngle) > (step / 2)) {
				steppedAngle += step;
			}

			newAngle = steppedAngle;
		}

		if (newAngle !== currentAngle) {
			const length = Math.sqrt((dx * dx) + (dy * dy));
			return new Point(
				this.x + (length * Math.cos(newAngle)),
				this.y + (length * Math.sin(newAngle))
			);
		}

		return p;
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

// Return intersection point between AB and CD
export function getIntersection(A, B, C, D) {
	const dx = B.x - A.x;
	const dy = B.y - A.y;
	const a =
		(((D.y - C.y) * (A.x - C.x)) - ((D.x - C.x) * (A.y - C.y))) /
		(((D.x - C.x) * dy) - ((D.y - C.y) * dx));
	return new Point(A.x + (dx * a), A.y + (dy * a));
}

