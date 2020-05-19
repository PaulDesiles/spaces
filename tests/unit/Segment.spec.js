import {Point} from '../../src/core/Point';
import {Segment} from '../../src/core/Segment';

describe('includes point', () => {
	const A = new Point(20, 20);
	const B = new Point(40, 40);
	const C = new Point(20, 40);
	const D = new Point(40, 20);
	const AB = new Segment(A, B);
	const AC = new Segment(A, C);
	const AD = new Segment(A, D);

	test('inside segment', () => {
		const p = new Point(30, 30);
		expect(AB.includes(p)).toBeTruthy();
	});
	test('segment bound', () => {
		const p = new Point(20, 20);
		expect(AB.includes(p)).toBeTruthy();
	});
	test('on line but out of bounds', () => {
		const p = new Point(10, 10);
		expect(AB.includes(p)).toBeFalsy();
	});
	test('outside segment', () => {
		const p = new Point(20, 30);
		expect(AB.includes(p)).toBeFalsy();
	});

	test('inside horizontal segment', () => {
		const p = new Point(20, 30);
		expect(AC.includes(p)).toBeTruthy();
	});
	test('outside horizontal segment', () => {
		const p = new Point(40, 30);
		expect(AC.includes(p)).toBeFalsy();
	});

	test('inside vertical segment', () => {
		const p = new Point(30, 20);
		expect(AD.includes(p)).toBeTruthy();
	});
	test('outside vertical segment', () => {
		const p = new Point(30, 40);
		expect(AD.includes(p)).toBeFalsy();
	});
});

describe('project point', () => {
	const A = new Point(24, 36);
	const B = new Point(45, 69);
	const C = new Point(24, 80);
	const D = new Point(80, 36);
	const AB = new Segment(A, B);
	const AC = new Segment(A, C);
	const AD = new Segment(A, D);

	const M = new Point(20, 60);
	const N = new Point(50, 58);
	const O = new Point(20, 20);

	test('left side', () => {
		const M2 = AB.getProjection(M);
		expect(M2.x).toBeCloseTo(33.7176);
		expect(M2.y).toBeCloseTo(51.2705);
	});

	test('right side', () => {
		const N2 = AB.getProjection(N);
		expect(N2.x).toBeCloseTo(41.4588);
		expect(N2.y).toBeCloseTo(63.4352);
	});

	test('segment bounds', () => {
		const A2 = AB.getProjection(A);
		const B2 = AB.getProjection(B);
		expect(A2).toBe(A);
		expect(B2).toBe(B);
	});

	test('outside', () => {
		const O2 = AB.getProjection(O);
		expect(O2).toBe(A);
	});

	test('vertical segment', () => {
		const M2 = AC.getProjection(M);
		expect(M2).toMatchObject({x: 24, y: 60});
	});
	test('vertical segment bound', () => {
		const O2 = AC.getProjection(O);
		expect(O2).toBe(A);
	});

	test('horizontal segment', () => {
		const N2 = AD.getProjection(N);
		expect(N2).toMatchObject({x: 50, y: 36});
	});
	test('horizontal segment bound', () => {
		const O2 = AD.getProjection(O);
		expect(O2).toBe(A);
	});
});

describe('constrain segment to drawing bounds', () => {
	test('inside segment', () => {
		const s = new Segment(new Point(20, 30), new Point(230, 400));
		s.constrainToBounds(1000, 600);
		expect(s.A.x).toBe(20);
		expect(s.A.y).toBe(30);
		expect(s.B.x).toBe(230);
		expect(s.B.y).toBe(400);
	});

	test('one bound outside', () => {
		const s = new Segment(new Point(-20, -30), new Point(230, 400));
		s.constrainToBounds(1000, 600);
		expect(s.A.x).toBeCloseTo(0);
		expect(s.A.y).toBeCloseTo(4.4);
		expect(s.B.x).toBe(230);
		expect(s.B.y).toBe(400);
	});

	test('two bounds outside, through drawing area', () => {
		const s = new Segment(new Point(-20, 80), new Point(428, 1200));
		s.constrainToBounds(1000, 600);
		expect(s.A.x).toBeCloseTo(0);
		expect(s.A.y).toBeCloseTo(130);
		expect(s.B.x).toBeCloseTo(188);
		expect(s.B.y).toBeCloseTo(600);
	});

	test('two bounds outside, out of drawing area', () => {
		const s = new Segment(new Point(-60, -20), new Point(-20, 80));
		s.constrainToBounds(1000, 600);
		expect(s.A.x).toBeCloseTo(0);
		expect(s.A.y).toBeCloseTo(130);
		expect(s.B.x).toBeCloseTo(0);
		expect(s.B.y).toBeCloseTo(130);
	});

	test('two bounds outside, no line intersections with drawing area', () => {
		const s = new Segment(new Point(-20, -30), new Point(-60, -20));
		s.constrainToBounds(1000, 600);
		expect(s.A.x).toBeCloseTo(0);
		expect(s.A.y).toBeCloseTo(0);
		expect(s.B.x).toBeCloseTo(0);
		expect(s.B.y).toBeCloseTo(0);
	});
});
