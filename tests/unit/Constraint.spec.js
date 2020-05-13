import {Point} from '../../src/core/Point';
import {constrainDistance, constrainAngle} from '../../src/core/Constraint';

describe('constrain point in distance bounds', () => {
	const p1 = new Point(10, 2);
	const p2 = new Point(10, 10);
	const p3 = new Point(15, 15);

	test('constrain distance : in bounds', () => {
		expect(constrainDistance(p2, p3, 2, 10)).toBe(p3);
	});

	test('constrain distance : min', () => {
		const p = constrainDistance(p2, p3, 7 * Math.sqrt(2), 100);
		expect(p.x).toBeCloseTo(17);
		expect(p.y).toBeCloseTo(17);
	});

	test('constrain distance : max', () => {
		const p = constrainDistance(p2, p3, 1, 2 * Math.sqrt(2));
		expect(p.x).toBeCloseTo(12);
		expect(p.y).toBeCloseTo(12);
	});

	test('constrain distance with itself', () => {
		const p = constrainDistance(p2, p2, 3, 5);
		expect(p.x).toBeCloseTo(10);
		expect(p.y).toBeCloseTo(7);
	});

	test('constrain rotation : void params', () => {
		const result = constrainAngle(p2, p3, p1, 0, 0);
		expect(result).toBe(p3);
	});
});

describe('constrain point in angle bounds', () => {
	const p1 = new Point(10, 2);
	const p2 = new Point(10, 10);
	const p3 = new Point(15, 15);
	const p4 = new Point(25, 15);
	const deg10 = Math.PI / 18;
	const deg15 = Math.PI / 12;
	const deg30 = Math.PI / 6;
	const deg40 = Math.PI / 4.5;
	const deg45 = Math.PI / 4;

	test('constrain rotation : min', () => {
		const result = constrainAngle(p1, p4, p3, deg45, 0);
		// From 28° to 45°
		expect(result.x).toBeCloseTo(28.14);
		expect(result.y).toBeCloseTo(10.06);
	});

	test('constrain rotation : step', () => {
		const result = constrainAngle(p3, p2, undefined, 0, deg10);
		// From 45° (to X axis) to 40°
		expect(result.x).toBeCloseTo(10.45);
		expect(result.y).toBeCloseTo(9.58);
	});

	test('constrain rotation : min (ignored) & step', () => {
		const result = constrainAngle(p3, p2, p4, deg30, deg10);
		// From 135° to 130°
		expect(result.x).toBeCloseTo(10.45);
		expect(result.y).toBeCloseTo(9.58);
	});

	test('constrain rotation : min & step', () => {
		const result = constrainAngle(p1, p3, p2, deg40, deg15);
		// From 21° to 45°
		expect(result.x).toBeCloseTo(19.85);
		expect(result.y).toBeCloseTo(11.85);
	});
});
