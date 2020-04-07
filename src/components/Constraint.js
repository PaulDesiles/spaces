// import {Point} from './Geometry';

export class PolarPoint {
	constructor(radius, angle) {
		this.radius = radius;
		this.angle = angle;
	}
}

export class PolarSystem {
	constructor(centerPoint, rotation) {
		this.centerPoint = centerPoint;
		this.rotation = rotation;
	}

	getPointFor(p) {
		return new PolarPoint(
			Math.sqrt(this.centerPoint.getSquaredDistanceTo(p)),
			Math.atan2(this.centerPoint.y - p.y, this.centerPoint.x - p.x)
		);
	}
}

export class Constraint {
	constructor(system, parameters) {
		this.system = system;
		this.minRadius = parameters.minRadius || 0;
		this.maxRadius = parameters.maxRadius || Infinity;
		this.minAngle = parameters.minAngle;
		this.fixedAngle = parameters.fixedAngle;
	}

	apply(polarPoint) {
		polarPoint.radius = Math.max(
			this.minRadius,
			Math.min(this.maxRadius, polarPoint.radius));

		if (this.minAngle) {
			if (polarPoint.angle >= 0) {
				polarPoint.angle = Math.max(polarPoint.angle, this.minAngle);
			} else {
				polarPoint.angle = Math.min(-polarPoint.angle, this.minAngle);
			}
		} else if (this.fixedAngle) {
			polarPoint.angle = this.fixedAngle;
		}
	}
}

export function getDefaultConstraints() {
	const pN;
	const pNminus1;
	const pNminus2;
	const constraints = [];

	constraints.add(
		new Constraint(pNminus1System, {
			minRadius = this.parameters.minSize,
			maxRadius = this.parameters.maxSize,
		}));

	// newPoint = last.constrainAngleTo(
	// 	newPoint,
	// 	before,
	// 	this.parameters.minAngleRad,
	// 	this.parameters.angleStepRad
	// );
}
