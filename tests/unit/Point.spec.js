import {Point, getPolarPoint} from '../../src/core/Point';

describe('constructor', () => {
	test('default constructor', () => {
		const p = new Point();
		expect(p).toMatchObject({x: 0, y: 0});
	});

	test('constructor', () => {
		const p = new Point(1, 2);
		expect(p).toMatchObject({x: 1, y: 2});
	});
});

describe('distance calculation', () => {
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

describe('equivalence', () => {
	const P = new Point(15, 15);

	test('same position', () => {
		const P2 = new Point(15, 15);
		expect(P.equiv(P2)).toBeTruthy();
	});

	test('close position', () => {
		const P3 = new Point(15.001, 14.9998);
		expect(P.equiv(P3)).toBeTruthy();
	});

	test('different position', () => {
		const P4 = new Point(15.2, 15);
		expect(P.equiv(P4)).toBeFalsy();
	});
});

describe('polar point', () => {
	const center = new Point(50, 50);
	const size = {x: 100, y: 100};

	test('0°', () => {
		const p = getPolarPoint(0, 10, center, size);
		expect(p.x).toBeCloseTo(60);
		expect(p.y).toBeCloseTo(50);
	});

	test('45°', () => {
		const p = getPolarPoint(Math.PI / 4, 10, center, size);
		expect(p.x).toBeCloseTo(57.07);
		expect(p.y).toBeCloseTo(57.07);
	});

	test('120°', () => {
		const p = getPolarPoint((Math.PI * 2) / 3, 10, center, size);
		expect(p.x).toBeCloseTo(45);
		expect(p.y).toBeCloseTo(58.66);
	});

	test('outside 0°', () => {
		const p = getPolarPoint(0, 60, center, size);
		expect(p.x).toBeCloseTo(100);
		expect(p.y).toBeCloseTo(50);
	});

	test('inside 45°', () => {
		const p = getPolarPoint(Math.PI / 4, 60, center, size);
		expect(p.x).toBeCloseTo(92.43);
		expect(p.y).toBeCloseTo(92.43);
	});

	test('outside 120°', () => {
		const p = getPolarPoint((Math.PI * 2) / 3, 60, center, size);
		expect(p.x).toBeCloseTo(21.13);
		expect(p.y).toBeCloseTo(100);
	});
});
