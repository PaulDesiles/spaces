import {Point} from '../../src/core/Point';
import {Intersection} from '../../src/core/Intersection';

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
		expect(i.crossingLines).toHaveLength(0);
	});

	test('conversion from point', () => {
		const p = new Point(10, 10);
		const i = Intersection.createFrom(p);
		expect(i).toMatchObject({x: 10, y: 10});
		expect(i.id).toBeDefined();
	});
});
