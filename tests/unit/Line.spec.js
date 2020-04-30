import {initBounds, Point, Intersection, Line} from '../../src/model/Geometry';

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
		expect(l1.parallels).toHaveLength(0);
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

	// Old Bounds Tests
	// test('bounds', () => {
	// 	expect(l1.bounds).toBeInstanceOf(Array);
	// 	expect(l1.bounds).toHaveLength(2);

	// 	const isOnBounds = b =>
	// 		b.x === 0 ||
	// 		b.x === 1000 ||
	// 		b.y === 0 ||
	// 		b.y === 1000;

	// 	expect(l1.bounds.every(isOnBounds)).toBeTruthy();
	// 	expect(l2.bounds.every(isOnBounds)).toBeTruthy();
	// });

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

describe('Line Bounds', () => {
	initBounds({x:1000, y:1000});
	const A = new Intersection(10, 10);
	const B = new Intersection(30, 30);
	const C = new Intersection(30, 10);
	const D = new Intersection(10, 30);

	const AB = new Line(A, B);
	const AC = new Line(A, C);
	const AD = new Line(A, D);

	test('return type', () => {
		expect(AB.bounds).toBeInstanceOf(Array);
		expect(AB.bounds).toHaveLength(2);
		expect(AB.bounds[0]).toBeInstanceOf(Point);
		expect(AB.bounds[1]).toBeInstanceOf(Point);

		expect(AC.bounds).toHaveLength(2);
		expect(AD.bounds).toHaveLength(2);
	});
	test('AB', () => {
		expect(AB.bounds[0].x).toBeCloseTo(0);
		expect(AB.bounds[0].y).toBeCloseTo(0);
		expect(AB.bounds[1].x).toBeCloseTo(1000);
		expect(AB.bounds[1].y).toBeCloseTo(1000);
	});
	test('AC', () => {
		expect(AC.bounds[0].x).toBeCloseTo(0);
		expect(AC.bounds[0].y).toBeCloseTo(10);
		expect(AC.bounds[1].x).toBeCloseTo(1000);
		expect(AC.bounds[1].y).toBeCloseTo(10);
	});
	test('AD', () => {
		expect(AD.bounds[0].x).toBeCloseTo(10);
		expect(AD.bounds[0].y).toBeCloseTo(0);
		expect(AD.bounds[1].x).toBeCloseTo(10);
		expect(AD.bounds[1].y).toBeCloseTo(1000);
	});
});
