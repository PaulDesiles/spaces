import {equiv, getPolarCoordinates} from './Helpers/MathHelpers';

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

export function getPolarPoint(angle, radius, center, drawingSize) {
	const {x, y} = getPolarCoordinates(angle, radius, center, drawingSize);
	return new Point(x, y);
}
