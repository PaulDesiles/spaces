import {Point} from '../../../src/core/Point';
import {Intersection} from '../../../src/core/Intersection';
import {Line} from '../../../src/core/Line';
import * as Helper from '../../../src/core/Helpers/GeometryHelpers';

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
	const I = {x: 30, y: 0};

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
		expect(result).toBe(A);
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
	test('AB X EF : collinears (line)', () => {
		const result = Helper.getIntersection(A, B, E, F);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(2);
		expect(result[0]).toBe(A);
		expect(result[1]).toBe(B);
	});
	test('AB X EF : collinears (segment)', () => {
		const result = Helper.getIntersection(A, B, E, F, true);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(2);
		expect(result[0]).toBe(E);
		expect(result[1]).toBe(B);
	});
	test('DH X BG : vertical collinears', () => {
		const result = Helper.getIntersection(D, H, B, G, true);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(2);
		expect(result[0]).toBe(B);
		expect(result[1]).toBe(G);
	});
	test('IC X BC : horizontal collinears', () => {
		const result = Helper.getIntersection(I, C, B, C, true);
		expect(result).toBe(C);
	});
	test('IB X BC : horizontal collinears', () => {
		const result = Helper.getIntersection(I, B, B, C, true);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(2);
		expect(result[0]).toBe(C);
		expect(result[1]).toBe(B);
	});
	test('BI X BC : horizontal collinears', () => {
		const result = Helper.getIntersection(B, I, B, C, true);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(2);
		expect(result[0]).toBe(B);
		expect(result[1]).toBe(C);
	});
	test('Nearly vertical collinears', () => {
		const X1 = {x: 25.000000000000004, y: 75};
		const X2 = {x: 25, y: 20};
		const X3 = {x: 25, y: 0};
		const X4 = {x: 25, y: 100};

		const result = Helper.getIntersection(X1, X2, X3, X4, true);
		expect(result).toHaveLength(2);
		expect(result[0]).toBe(X1);
		expect(result[1]).toBe(X2);
	});
});

describe('isInsideBounds', () => {
	test('inside', () => {
		const p = {x: 20, y: 30};
		const isInside = Helper.isInsideBounds(p, 100, 100);
		expect(isInside).toBeTruthy();
	});
	test('outside X', () => {
		const p = {x: 120, y: 30};
		const isInside = Helper.isInsideBounds(p, 100, 100);
		expect(isInside).toBeFalsy();
	});
	test('outside Y', () => {
		const p = {x: 20, y: 130};
		const isInside = Helper.isInsideBounds(p, 100, 100);
		expect(isInside).toBeFalsy();
	});
	test('outside both', () => {
		const p = {x: 120, y: 130};
		const isInside = Helper.isInsideBounds(p, 100, 100);
		expect(isInside).toBeFalsy();
	});
});

describe('line/circle intersections', () => {
	const A = new Intersection(3, 7);
	const B = new Intersection(6, 4);
	const C = new Intersection(7, 2);
	const D = new Intersection(2, 2);
	const E = new Intersection(6, 12);
	const F = new Intersection(0, 4);
	const size = 1000;

	test('BC & circle(A,3)', () => {
		const l = new Line(B, C, size, size);
		const result = Helper.intersectLineWithCircle(l, A, 3);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(3);
		expect(result[0].y).toBeCloseTo(10);
		expect(result[1].x).toBeCloseTo(5.4);
		expect(result[1].y).toBeCloseTo(5.2);
	});
	test('BC & circle(A,5)', () => {
		const l = new Line(B, C, size, size);
		const result = Helper.intersectLineWithCircle(l, A, 5);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(2.05);
		expect(result[0].y).toBeCloseTo(11.91);
		expect(result[1].x).toBeCloseTo(6.35);
		expect(result[1].y).toBeCloseTo(3.29);
	});
	test('BC & circle(A,10)', () => {
		const l = new Line(B, C, size, size);
		const result = Helper.intersectLineWithCircle(l, A, 10);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(-0.23);
		expect(result[0].y).toBeCloseTo(16.46);
		expect(result[1].x).toBeCloseTo(8.63);
		expect(result[1].y).toBeCloseTo(-1.26);
	});
	test('BD & circle(A,3) : out', () => {
		const l = new Line(B, D, size, size);
		const result = Helper.intersectLineWithCircle(l, A, 3);
		expect(result).toHaveLength(0);
	});
	test('BF & circle(A,4): horizontal', () => {
		const l = new Line(B, F, size, size);
		const result = Helper.intersectLineWithCircle(l, A, 3.5);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(1.2);
		expect(result[0].y).toBeCloseTo(4);
		expect(result[1].x).toBeCloseTo(4.8);
		expect(result[1].y).toBeCloseTo(4);
	});
	test('BE & circle(A,3): vertical tangent', () => {
		const l = new Line(B, E, size, size);
		const result = Helper.intersectLineWithCircle(l, A, 3);
		expect(result).toHaveLength(1);
		expect(result[0].x).toBeCloseTo(6);
		expect(result[0].y).toBeCloseTo(7);
	});
});
