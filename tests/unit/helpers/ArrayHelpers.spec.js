import * as Helper from '../../../src/core/Helpers/ArrayHelpers';

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

describe('removeIfAny', () => {
	test('empty array', () => {
		const array = [];
		Helper.removeIfAny(array, 3);
		expect(array).toHaveLength(0);
	});

	test('no occurence', () => {
		const array = [1, 2, 3];
		Helper.removeIfAny(array, 4);
		expect(array).toHaveLength(3);
		expect(array[0]).toBe(1);
		expect(array[1]).toBe(2);
		expect(array[2]).toBe(3);
	});

	test('one occurence (first index)', () => {
		const array = [1, 2, 3];
		Helper.removeIfAny(array, 1);
		expect(array).toHaveLength(2);
		expect(array[0]).toBe(2);
		expect(array[1]).toBe(3);
	});
	test('one occurence', () => {
		const array = [1, 2, 3, 4];
		Helper.removeIfAny(array, 2);
		expect(array).toHaveLength(3);
		expect(array[0]).toBe(1);
		expect(array[1]).toBe(3);
		expect(array[2]).toBe(4);
	});
	test('one occurence (last index)', () => {
		const array = [1, 2, 3];
		Helper.removeIfAny(array, 3);
		expect(array).toHaveLength(2);
		expect(array[0]).toBe(1);
		expect(array[1]).toBe(2);
	});

	test('two occurences', () => {
		const array = [1, 2, 1];
		Helper.removeIfAny(array, 1);
		expect(array).toHaveLength(2);
		expect(array[0]).toBe(2);
		expect(array[1]).toBe(1);
	});
});

describe('distinct', () => {
	test('empty array', () => {
		const array = [];
		const result = array.filter(Helper.distinct);
		expect(result).toHaveLength(0);
	});

	test('no duplicates', () => {
		const array = [1, 2, 3, 4];
		const result = array.filter(Helper.distinct);
		expect(result).toHaveLength(4);
		expect(result[0]).toBe(1);
		expect(result[1]).toBe(2);
		expect(result[2]).toBe(3);
		expect(result[3]).toBe(4);
	});

	test('one duplicate', () => {
		const array = [1, 2, 3, 2, 4];
		const result = array.filter(Helper.distinct);
		expect(result).toHaveLength(4);
		expect(result[0]).toBe(1);
		expect(result[1]).toBe(2);
		expect(result[2]).toBe(3);
		expect(result[3]).toBe(4);
	});

	test('two duplicates', () => {
		const array = [1, 2, 3, 2, 2, 4];
		const result = array.filter(Helper.distinct);
		expect(result).toHaveLength(4);
		expect(result[0]).toBe(1);
		expect(result[1]).toBe(2);
		expect(result[2]).toBe(3);
		expect(result[3]).toBe(4);
	});

	test('multiple duplicates', () => {
		const array = [1, 1, 2, 3, 2, 2, 4, 4, 3, 4, 1];
		const result = array.filter(Helper.distinct);
		expect(result).toHaveLength(4);
		expect(result[0]).toBe(1);
		expect(result[1]).toBe(2);
		expect(result[2]).toBe(3);
		expect(result[3]).toBe(4);
	});
});
