import {Point} from '../../src/core/Point';
import {Intersection} from '../../src/core/Intersection';
import {Line} from '../../src/core/Line';
import {Segment} from '../../src/core/Segment';
import * as Helper from '../../src/core/Constraint';

const p1 = new Point(10, 2);
const p2 = new Point(10, 10);
const p3 = new Point(15, 15);
const p4 = new Point(25, 15);
const deg10 = Math.PI / 18;
const deg15 = Math.PI / 12;
const deg30 = Math.PI / 6;
const deg40 = Math.PI / 4.5;
const deg45 = Math.PI / 4;

describe('constrain point in distance bounds', () => {
	test('constrain distance : in bounds', () => {
		expect(Helper.constrainDistance(p2, p3, 2, 10)).toBe(p3);
	});

	test('constrain distance : min', () => {
		const p = Helper.constrainDistance(p2, p3, 7 * Math.sqrt(2), 100);
		expect(p.x).toBeCloseTo(17);
		expect(p.y).toBeCloseTo(17);
	});

	test('constrain distance : max', () => {
		const p = Helper.constrainDistance(p2, p3, 1, 2 * Math.sqrt(2));
		expect(p.x).toBeCloseTo(12);
		expect(p.y).toBeCloseTo(12);
	});

	test('constrain distance with itself', () => {
		const p = Helper.constrainDistance(p2, p2, 3, 5);
		expect(p.x).toBeCloseTo(10);
		expect(p.y).toBeCloseTo(7);
	});

	test('constrain rotation : void params', () => {
		const result = Helper.constrainAngle(p2, p3, p1, 0, 0);
		expect(result).toBe(p3);
	});
});

describe('constrain point in angle bounds', () => {
	test('constrain rotation : min', () => {
		const result = Helper.constrainAngle(p1, p4, p3, deg45, 0);
		// From 28° to 45°
		expect(result.x).toBeCloseTo(28.14);
		expect(result.y).toBeCloseTo(10.06);
	});

	test('constrain rotation : step', () => {
		const result = Helper.constrainAngle(p3, p2, undefined, 0, deg10);
		// From 45° (to X axis) to 40°
		expect(result.x).toBeCloseTo(10.45);
		expect(result.y).toBeCloseTo(9.58);
	});

	test('constrain rotation : min (ignored) & step', () => {
		const result = Helper.constrainAngle(p3, p2, p4, deg30, deg10);
		// From 135° to 130°
		expect(result.x).toBeCloseTo(10.45);
		expect(result.y).toBeCloseTo(9.58);
	});

	test('constrain rotation : min & step', () => {
		const result = Helper.constrainAngle(p1, p3, p2, deg40, deg15);
		// From 21° to 45°
		expect(result.x).toBeCloseTo(19.85);
		expect(result.y).toBeCloseTo(11.85);
	});
});

describe('constrain point', () => {
	test('min rotation', () => {
		const result = Helper.constrainPointPosition(p4, [p3, p1], {
			minStroke: 0,
			maxStroke: 1000,
			minAngle: deg45,
			angleStep: 0
		});
		// From 28° to 45°
		expect(result.x).toBeCloseTo(28.14);
		expect(result.y).toBeCloseTo(10.06);
	});
	test('min rotation & max length', () => {
		const result = Helper.constrainPointPosition(p4, [p3, p1], {
			minStroke: 0,
			maxStroke: 15,
			minAngle: deg45,
			angleStep: 0
		});
		// From 28° and 19.85px to 45° and 15px
		expect(result.x).toBeCloseTo(23.71);
		expect(result.y).toBeCloseTo(8.09);
	});

	test('rotation step', () => {
		const result = Helper.constrainPointPosition(p2, [p3], {
			minStroke: 0,
			maxStroke: 1000,
			minAngle: 0,
			angleStep: deg10
		});
		// From 45° (to X axis) to 40°
		expect(result.x).toBeCloseTo(10.45);
		expect(result.y).toBeCloseTo(9.58);
	});
	test('rotation step & min length', () => {
		const result = Helper.constrainPointPosition(p2, [p3], {
			minStroke: 10,
			maxStroke: 1000,
			minAngle: 0,
			angleStep: deg10
		});
		// From 45° (to X axis) and 7px to 40° and 10px
		expect(result.x).toBeCloseTo(8.57);
		expect(result.y).toBeCloseTo(7.34);
	});

	test('rotation min (ignored) & rotation step', () => {
		const result = Helper.constrainPointPosition(p2, [p4, p3], {
			minStroke: 0,
			maxStroke: 1000,
			minAngle: deg30,
			angleStep: deg10
		});
		// From 135° to 130°
		expect(result.x).toBeCloseTo(10.45);
		expect(result.y).toBeCloseTo(9.58);
	});
	test('rotation min (ignored) & rotation step & min length', () => {
		const result = Helper.constrainPointPosition(p2, [p4, p3], {
			minStroke: 10,
			maxStroke: 1000,
			minAngle: deg30,
			angleStep: deg10
		});
		// From 135° and 7px to 130° and 10px
		expect(result.x).toBeCloseTo(8.57);
		expect(result.y).toBeCloseTo(7.34);
	});

	test('rotation min & step', () => {
		const result = Helper.constrainPointPosition(p3, [p2, p1], {
			minStroke: 0,
			maxStroke: 1000,
			minAngle: deg40,
			angleStep: deg15
		});
		// From 21° to 45°
		expect(result.x).toBeCloseTo(19.85);
		expect(result.y).toBeCloseTo(11.85);
	});
	test('rotation min & step + max length', () => {
		const result = Helper.constrainPointPosition(p3, [p2, p1], {
			minStroke: 0,
			maxStroke: 10,
			minAngle: deg40,
			angleStep: deg15
		});
		// From 21° and 13.9px to 45° and 10px
		expect(result.x).toBeCloseTo(17.07);
		expect(result.y).toBeCloseTo(9.07);
	});
});

describe('line/torus intersections', () => {
	const i1 = Intersection.createFrom(p1);
	const i2 = Intersection.createFrom(p2);
	const i4 = Intersection.createFrom(p4);
	const line = new Line(i1, i4);
	const vertical = new Line(i1, i2);

	test('no intersections', () => {
		const result = Helper.intersectLineWithDonut(line, p2, 3, 5);
		expect(result).toHaveLength(0);
	});

	test('intersect max circle', () => {
		const result = Helper.intersectLineWithDonut(line, p2, 3, 10);
		expect(result).toHaveLength(1);
		expect(result[0]).toBeInstanceOf(Segment);
		expect(result[0].A.x).toBeCloseTo(7.94);
		expect(result[0].A.y).toBeCloseTo(0.21);
		expect(result[0].B.x).toBeCloseTo(19.98);
		expect(result[0].B.y).toBeCloseTo(10.65);
	});

	test('intersect both circles', () => {
		const result = Helper.intersectLineWithDonut(line, p2, 10, 20);
		expect(result).toHaveLength(2);
		expect(result[0]).toBeInstanceOf(Segment);
		expect(result[0].A.x).toBeCloseTo(-0.45);
		expect(result[0].A.y).toBeCloseTo(-7.05);
		expect(result[0].B.x).toBeCloseTo(7.94);
		expect(result[0].B.y).toBeCloseTo(0.21);

		expect(result[1]).toBeInstanceOf(Segment);
		expect(result[1].A.x).toBeCloseTo(28.37);
		expect(result[1].A.y).toBeCloseTo(17.92);
		expect(result[1].B.x).toBeCloseTo(19.98);
		expect(result[1].B.y).toBeCloseTo(10.65);
	});

	test('vertical intersect max circle', () => {
		const result = Helper.intersectLineWithDonut(vertical, p3, 3, 10);
		expect(result).toHaveLength(1);
		expect(result[0]).toBeInstanceOf(Segment);
		expect(result[0].A.x).toBeCloseTo(10);
		expect(result[0].A.y).toBeCloseTo(6.34);
		expect(result[0].B.x).toBeCloseTo(10);
		expect(result[0].B.y).toBeCloseTo(23.66);
	});
	test('vertical tangent to max circle', () => {
		const result = Helper.intersectLineWithDonut(vertical, p3, 3, 5);
		expect(result).toHaveLength(1);
		expect(result[0]).toBeInstanceOf(Point);
		expect(result[0].x).toBeCloseTo(10);
		expect(result[0].y).toBeCloseTo(15);
	});
	test('vertical tangent to min circle', () => {
		const result = Helper.intersectLineWithDonut(vertical, p3, 5, 10);
		expect(result).toHaveLength(1);

		expect(result[0]).toBeInstanceOf(Segment);
		expect(result[0].A.x).toBeCloseTo(10);
		expect(result[0].A.y).toBeCloseTo(6.34);
		expect(result[0].B.x).toBeCloseTo(10);
		expect(result[0].B.y).toBeCloseTo(23.66);
	});
	test('vertical intersect both circles', () => {
		const result = Helper.intersectLineWithDonut(vertical, p3, 10, 20);
		expect(result).toHaveLength(2);
		expect(result[0]).toBeInstanceOf(Segment);
		expect(result[0].A.x).toBeCloseTo(10);
		expect(result[0].A.y).toBeCloseTo(-4.36);
		expect(result[0].B.x).toBeCloseTo(10);
		expect(result[0].B.y).toBeCloseTo(6.34);

		expect(result[1]).toBeInstanceOf(Segment);
		expect(result[1].A.x).toBeCloseTo(10);
		expect(result[1].A.y).toBeCloseTo(34.36);
		expect(result[1].B.x).toBeCloseTo(10);
		expect(result[1].B.y).toBeCloseTo(23.66);
	});
});

describe('step Segments', () => {
	const bounds = [
		{x: 150, y: 15},
		{x: 110, y: 100},
		{x: 25, y: 100},
		{x: 0, y: 40},
		{x: 0, y: 15},
		{x: 10, y: 0},
		{x: 25, y: 0},
		{x: 40, y: 0}
	];

	const rFive = [
		{x: 30, y: 15},
		{x: 28.54, y: 18.54},
		{x: 25, y: 20},
		{x: 21.46, y: 18.54},
		{x: 20, y: 15},
		{x: 21.46, y: 11.46},
		{x: 25, y: 10},
		{x: 28.54, y: 11.46}
	];

	test('free', () => {
		const result = Helper.getStepSegments([p4], undefined, {
			minStroke: 0,
			maxStroke: 1000,
			minAngle: 0,
			angleStep: deg45,
			drawingSize: {x: 150, y: 100}
		});

		expect(result).toHaveLength(4);
		expect(result[0].A.x).toBeCloseTo(bounds[0].x);
		expect(result[0].A.y).toBeCloseTo(bounds[0].y);
		expect(result[0].B.x).toBeCloseTo(bounds[4].x);
		expect(result[0].B.y).toBeCloseTo(bounds[4].y);

		expect(result[1].A.x).toBeCloseTo(bounds[1].x);
		expect(result[1].A.y).toBeCloseTo(bounds[1].y);
		expect(result[1].B.x).toBeCloseTo(bounds[5].x);
		expect(result[1].B.y).toBeCloseTo(bounds[5].y);

		expect(result[2].A.x).toBeCloseTo(bounds[2].x);
		expect(result[2].A.y).toBeCloseTo(bounds[2].y);
		expect(result[2].B.x).toBeCloseTo(bounds[6].x);
		expect(result[2].B.y).toBeCloseTo(bounds[6].y);

		expect(result[3].A.x).toBeCloseTo(bounds[3].x);
		expect(result[3].A.y).toBeCloseTo(bounds[3].y);
		expect(result[3].B.x).toBeCloseTo(bounds[7].x);
		expect(result[3].B.y).toBeCloseTo(bounds[7].y);
	});

	test('max', () => {
		const result = Helper.getStepSegments([p4], undefined, {
			minStroke: 0,
			maxStroke: 5,
			minAngle: 0,
			angleStep: deg45,
			drawingSize: {x: 150, y: 100}
		});

		expect(result).toHaveLength(4);
		expect(result[0].A.x).toBeCloseTo(rFive[0].x);
		expect(result[0].A.y).toBeCloseTo(rFive[0].y);
		expect(result[0].B.x).toBeCloseTo(rFive[4].x);
		expect(result[0].B.y).toBeCloseTo(rFive[4].y);

		expect(result[1].A.x).toBeCloseTo(rFive[1].x);
		expect(result[1].A.y).toBeCloseTo(rFive[1].y);
		expect(result[1].B.x).toBeCloseTo(rFive[5].x);
		expect(result[1].B.y).toBeCloseTo(rFive[5].y);

		expect(result[2].A.x).toBeCloseTo(rFive[2].x);
		expect(result[2].A.y).toBeCloseTo(rFive[2].y);
		expect(result[2].B.x).toBeCloseTo(rFive[6].x);
		expect(result[2].B.y).toBeCloseTo(rFive[6].y);

		expect(result[3].A.x).toBeCloseTo(rFive[3].x);
		expect(result[3].A.y).toBeCloseTo(rFive[3].y);
		expect(result[3].B.x).toBeCloseTo(rFive[7].x);
		expect(result[3].B.y).toBeCloseTo(rFive[7].y);
	});

	test('min', () => {
		const result = Helper.getStepSegments([p4], undefined, {
			minStroke: 5,
			maxStroke: 1000,
			minAngle: 0,
			angleStep: deg45,
			drawingSize: {x: 150, y: 100}
		});

		expect(result).toHaveLength(8);

		expect(result[0].A.x).toBeCloseTo(bounds[0].x);
		expect(result[0].A.y).toBeCloseTo(bounds[0].y);
		expect(result[0].B.x).toBeCloseTo(rFive[0].x);
		expect(result[0].B.y).toBeCloseTo(rFive[0].y);
		expect(result[1].A.x).toBeCloseTo(rFive[4].x);
		expect(result[1].A.y).toBeCloseTo(rFive[4].y);
		expect(result[1].B.x).toBeCloseTo(bounds[4].x);
		expect(result[1].B.y).toBeCloseTo(bounds[4].y);

		expect(result[2].A.x).toBeCloseTo(bounds[1].x);
		expect(result[2].A.y).toBeCloseTo(bounds[1].y);
		expect(result[2].B.x).toBeCloseTo(rFive[1].x);
		expect(result[2].B.y).toBeCloseTo(rFive[1].y);
		expect(result[3].A.x).toBeCloseTo(rFive[5].x);
		expect(result[3].A.y).toBeCloseTo(rFive[5].y);
		expect(result[3].B.x).toBeCloseTo(bounds[5].x);
		expect(result[3].B.y).toBeCloseTo(bounds[5].y);

		expect(result[4].A.x).toBeCloseTo(bounds[2].x);
		expect(result[4].A.y).toBeCloseTo(bounds[2].y);
		expect(result[4].B.x).toBeCloseTo(rFive[2].x);
		expect(result[4].B.y).toBeCloseTo(rFive[2].y);
		expect(result[5].A.x).toBeCloseTo(rFive[6].x);
		expect(result[5].A.y).toBeCloseTo(rFive[6].y);
		expect(result[5].B.x).toBeCloseTo(bounds[6].x);
		expect(result[5].B.y).toBeCloseTo(bounds[6].y);

		expect(result[6].A.x).toBeCloseTo(bounds[3].x);
		expect(result[6].A.y).toBeCloseTo(bounds[3].y);
		expect(result[6].B.x).toBeCloseTo(rFive[3].x);
		expect(result[6].B.y).toBeCloseTo(rFive[3].y);
		expect(result[7].A.x).toBeCloseTo(rFive[7].x);
		expect(result[7].A.y).toBeCloseTo(rFive[7].y);
		expect(result[7].B.x).toBeCloseTo(bounds[7].x);
		expect(result[7].B.y).toBeCloseTo(bounds[7].y);
	});

	test('min and max', () => {
		const result = Helper.getStepSegments([p4], undefined, {
			minStroke: 5,
			maxStroke: 60,
			minAngle: 0,
			angleStep: deg45,
			drawingSize: {x: 150, y: 100}
		});

		expect(result).toHaveLength(8);

		expect(result[0].A.x).toBeCloseTo(85);
		expect(result[0].A.y).toBeCloseTo(15);
		expect(result[0].B.x).toBeCloseTo(rFive[0].x);
		expect(result[0].B.y).toBeCloseTo(rFive[0].y);
		expect(result[1].A.x).toBeCloseTo(rFive[4].x);
		expect(result[1].A.y).toBeCloseTo(rFive[4].y);
		expect(result[1].B.x).toBeCloseTo(bounds[4].x);
		expect(result[1].B.y).toBeCloseTo(bounds[4].y);

		expect(result[2].A.x).toBeCloseTo(67.43);
		expect(result[2].A.y).toBeCloseTo(57.43);
		expect(result[2].B.x).toBeCloseTo(rFive[1].x);
		expect(result[2].B.y).toBeCloseTo(rFive[1].y);
		expect(result[3].A.x).toBeCloseTo(rFive[5].x);
		expect(result[3].A.y).toBeCloseTo(rFive[5].y);
		expect(result[3].B.x).toBeCloseTo(bounds[5].x);
		expect(result[3].B.y).toBeCloseTo(bounds[5].y);

		expect(result[4].A.x).toBeCloseTo(25);
		expect(result[4].A.y).toBeCloseTo(75);
		expect(result[4].B.x).toBeCloseTo(rFive[2].x);
		expect(result[4].B.y).toBeCloseTo(rFive[2].y);
		expect(result[5].A.x).toBeCloseTo(rFive[6].x);
		expect(result[5].A.y).toBeCloseTo(rFive[6].y);
		expect(result[5].B.x).toBeCloseTo(bounds[6].x);
		expect(result[5].B.y).toBeCloseTo(bounds[6].y);

		expect(result[6].A.x).toBeCloseTo(bounds[3].x);
		expect(result[6].A.y).toBeCloseTo(bounds[3].y);
		expect(result[6].B.x).toBeCloseTo(rFive[3].x);
		expect(result[6].B.y).toBeCloseTo(rFive[3].y);
		expect(result[7].A.x).toBeCloseTo(rFive[7].x);
		expect(result[7].A.y).toBeCloseTo(rFive[7].y);
		expect(result[7].B.x).toBeCloseTo(bounds[7].x);
		expect(result[7].B.y).toBeCloseTo(bounds[7].y);
	});

	const getAngle = function (m, n) {
		return Math.atan2(n.y - m.y, n.x - m.x);
	};

	test('minAngle 10° from horizontal', () => {
		const result = Helper.getStepSegments([p4, p3], getAngle(p4, p3), {
			minStroke: 0,
			maxStroke: 1000,
			minAngle: deg10,
			angleStep: deg45,
			drawingSize: {x: 150, y: 100}
		});

		expect(result).toHaveLength(4);
		expect(result[0].A.x).toBeCloseTo(bounds[0].x);
		expect(result[0].A.y).toBeCloseTo(bounds[0].y);
		expect(result[0].B).toBe(p4);

		expect(result[1].A.x).toBeCloseTo(bounds[1].x);
		expect(result[1].A.y).toBeCloseTo(bounds[1].y);
		expect(result[1].B.x).toBeCloseTo(bounds[5].x);
		expect(result[1].B.y).toBeCloseTo(bounds[5].y);

		expect(result[2].A.x).toBeCloseTo(bounds[2].x);
		expect(result[2].A.y).toBeCloseTo(bounds[2].y);
		expect(result[2].B.x).toBeCloseTo(bounds[6].x);
		expect(result[2].B.y).toBeCloseTo(bounds[6].y);

		expect(result[3].A.x).toBeCloseTo(bounds[3].x);
		expect(result[3].A.y).toBeCloseTo(bounds[3].y);
		expect(result[3].B.x).toBeCloseTo(bounds[7].x);
		expect(result[3].B.y).toBeCloseTo(bounds[7].y);
	});

	test('min & max & minAngle 10° from horizontal', () => {
		const result = Helper.getStepSegments([p4, p3], getAngle(p4, p3), {
			minStroke: 5,
			maxStroke: 60,
			minAngle: deg10,
			angleStep: deg45,
			drawingSize: {x: 150, y: 100}
		});

		expect(result).toHaveLength(7);

		expect(result[0].A.x).toBeCloseTo(85);
		expect(result[0].A.y).toBeCloseTo(15);
		expect(result[0].B.x).toBeCloseTo(rFive[0].x);
		expect(result[0].B.y).toBeCloseTo(rFive[0].y);

		// The segment rFive[4] > bounds[4] is in dead angle

		expect(result[1].A.x).toBeCloseTo(67.43);
		expect(result[1].A.y).toBeCloseTo(57.43);
		expect(result[1].B.x).toBeCloseTo(rFive[1].x);
		expect(result[1].B.y).toBeCloseTo(rFive[1].y);
		expect(result[2].A.x).toBeCloseTo(rFive[5].x);
		expect(result[2].A.y).toBeCloseTo(rFive[5].y);
		expect(result[2].B.x).toBeCloseTo(bounds[5].x);
		expect(result[2].B.y).toBeCloseTo(bounds[5].y);

		expect(result[3].A.x).toBeCloseTo(25);
		expect(result[3].A.y).toBeCloseTo(75);
		expect(result[3].B.x).toBeCloseTo(rFive[2].x);
		expect(result[3].B.y).toBeCloseTo(rFive[2].y);
		expect(result[4].A.x).toBeCloseTo(rFive[6].x);
		expect(result[4].A.y).toBeCloseTo(rFive[6].y);
		expect(result[4].B.x).toBeCloseTo(bounds[6].x);
		expect(result[4].B.y).toBeCloseTo(bounds[6].y);

		expect(result[5].A.x).toBeCloseTo(bounds[3].x);
		expect(result[5].A.y).toBeCloseTo(bounds[3].y);
		expect(result[5].B.x).toBeCloseTo(rFive[3].x);
		expect(result[5].B.y).toBeCloseTo(rFive[3].y);
		expect(result[6].A.x).toBeCloseTo(rFive[7].x);
		expect(result[6].A.y).toBeCloseTo(rFive[7].y);
		expect(result[6].B.x).toBeCloseTo(bounds[7].x);
		expect(result[6].B.y).toBeCloseTo(bounds[7].y);
	});

	test('min & max & minAngle 30° from P2>P4', () => {
		const result = Helper.getStepSegments([p4, p2], getAngle(p4, p2), {
			minStroke: 5,
			maxStroke: 60,
			minAngle: deg30,
			angleStep: deg45,
			drawingSize: {x: 150, y: 100}
		});

		expect(result).toHaveLength(6);

		expect(result[0].A.x).toBeCloseTo(85);
		expect(result[0].A.y).toBeCloseTo(15);
		expect(result[0].B.x).toBeCloseTo(rFive[0].x);
		expect(result[0].B.y).toBeCloseTo(rFive[0].y);

		// The segment rFive[4] > bounds[4] is in dead angle

		expect(result[1].A.x).toBeCloseTo(67.43);
		expect(result[1].A.y).toBeCloseTo(57.43);
		expect(result[1].B.x).toBeCloseTo(rFive[1].x);
		expect(result[1].B.y).toBeCloseTo(rFive[1].y);

		// The segment rFive[5] > bounds[5] is in dead angle

		expect(result[2].A.x).toBeCloseTo(25);
		expect(result[2].A.y).toBeCloseTo(75);
		expect(result[2].B.x).toBeCloseTo(rFive[2].x);
		expect(result[2].B.y).toBeCloseTo(rFive[2].y);
		expect(result[3].A.x).toBeCloseTo(rFive[6].x);
		expect(result[3].A.y).toBeCloseTo(rFive[6].y);
		expect(result[3].B.x).toBeCloseTo(bounds[6].x);
		expect(result[3].B.y).toBeCloseTo(bounds[6].y);

		expect(result[4].A.x).toBeCloseTo(bounds[3].x);
		expect(result[4].A.y).toBeCloseTo(bounds[3].y);
		expect(result[4].B.x).toBeCloseTo(rFive[3].x);
		expect(result[4].B.y).toBeCloseTo(rFive[3].y);
		expect(result[5].A.x).toBeCloseTo(rFive[7].x);
		expect(result[5].A.y).toBeCloseTo(rFive[7].y);
		expect(result[5].B.x).toBeCloseTo(bounds[7].x);
		expect(result[5].B.y).toBeCloseTo(bounds[7].y);
	});
});

/* TODO
getIntersectionsWithAngleSteps
getIntersectionsWithAllowedRegion
getContrainedSnappingElements
*/
