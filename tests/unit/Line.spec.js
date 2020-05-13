import {Point} from '../../src/core/Point';
import {Intersection} from '../../src/core/Intersection';
import {Line} from '../../src/core/Line';

const size = 1000;
const A = new Intersection(20, 10);
const B = new Intersection(20, 50);
const C = new Intersection(30, 130);
const D = new Intersection(10, 140);
const l1 = new Line(A, B, size, size);
const l2 = new Line(C, D, size, size);

describe('constructor', () => {
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

	test('linkedShapes', () => {
		expect(l1.linkedShapes).toBeInstanceOf(Array);
		expect(l1.linkedShapes).toHaveLength(0);
	});
});

describe('y(x)', () => {
	test('definition', () => {
		expect(l1.y).toBeInstanceOf(Function);
	});

	test('y of horizontal line', () => {
		expect(l1.y(100)).toBeDefined();
		expect(l1.y(100)).toBe(Infinity);
	});

	test('y of ordinary line', () => {
		expect(l2.y(90)).toBeDefined();
		expect(l2.y(90)).toBe(100);
	});
});

describe('x(y)', () => {
	test('definition', () => {
		expect(l1.x).toBeInstanceOf(Function);
	});

	test('x of horizontal line', () => {
		expect(l1.x(20)).toBeDefined();
		expect(l1.x(20)).toBe(20);
	});

	test('x of ordinary line', () => {
		expect(l2.x(100)).toBeDefined();
		expect(l2.x(100)).toBe(90);
	});
});

describe('addPoint', () => {
	test('definition', () => {
		expect(l1.addPoint).toBeInstanceOf(Function);
	});

	const M = new Intersection(80, 80);
	test('unknown intersection', () => {
		l1.addPoint(M);
		expect(l1.intersections.includes(M)).toBeTruthy();
		expect(M.crossingLines.includes(l1)).toBeTruthy();
	});

	test('known intersection', () => {
		const oldIntersectionLength = l1.intersections.length;
		const oldLinesLength = M.crossingLines.length;
		l1.addPoint(M);
		expect(l1.intersections.includes(M)).toBeTruthy();
		expect(M.crossingLines.includes(l1)).toBeTruthy();
		expect(l1.intersections).toHaveLength(oldIntersectionLength);
		expect(M.crossingLines).toHaveLength(oldLinesLength);
	});

	test('avoid non-Intersection points', () => {
		const N = new Point(80, 80);
		l1.addPoint(N);
		expect(l1.intersections.includes(N)).toBeFalsy();
		expect(N.crossingLines).toBeUndefined();
	});
});

describe('linkParallelLines', () => {
	test('declaration', () => {
		expect(Line.linkParallelLines).toBeInstanceOf(Function);
	});

	const l3 = new Line(new Intersection(40, 40), new Intersection(40, 60), size, size);

	test('new line', () => {
		Line.linkParallelLines(l1, l3);
		expect(l1.parallels).toHaveLength(1);
		expect(l1.parallels).toContain(l3);
		expect(l3.parallels).toHaveLength(1);
		expect(l3.parallels).toContain(l1);
	});

	test('existing line', () => {
		Line.linkParallelLines(l1, l3);
		expect(l1.parallels).toHaveLength(1);
		expect(l1.parallels).toContain(l3);
		expect(l3.parallels).toHaveLength(1);
		expect(l3.parallels).toContain(l1);
	});
});

describe('includes', () => {
	test('declaration', () => {
		expect(l1.includes).toBeInstanceOf(Function);
	});

	test('bounds', () => {
		expect(l1.includes(A)).toBeTruthy();
		expect(l1.includes(B)).toBeTruthy();
	});

	test('inside points', () => {
		expect(l1.includes(new Point(20, 400))).toBeTruthy();
		expect(l2.includes(new Point(90, 100))).toBeTruthy();
	});

	test('outside points', () => {
		expect(l1.includes(C)).toBeFalsy();
		expect(l1.includes(D)).toBeFalsy();
	});
});

describe('getProjection', () => {
	test('declaration', () => {
		expect(l1.getProjection).toBeInstanceOf(Function);
	});

	test('projection on horizontal line', () => {
		expect(l1.getProjection(new Point(20, 400))).toMatchObject({x: 20, y: 400});
		expect(l1.getProjection(new Point(40, 200))).toMatchObject({x: 20, y: 200});
	});

	test('projection on ordinary line', () => {
		expect(l2.getProjection(new Point(90, 100))).toMatchObject({x: 90, y: 100});
		expect(l2.getProjection(new Point(30, 80))).toMatchObject({x: 50, y: 120});
	});
});

describe('getKnownIntersectionWith', () => {
	const l3 = new Line(B, C, size, size);

	test('declaration', () => {
		expect(l1.getKnownIntersectionWith).toBeInstanceOf(Function);
	});

	test('unknown intersection', () => {
		expect(l1.getKnownIntersectionWith(l2)).toBeUndefined();
	});

	test('known intersection', () => {
		expect(l1.getKnownIntersectionWith(l3)).toBe(B);
	});
});

describe('getOrCreateIntersectionWith', () => {
	test('declaration', () => {
		expect(l1.getKnownIntersectionWith).toBeInstanceOf(Function);
	});

	test('new intersection', () => {
		expect(l1.getKnownIntersectionWith(l2)).toBeUndefined();
		expect(l1.getOrCreateIntersectionWith(l2)).toMatchObject({x: 20, y: 135});
	});

	test('known intersection', () => {
		expect(l1.getKnownIntersectionWith(l2)).toMatchObject({x: 20, y: 135});
		expect(l1.getOrCreateIntersectionWith(l2)).toMatchObject({x: 20, y: 135});
	});
});

describe('Line Bounds', () => {
	const A = new Intersection(10, 10);
	const B = new Intersection(30, 30);
	const C = new Intersection(30, 10);
	const D = new Intersection(10, 30);

	const AB = new Line(A, B, size, size);
	const AC = new Line(A, C, size, size);
	const AD = new Line(A, D, size, size);

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
