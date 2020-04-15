import {Intersection, Line} from '../../src/components/Geometry';
import {resolve2ndDegreePolynom, intersectLineWithCircle} from '../../src/components/Constraint';

describe('polynom resolution', () => {
	test('x²+2x+1', () => {
		const result = resolve2ndDegreePolynom(1, 2, 1);
		expect(result).toHaveLength(1);
		expect(result[0]).toBe(-1);
	});
	test('3x²+5x+7', () => {
		const result = resolve2ndDegreePolynom(3, 5, 7);
		expect(result).toHaveLength(0);
	});
	test('4x²+4x+1', () => {
		const result = resolve2ndDegreePolynom(4, 4, 1);
		expect(result).toHaveLength(1);
		expect(result[0]).toBeCloseTo(-0.5);
	});
	test('2x²+9x-5', () => {
		const result = resolve2ndDegreePolynom(2, 9, -5);
		expect(result).toHaveLength(2);
		expect(result[0]).toBeCloseTo(-5);
		expect(result[1]).toBeCloseTo(0.5);
	});
	test('-x²+2x+3', () => {
		const result = resolve2ndDegreePolynom(-1, 2, 3);
		expect(result).toHaveLength(2);
		expect(result[0]).toBeCloseTo(3);
		expect(result[1]).toBeCloseTo(-1);
	});
});

describe('line/circle intersections', () => {
	const A = new Intersection(3, 7);
	const B = new Intersection(6, 4);
	const C = new Intersection(7, 2);
	const D = new Intersection(2, 2);
	const E = new Intersection(6, 12);
	const F = new Intersection(0, 4);

	test('BC & circle(A,3)', () => {
		const result = intersectLineWithCircle(new Line(B, C), A, 3);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(3);
		expect(result[0].y).toBeCloseTo(10);
		expect(result[1].x).toBeCloseTo(5.4);
		expect(result[1].y).toBeCloseTo(5.2);
	});
	test('BC & circle(A,5)', () => {
		const result = intersectLineWithCircle(new Line(B, C), A, 5);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(2.05);
		expect(result[0].y).toBeCloseTo(11.91);
		expect(result[1].x).toBeCloseTo(6.35);
		expect(result[1].y).toBeCloseTo(3.29);
	});
	test('BC & circle(A,10)', () => {
		const result = intersectLineWithCircle(new Line(B, C), A, 10);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(-0.23);
		expect(result[0].y).toBeCloseTo(16.46);
		expect(result[1].x).toBeCloseTo(8.63);
		expect(result[1].y).toBeCloseTo(-1.26);
	});
	test('BD & circle(A,3) : out', () => {
		const result = intersectLineWithCircle(new Line(B, D), A, 3);
		expect(result).toHaveLength(0);
	});
	test('BF & circle(A,4): horizontal', () => {
		const l = new Line(B, F);
		const result = intersectLineWithCircle(l, A, 3.5);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(1.2);
		expect(result[0].y).toBeCloseTo(4);
		expect(result[1].x).toBeCloseTo(4.8);
		expect(result[1].y).toBeCloseTo(4);
	});
	test('BE & circle(A,3): vertical tangent', () => {
		const l = new Line(B, E);
		const result = intersectLineWithCircle(l, A, 3);
		expect(result).toHaveLength(1);
		expect(result[0].x).toBeCloseTo(6);
		expect(result[0].y).toBeCloseTo(7);
	});
});

