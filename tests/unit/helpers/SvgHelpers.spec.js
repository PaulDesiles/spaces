import * as Helper from '../../../src/core/Helpers/SvgHelpers';

describe('getShape', () => {
	test('opened shape', () => {
		const shape = [
			{x: 20, y: 20},
			{x: 40, y: 30},
			{x: 10, y: 40}
		];

		const path = Helper.getShapePath(shape, false);
		expect(path).toBe('M20 20 L40 30 L10 40 ');
	});

	test('closed shape', () => {
		const shape = [
			{x: 20, y: 20},
			{x: 40, y: 30},
			{x: 10, y: 40}
		];

		const path = Helper.getShapePath(shape, true);
		expect(path).toBe('M20 20 L40 30 L10 40 Z');
	});
});

describe('createSvgFileFromShapes', () => {
	test('complete svg', () => {
		const s1 = {
			points: [{x: 20, y: 20}, {x: 40, y: 30}, {x: 10, y: 40}]
		};
		const s2 = {
			points: [{x: 30, y: 60}, {x: 50, y: 70}, {x: 54, y: 54}, {x: 46, y: 50}]
		};

		const path = Helper.createSvgFileFromShapes([s1, s2], 100);
		expect(path).toBe(`<svg xmlns="http://www.w3.org/2000/svg" width="undefined" height="undefined">
<path stroke-width="0" fill="black" d="M20 20 L40 30 L10 40 Z" />
<path stroke-width="0" fill="black" d="M30 60 L50 70 L54 54 L46 50 Z" />
</svg>`
		);
	});
});
