import {Point} from '../../src/core/Point';
import {equiv} from '../../src/core/Helpers/MathHelpers';
import * as Helper from '../../src/core/Helpers/GeometryHelpers';

describe('Point class', () => {
	test('default constructor', () => {
		const p = new Point();
		expect(p).toEqual({x: 0, y: 0});
	});

	test('constructor', () => {
		const p = new Point(1, 2);
		expect(p).toEqual({x: 1, y: 2});
	});

	const p1 = new Point(10, 2);
	const p2 = new Point(10, 10);
	const p3 = new Point(15, 15);
	const p4 = new Point(25, 15);

	test('computes distance', () => {
		expect(p2.getSquaredDistanceTo(p3)).toBeCloseTo(50);
	});

	test('computes distance verticaly', () => {
		expect(p1.getSquaredDistanceTo(p2)).toBeCloseTo(64);
	});

	test('computes distance horizontaly', () => {
		expect(p3.getSquaredDistanceTo(p4)).toBeCloseTo(100);
	});
});

describe('equiv', () => {
	test('same numbers', () => {
		expect(equiv(123.4, 123.4)).toBeTruthy();
	});

	test('close numbers', () => {
		expect(equiv(12.3456, 12.3457)).toBeTruthy();
	});

	test('different numbers', () => {
		expect(equiv(12.3456, 12.456)).toBeFalsy();
	});
});

describe('isFormClockwiseOriented', () => {
	const A = {x: 0, y: 0};
	const B = {x: 30, y: 30};
	const C = {x: 60, y: 40};
	const D = {x: 50, y: 15};
	const E = {x: 50, y: 15};

	test('ABC convex', () => {
		expect(Helper.isFormClockwiseOriented([A, B, C])).toBeFalsy();
		expect(Helper.isFormClockwiseOriented([B, C, A])).toBeFalsy();
		expect(Helper.isFormClockwiseOriented([C, A, B])).toBeFalsy();
	});

	test('ABCD convex', () => {
		expect(Helper.isFormClockwiseOriented([A, B, C, D])).toBeFalsy();
		expect(Helper.isFormClockwiseOriented([B, C, D, A])).toBeFalsy();
		expect(Helper.isFormClockwiseOriented([C, D, A, B])).toBeFalsy();
		expect(Helper.isFormClockwiseOriented([D, A, B, C])).toBeFalsy();
	});

	test('ABCDE concave', () => {
		expect(Helper.isFormClockwiseOriented([A, B, C, D, E])).toBeFalsy();
		expect(Helper.isFormClockwiseOriented([B, C, D, E, A])).toBeFalsy();
		expect(Helper.isFormClockwiseOriented([C, D, E, A, B])).toBeFalsy();
		expect(Helper.isFormClockwiseOriented([D, E, A, B, C])).toBeFalsy();
		expect(Helper.isFormClockwiseOriented([E, A, B, C, D])).toBeFalsy();
	});

	test('CBA convex', () => {
		expect(Helper.isFormClockwiseOriented([C, B, A])).toBeTruthy();
		expect(Helper.isFormClockwiseOriented([B, A, C])).toBeTruthy();
		expect(Helper.isFormClockwiseOriented([A, C, B])).toBeTruthy();
	});

	test('DCBA convex', () => {
		expect(Helper.isFormClockwiseOriented([D, C, B, A])).toBeTruthy();
		expect(Helper.isFormClockwiseOriented([C, B, A, D])).toBeTruthy();
		expect(Helper.isFormClockwiseOriented([B, A, D, C])).toBeTruthy();
		expect(Helper.isFormClockwiseOriented([A, D, C, B])).toBeTruthy();
	});

	test('EDCBA concave', () => {
		expect(Helper.isFormClockwiseOriented([E, D, C, B, A])).toBeTruthy();
		expect(Helper.isFormClockwiseOriented([D, C, B, A, E])).toBeTruthy();
		expect(Helper.isFormClockwiseOriented([C, B, A, E, D])).toBeTruthy();
		expect(Helper.isFormClockwiseOriented([B, A, E, D, C])).toBeTruthy();
		expect(Helper.isFormClockwiseOriented([A, E, D, C, B])).toBeTruthy();
	});
});

describe('moveSegmentOutside', () => {
	const A = {x: 10, y: 10};
	const B = {x: 30, y: 30};
	const C = {x: 30, y: 10};

	test('return type', () => {
		const S = Helper.moveSegmentOutside(A, B, 10 * Math.sqrt(2));
		expect(S).toBeDefined();
		expect(S.A2).toBeInstanceOf(Point);
		expect(S.B2).toBeInstanceOf(Point);
	});

	test('AB : regular', () => {
		const {A2, B2} = Helper.moveSegmentOutside(A, B, 10 * Math.sqrt(2));
		expect(A2).toMatchObject({x: 20, y: 0});
		expect(B2).toMatchObject({x: 40, y: 20});
	});
	test('BA : regular', () => {
		const {A2, B2} = Helper.moveSegmentOutside(B, A, 10 * Math.sqrt(2));
		expect(A2).toMatchObject({x: 20, y: 40});
		expect(B2).toMatchObject({x: 0, y: 20});
	});
	test('AC : horizontal', () => {
		const {A2, B2} = Helper.moveSegmentOutside(A, C, 10);
		expect(A2).toMatchObject({x: 10, y: 0});
		expect(B2).toMatchObject({x: 30, y: 0});
	});
	test('CA : horizontal', () => {
		const {A2, B2} = Helper.moveSegmentOutside(C, A, 10);
		expect(A2).toMatchObject({x: 30, y: 20});
		expect(B2).toMatchObject({x: 10, y: 20});
	});
	test('BC : vertical', () => {
		const {A2, B2} = Helper.moveSegmentOutside(B, C, 10);
		expect(A2.x).toBeCloseTo(20);
		expect(A2.y).toBeCloseTo(30);
		expect(B2.x).toBeCloseTo(20);
		expect(B2.y).toBeCloseTo(10);
	});
	test('CB : vertical', () => {
		const {A2, B2} = Helper.moveSegmentOutside(C, B, 10);
		expect(A2.x).toBeCloseTo(40);
		expect(A2.y).toBeCloseTo(10);
		expect(B2.x).toBeCloseTo(40);
		expect(B2.y).toBeCloseTo(30);
	});
});

describe('getIntersection', () => {
	const O = {x: 0, y: 0};
	const A = {x: 10, y: 10};
	const B = {x: 30, y: 30};
	const C = {x: 30, y: 10};
	const D = {x: 10, y: 30};
	const E = {x: 19, y: 19};
	const F = {x: 35, y: 35};
	const G = {x: 40, y: 30};
	const H = {x: 50, y: 30};

	test('return type', () => {
		const result = Helper.getIntersection(A, B, C, D);
		expect(result).toBeInstanceOf(Point);
	});
	test('AB X CD', () => {
		const result = Helper.getIntersection(A, B, C, D);
		expect(result.x).toBeCloseTo(20);
		expect(result.y).toBeCloseTo(20);
	});
	test('OB X AD', () => {
		const result = Helper.getIntersection(O, B, A, D);
		expect(result.x).toBeCloseTo(10);
		expect(result.y).toBeCloseTo(10);
	});
	test('AB X AD', () => {
		const result = Helper.getIntersection(A, B, A, D);
		expect(result.x).toBeCloseTo(10);
		expect(result.y).toBeCloseTo(10);
	});
	test('AC X AD', () => {
		const result = Helper.getIntersection(A, C, A, D);
		expect(result.x).toBeCloseTo(10);
		expect(result.y).toBeCloseTo(10);
	});

	test('AB X CG : out of segments', () => {
		const result = Helper.getIntersection(A, B, C, G, true);
		expect(result).not.toBeDefined();
	});
	test('AB X CH : parallels', () => {
		const result = Helper.getIntersection(A, B, C, H);
		expect(result).not.toBeDefined();
	});
	test('AB X EF : collinears', () => {
		const result = Helper.getIntersection(A, B, E, F);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(2);
		expect(result[0]).toBe(E);
		expect(result[1]).toBe(B);
	});
});
