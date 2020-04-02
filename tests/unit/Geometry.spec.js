import {initBounds, Point, Intersection, Line, Shape} from '@/components/Geometry.js';

const size = 1000;
beforeAll(() => {
	initBounds(size, size);
});

describe('Point class', () => {
	test('default constructor', () => {
		const p = new Point();
		expect(p).toEqual({x: 0, y: 0});
	});

	test('constructor', () => {
		const p = new Point(1, 2);
		expect(p).toEqual({x: 1, y: 2});
	});

	test('computes distance', () => {
		const p1 = new Point(10, 2);
		const p2 = new Point(10, 10);
		const p3 = new Point(15, 15);
		expect(p1.getSquaredDistanceTo(p2)).toBeCloseTo(8 * 8);
		expect(p2.getSquaredDistanceTo(p3)).toBeCloseTo(50);
	});
});

describe('Intersection class', () => {
	test('extends Point', () => {
		expect(new Intersection()).toBeInstanceOf(Point);
	});

	test('id generation', () => {
		const i1 = new Intersection(10, 10);
		const i2 = new Intersection(15, 15);
		expect(i1.id).toBeDefined();
		expect(i2.id).toBeDefined();
		expect(i1.id).not.toBe(i2.id);
	});

	test('crossing lines array', () => {
		const i = new Intersection(10, 10);
		expect(i.crossingLines).toBeInstanceOf(Array);
		expect(i.crossingLines.length).toBe(0);
	});

	test('bounds', () => {
		const i1 = new Intersection(10, 10);
		const i2 = new Intersection(2000, 200);
		expect(i1.insideBounds).toBeTruthy();
		expect(i2.insideBounds).toBeFalsy();
	});

	test('conversion from point', () => {
		const p = new Point(10, 10);
		const i = Intersection.createFrom(p);
		expect(i).toMatchObject({x: 10, y: 10});
		expect(i.id).toBeDefined();
	});
});

describe('Line class', () => {
	const A = new Intersection(20, 10);
	const B = new Intersection(20, 50);
	const C = new Intersection(30, 130);
	const D = new Intersection(10, 140);
	const l1 = new Line(A, B);
	const l2 = new Line(C, D);

	test('id generation', () => {
		expect(l1.id).toBeDefined();
		expect(l2.id).toBeDefined();
		expect(l1.id).not.toBe(l2.id);
	});

	test('line/point relations', () => {
		expect(l1.intersections).toContain(A);
		expect(l1.intersections).toContain(B);
		expect(A.crossingLines).toContain(l1);
		expect(B.crossingLines).toContain(l1);
	});

	test('parallels array', () => {
		expect(l1.parallels).toBeInstanceOf(Array);
		expect(l1.parallels.length).toBe(0);
	});

	test('function y(x)', () => {
		expect(l1.y).toBeInstanceOf(Function);

		expect(l1.y(100)).toBeDefined();
		expect(l1.y(100)).toBe(Infinity);

		expect(l2.y(90)).toBeDefined();
		expect(l2.y(90)).toBe(100);
	});

	test('function x(y)', () => {
		expect(l1.x).toBeInstanceOf(Function);

		expect(l1.x(20)).toBeDefined();
		expect(l1.x(20)).toBe(20);

		expect(l2.x(100)).toBeDefined();
		expect(l2.x(100)).toBe(90);
	});

	test('bounds', () => {
		expect(l1.bounds).toBeInstanceOf(Array);
		expect(l1.bounds.length).toBe(2);

		const isOnBounds = b =>
			b.x === 0 ||
			b.x === size ||
			b.y === 0 ||
			b.y === size;

		expect(l1.bounds.every(isOnBounds)).toBeTruthy();
		expect(l2.bounds.every(isOnBounds)).toBeTruthy();
	});

	test('linkParallelLines', () => {
		const l3 = new Line(new Intersection(40, 40), new Intersection(40, 60));
		expect(Line.linkParallelLines).toBeInstanceOf(Function);

		Line.linkParallelLines(l1, l3);
		expect(l1.parallels).toContain(l3);
		expect(l3.parallels).toContain(l1);
	});

	test('includes', () => {
		expect(l1.includes).toBeInstanceOf(Function);
		expect(l1.includes(A)).toBeTruthy();
		expect(l1.includes(B)).toBeTruthy();
		expect(l1.includes(C)).toBeFalsy();
		expect(l1.includes(D)).toBeFalsy();

		expect(l1.includes(new Point(20, 400))).toBeTruthy();
		expect(l2.includes(new Point(90, 100))).toBeTruthy();
	});

	test('getProjection', () => {
		expect(l1.getProjection).toBeInstanceOf(Function);

		expect(l1.getProjection(new Point(20, 400))).toMatchObject({x: 20, y: 400});
		expect(l1.getProjection(new Point(40, 200))).toMatchObject({x: 20, y: 200});

		expect(l2.getProjection(new Point(90, 100))).toMatchObject({x: 90, y: 100});
		expect(l2.getProjection(new Point(30, 80))).toMatchObject({x: 50, y: 120});
	});

	test('getKnownIntersectionWith', () => {
		const l3 = new Line(B, C);
		expect(l1.getKnownIntersectionWith).toBeInstanceOf(Function);
		expect(l1.getKnownIntersectionWith(l2)).toBeUndefined();
		expect(l1.getKnownIntersectionWith(l3)).toBe(B);
	});

	test('getOrCreateIntersectionWith', () => {
		expect(l1.getKnownIntersectionWith).toBeInstanceOf(Function);
		expect(l1.getKnownIntersectionWith(l2)).toBeUndefined();
		expect(l1.getOrCreateIntersectionWith(l2)).toMatchObject({x: 20, y: 135});
	});
});

/*
describe('', () => {
	test('', () => {
		expect().toBe();
	});
});
*/
