const epsylon = 0.001;

export function equiv(a, b) {
	return Math.abs(a - b) < epsylon;
}

export function resolve2ndDegreePolynom(A, B, C) {
	const possibleXs = [];
	const delta = (B ** 2) - (4 * A * C);
	if (delta >= 0) {
		const deltaSqrt = Math.sqrt(delta);
		possibleXs.push((-B - deltaSqrt) / (2 * A));

		if (delta > 0) {
			possibleXs.push((-B + deltaSqrt) / (2 * A));
		}
	}

	return possibleXs;
}

export function getPolarCoordinates(angle, radius, center, drawingSize) {
	if (radius === 0) {
		return center;
	}

	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	let r = radius;
	let x = (cos * r) + center.x;
	if (drawingSize && (x < 0 || x > drawingSize.x)) {
		x = Math.min(drawingSize.x, Math.max(0, x));
		r = (x - center.x) / cos;
	}

	let y = (sin * r) + center.y;
	if (drawingSize && (y < 0 || y > drawingSize.y)) {
		y = Math.min(drawingSize.y, Math.max(0, y));
		r = (y - center.y) / sin;
		x = (cos * r) + center.x;
	}

	return {x, y};
}

export class Vector {
	constructor(A, B) {
		this.dx = B.x - A.x;
		this.dy = B.y - A.y;
		this.length = Math.hypot(this.dx, this.dy);
	}

	angleWith(v) {
		// 𝐴𝐵→⋅𝐵𝐶→=‖𝐴𝐵→‖‖𝐵𝐶→‖cos𝜃
		const dotProduct = (this.dx * v.dx) + (this.dy * v.dy);
		const div = dotProduct / (this.length * v.length);
		// Calculation imprecisions may lead to results slightly above 1 / below -1
		return Math.acos(Math.max(-1, Math.min(1, div)));
	}

	signedAngleWith(v) {
		const crossProduct = (this.dx * v.dy) - (this.dy * v.dx);
		return Math.sign(crossProduct) * this.angleWith(v);
	}
}
