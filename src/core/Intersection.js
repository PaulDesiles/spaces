import {Point} from './Point';

let intersectionCount = 0;
export class Intersection extends Point {
	constructor(x, y) {
		super(x, y);
		this.crossingLines = [];
		this.id = 'P' + intersectionCount++;
	}

	static createFrom(point) {
		return new Intersection(point.x, point.y);
	}
}
