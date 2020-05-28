import {Intersection} from '../../src/core/Intersection';
import {Shape} from '../../src/core/Shape';

const parameters = [
	1000,	// Xmax
	1000,	// Ymax
	10		// shapesGap
];

describe('constructor', () => {
	const A = new Intersection(150, 150);
	const B = new Intersection(180, 130);
	const C = new Intersection(160, 180);
	const s1 = new Shape([A, B, C], ...parameters);

	test('id generation', () => {
		const stmp = new Shape([
			new Intersection(0, 0),
			new Intersection(10, 10),
			new Intersection(30, 0)
		],
		...parameters);

		expect(s1.id).toBeDefined();
		expect(stmp.id).toBeDefined();
		expect(s1.id).not.toBe(stmp.id);
	});

	test('points', () => {
		expect(s1.points).toBeInstanceOf(Array);
		expect(s1.points).toHaveLength(3);
		expect(s1.points).toContain(A);
		expect(s1.points).toContain(B);
		expect(s1.points).toContain(C);
	});

	test('lines creation', () => {
		expect(s1.lines).toBeInstanceOf(Array);
		expect(s1.lines).toHaveLength(3);

		expect(s1.lines[0].intersections).toHaveLength(4);
		expect(s1.lines[0].intersections).toContain(A);
		expect(s1.lines[0].intersections).toContain(B);

		expect(s1.lines[1].intersections).toHaveLength(4);
		expect(s1.lines[1].intersections).toContain(B);
		expect(s1.lines[1].intersections).toContain(C);

		expect(s1.lines[2].intersections).toHaveLength(4);
		expect(s1.lines[2].intersections).toContain(C);
		expect(s1.lines[2].intersections).toContain(A);
	});

	test('spaced lines creation', () => {
		expect(s1.spacedLines).toBeInstanceOf(Array);
		expect(s1.spacedLines).toHaveLength(3);

		expect(s1.spacedLines[0].intersections).toHaveLength(4);
		expect(s1.spacedLines[1].intersections).toHaveLength(4);
		expect(s1.spacedLines[2].intersections).toHaveLength(4);
	});

	test('parallels registrations', () => {
		for (let i = 0; i < 3; i++) {
			expect(s1.lines[i].parallels).toHaveLength(1);
			expect(s1.lines[i].parallels).toContain(s1.spacedLines[i]);
			expect(s1.spacedLines[i].parallels).toHaveLength(1);
			expect(s1.spacedLines[i].parallels).toContain(s1.lines[i]);
		}
	});
});

describe('2nd shape', () => {
	const A = new Intersection(150, 150);
	const B = new Intersection(180, 130);
	const C = new Intersection(160, 180);
	const s1 = new Shape([A, B, C], ...parameters);

	const l1 = s1.spacedLines[0];
	const D = l1.intersections[0];
	const E = l1.intersections[1];
	const F = new Intersection(200, 0);
	const s2 = new Shape([E, D, F], ...parameters);

	test('second shape defined', () => {
		expect(s2.points).toHaveLength(3);
		expect(s2.lines).toHaveLength(3);
		expect(s2.spacedLines).toHaveLength(3);
	});

	test('s2 share line with s1', () => {
		expect(s2.lines[0]).toBe(l1);
	});

	test('s2 share space line with s1', () => {
		expect(s2.spacedLines[0]).toBe(s1.lines[0]);
	});
});
