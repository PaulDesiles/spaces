import * as Helper from '../../../src/core/Helpers/MathHelpers';

describe('equiv', () => {
	test('same numbers', () => {
		expect(Helper.equiv(123.4, 123.4)).toBeTruthy();
	});

	test('close numbers', () => {
		expect(Helper.equiv(12.3456, 12.3457)).toBeTruthy();
	});

	test('different numbers', () => {
		expect(Helper.equiv(12.3456, 12.456)).toBeFalsy();
	});
});

describe('polynom resolution', () => {
	test('x²+2x+1', () => {
		const result = Helper.resolve2ndDegreePolynom(1, 2, 1);
		expect(result).toHaveLength(1);
		expect(result[0]).toBe(-1);
	});
	test('3x²+5x+7', () => {
		const result = Helper.resolve2ndDegreePolynom(3, 5, 7);
		expect(result).toHaveLength(0);
	});
	test('4x²+4x+1', () => {
		const result = Helper.resolve2ndDegreePolynom(4, 4, 1);
		expect(result).toHaveLength(1);
		expect(result[0]).toBeCloseTo(-0.5);
	});
	test('2x²+9x-5', () => {
		const result = Helper.resolve2ndDegreePolynom(2, 9, -5);
		expect(result).toHaveLength(2);
		expect(result[0]).toBeCloseTo(-5);
		expect(result[1]).toBeCloseTo(0.5);
	});
	test('-x²+2x+3', () => {
		const result = Helper.resolve2ndDegreePolynom(-1, 2, 3);
		expect(result).toHaveLength(2);
		expect(result[0]).toBeCloseTo(3);
		expect(result[1]).toBeCloseTo(-1);
	});
});

describe('polar coordinates', () => {
	const center = {x: 50, y: 50};
	const size = {x: 100, y: 100};

	test('0°', () => {
		const p = Helper.getPolarCoordinates(0, 10, center, size);
		expect(p.x).toBeCloseTo(60);
		expect(p.y).toBeCloseTo(50);
	});

	test('45°', () => {
		const p = Helper.getPolarCoordinates(Math.PI / 4, 10, center, size);
		expect(p.x).toBeCloseTo(57.07);
		expect(p.y).toBeCloseTo(57.07);
	});

	test('120°', () => {
		const p = Helper.getPolarCoordinates((Math.PI * 2) / 3, 10, center, size);
		expect(p.x).toBeCloseTo(45);
		expect(p.y).toBeCloseTo(58.66);
	});

	test('outside 0°', () => {
		const p = Helper.getPolarCoordinates(0, 60, center, size);
		expect(p.x).toBeCloseTo(100);
		expect(p.y).toBeCloseTo(50);
	});

	test('inside 45°', () => {
		const p = Helper.getPolarCoordinates(Math.PI / 4, 60, center, size);
		expect(p.x).toBeCloseTo(92.43);
		expect(p.y).toBeCloseTo(92.43);
	});

	test('outside 120°', () => {
		const p = Helper.getPolarCoordinates((Math.PI * 2) / 3, 60, center, size);
		expect(p.x).toBeCloseTo(21.13);
		expect(p.y).toBeCloseTo(100);
	});
});

describe('vector angles', () => {
	const A = {x: 20, y: 20};
	const B = {x: 40, y: 30};
	const C = {x: 10, y: 40};
	const AB = new Helper.Vector(A, B);
	const BC = new Helper.Vector(B, C);
	const CA = new Helper.Vector(C, A);

	const BA = new Helper.Vector(B, A);
	const CB = new Helper.Vector(C, B);
	const AC = new Helper.Vector(A, C);

	test('aBc', () => {
		const angle = BA.angleWith(BC);
		expect(angle).toBeCloseTo(Math.PI / 4);
	});

	test('bCa', () => {
		const angle = CB.angleWith(CA);
		expect(angle).toBeCloseTo(Math.PI / 4);
	});

	test('cAb', () => {
		const angle = AC.angleWith(AB);
		expect(angle).toBeCloseTo(Math.PI / 2);
	});

	test('signed aBc', () => {
		const angle = BA.signedAngleWith(BC);
		expect(angle).toBeCloseTo(-Math.PI / 4);

		const opposite = BC.signedAngleWith(BA);
		expect(opposite).toBeCloseTo(Math.PI / 4);
	});

	test('signed bCa', () => {
		const angle = CB.signedAngleWith(CA);
		expect(angle).toBeCloseTo(-Math.PI / 4);

		const opposite = CA.signedAngleWith(CB);
		expect(opposite).toBeCloseTo(Math.PI / 4);
	});

	test('signed cAb', () => {
		const angle = AC.signedAngleWith(AB);
		expect(angle).toBeCloseTo(-Math.PI / 2);

		const opposite = AB.signedAngleWith(AC);
		expect(opposite).toBeCloseTo(Math.PI / 2);
	});
});
