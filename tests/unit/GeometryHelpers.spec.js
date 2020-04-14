import * as Helper from '../../src/components/GeometryHelpers';

describe('Point class', () => {
	test('default constructor', () => {
		const p = new Helper.Point();
		expect(p).toEqual({x: 0, y: 0});
	});

	test('constructor', () => {
		const p = new Helper.Point(1, 2);
		expect(p).toEqual({x: 1, y: 2});
	});

	const p1 = new Helper.Point(10, 2);
	const p2 = new Helper.Point(10, 10);
	const p3 = new Helper.Point(15, 15);
	const p4 = new Helper.Point(25, 15);

	test('computes distance', () => {
		expect(p2.getSquaredDistanceTo(p3)).toBeCloseTo(50);
	});

	test('computes distance verticaly', () => {
		expect(p1.getSquaredDistanceTo(p2)).toBeCloseTo(64);
	});

	test('computes distance horizontaly', () => {
		expect(p3.getSquaredDistanceTo(p4)).toBeCloseTo(100);
	});

	test('constrain distance : in bounds', () => {
		expect(p2.constrainDistanceTo(p3, 2, 10)).toBe(p3);
	});

	test('constrain distance : min', () => {
		const p = p2.constrainDistanceTo(p3, 7 * Math.sqrt(2), 100);
		expect(p.x).toBeCloseTo(17);
		expect(p.y).toBeCloseTo(17);
	});

	test('constrain distance : max', () => {
		const p = p2.constrainDistanceTo(p3, 1, 2 * Math.sqrt(2));
		expect(p.x).toBeCloseTo(12);
		expect(p.y).toBeCloseTo(12);
	});

	test('constrain distance with itself', () => {
		const p = p2.constrainDistanceTo(p2, 3, 5);
		expect(p.x).toBeCloseTo(10);
		expect(p.y).toBeCloseTo(7);
	});

	test('constrain rotation : void params', () => {
		const result = p2.constrainAngleTo(p3, p1, 0, 0);
		expect(result).toBe(p3);
	});

	const deg10 = Math.PI / 18;
	const deg15 = Math.PI / 12;
	const deg30 = Math.PI / 6;
	const deg40 = Math.PI / 4.5;
	const deg45 = Math.PI / 4;

	test('constrain rotation : min', () => {
		const result = p1.constrainAngleTo(p4, p3, deg45, 0);
		// From 28° to 45°
		expect(result.x).toBeCloseTo(28.14);
		expect(result.y).toBeCloseTo(10.06);
	});

	test('constrain rotation : step', () => {
		const result = p3.constrainAngleTo(p2, undefined, 0, deg10);
		// From 45° (to X axis) to 50°
		expect(result.x).toBeCloseTo(9.58);
		expect(result.y).toBeCloseTo(10.45);
	});

	test('constrain rotation : min (ignored) & step', () => {
		const result = p3.constrainAngleTo(p2, p4, deg30, deg10);
		// From 135° to 140°
		expect(result.x).toBeCloseTo(9.58);
		expect(result.y).toBeCloseTo(10.45);
	});

	test('constrain rotation : min & step', () => {
		const result = p1.constrainAngleTo(p3, p2, deg40, deg15);
		// From 21° to 45°
		expect(result.x).toBeCloseTo(19.85);
		expect(result.y).toBeCloseTo(11.85);
	});
});

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

describe('loopedGet', () => {
	const a = [0, 1, 2];

	test('i < length', () => {
		expect(Helper.loopedGet(a, 0)).toBe(0);
		expect(Helper.loopedGet(a, 1)).toBe(1);
		expect(Helper.loopedGet(a, 2)).toBe(2);
	});

	test('i > length', () => {
		expect(Helper.loopedGet(a, 3)).toBe(0);
		expect(Helper.loopedGet(a, 4)).toBe(1);
		expect(Helper.loopedGet(a, 5)).toBe(2);
		expect(Helper.loopedGet(a, 6)).toBe(0);
	});

	test('i < 0', () => {
		expect(Helper.loopedGet(a, -1)).toBe(2);
		expect(Helper.loopedGet(a, -2)).toBe(1);
		expect(Helper.loopedGet(a, -3)).toBe(0);
		expect(Helper.loopedGet(a, -4)).toBe(2);
	});
});

describe('forEachConsecutive', () => {
	const array = ['a', 'b', 'c'];
	const callback1 = () => jest.fn(x => x);
	const callback2 = () => jest.fn((x, y) => x + y);
	const callback3 = () => jest.fn((x, y, z) => x + y + z);

	test('one param starting at 0', () => {
		const callback = callback1();
		Helper.forEachConsecutive(array, callback);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'a');
		expect(callback).toHaveBeenNthCalledWith(2, 'b');
		expect(callback).toHaveBeenNthCalledWith(3, 'c');
	});

	test('two params starting at 0', () => {
		const callback = callback2();
		Helper.forEachConsecutive(array, callback);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'a', 'b');
		expect(callback).toHaveBeenNthCalledWith(2, 'b', 'c');
		expect(callback).toHaveBeenNthCalledWith(3, 'c', 'a');
	});

	test('three params starting at 0', () => {
		const callback = callback3();
		Helper.forEachConsecutive(array, callback);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'a', 'b', 'c');
		expect(callback).toHaveBeenNthCalledWith(2, 'b', 'c', 'a');
		expect(callback).toHaveBeenNthCalledWith(3, 'c', 'a', 'b');
	});

	// StartIndex 1

	test('one param starting at 1', () => {
		const callback = callback1();
		Helper.forEachConsecutive(array, callback, 1);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'b');
		expect(callback).toHaveBeenNthCalledWith(2, 'c');
		expect(callback).toHaveBeenNthCalledWith(3, 'a');
	});

	test('two params starting at 1', () => {
		const callback = callback2();
		Helper.forEachConsecutive(array, callback, 1);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'b', 'c');
		expect(callback).toHaveBeenNthCalledWith(2, 'c', 'a');
		expect(callback).toHaveBeenNthCalledWith(3, 'a', 'b');
	});

	test('three params starting at 1', () => {
		const callback = callback3();
		Helper.forEachConsecutive(array, callback, 1);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'b', 'c', 'a');
		expect(callback).toHaveBeenNthCalledWith(2, 'c', 'a', 'b');
		expect(callback).toHaveBeenNthCalledWith(3, 'a', 'b', 'c');
	});

	// StartIndex 2

	test('one param starting at 2', () => {
		const callback = callback1();
		Helper.forEachConsecutive(array, callback, 2);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'c');
		expect(callback).toHaveBeenNthCalledWith(2, 'a');
		expect(callback).toHaveBeenNthCalledWith(3, 'b');
	});

	test('two params starting at 2', () => {
		const callback = callback2();
		Helper.forEachConsecutive(array, callback, 2);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'c', 'a');
		expect(callback).toHaveBeenNthCalledWith(2, 'a', 'b');
		expect(callback).toHaveBeenNthCalledWith(3, 'b', 'c');
	});

	test('three params starting at 2', () => {
		const callback = callback3();
		Helper.forEachConsecutive(array, callback, 2);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'c', 'a', 'b');
		expect(callback).toHaveBeenNthCalledWith(2, 'a', 'b', 'c');
		expect(callback).toHaveBeenNthCalledWith(3, 'b', 'c', 'a');
	});

	// StartIndex -1  <=> 2

	test('one param starting at -1', () => {
		const callback = callback1();
		Helper.forEachConsecutive(array, callback, -1);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'c');
		expect(callback).toHaveBeenNthCalledWith(2, 'a');
		expect(callback).toHaveBeenNthCalledWith(3, 'b');
	});

	test('two params starting at -1', () => {
		const callback = callback2();
		Helper.forEachConsecutive(array, callback, -1);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'c', 'a');
		expect(callback).toHaveBeenNthCalledWith(2, 'a', 'b');
		expect(callback).toHaveBeenNthCalledWith(3, 'b', 'c');
	});

	test('three params starting at -1', () => {
		const callback = callback3();
		Helper.forEachConsecutive(array, callback, -1);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenNthCalledWith(1, 'c', 'a', 'b');
		expect(callback).toHaveBeenNthCalledWith(2, 'a', 'b', 'c');
		expect(callback).toHaveBeenNthCalledWith(3, 'b', 'c', 'a');
	});
});

describe('mapConsecutive', () => {
	const array = ['a', 'b', 'c'];

	test('one param', () => {
		const transform = x => x;
		const result = Helper.mapConsecutive(array, transform);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe('a');
		expect(result[1]).toBe('b');
		expect(result[2]).toBe('c');
	});

	test('two params', () => {
		const transform = (x, y) => `${x}${y}`;
		const result = Helper.mapConsecutive(array, transform);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe('ab');
		expect(result[1]).toBe('bc');
		expect(result[2]).toBe('ca');
	});

	test('three params', () => {
		const transform = (x, y, z) => `${x}${y}${z}`;
		const result = Helper.mapConsecutive(array, transform);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe('abc');
		expect(result[1]).toBe('bca');
		expect(result[2]).toBe('cab');
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
		expect(S.A2).toBeInstanceOf(Helper.Point);
		expect(S.B2).toBeInstanceOf(Helper.Point);
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
		expect(result).toBeInstanceOf(Helper.Point);
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
