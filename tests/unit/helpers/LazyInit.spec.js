import {lazyInit} from '../../../src/core/Helpers/LazyInit';

describe('lazyInit a property', () => {
	const o = { };
	const initializer = jest.fn(() => 1);

	lazyInit(o, {
		property: () => initializer()
	});

	test('initializer not called until property access', () => {
		expect(initializer).toHaveBeenCalledTimes(0);
	});

	test('property returns value at first call', () => {
		expect(o.property).toBe(1);
	});

	test('property returns value at second call', () => {
		expect(o.property).toBe(1);
	});

	test('initializer called only once', () => {
		expect(initializer).toHaveBeenCalledTimes(1);
	});
});
