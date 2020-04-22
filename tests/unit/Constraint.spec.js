import {Point, Intersection, Line, initBounds} from '../../src/components/Geometry';
import {
	Segment,
	resolve2ndDegreePolynom,
	intersectLineWithCircle,
	constrainSegmentToBounds,
	constrainDistance,
	constrainAngle
} from '../../src/components/Constraint';

describe('polynom resolution', () => {
	test('x²+2x+1', () => {
		const result = resolve2ndDegreePolynom(1, 2, 1);
		expect(result).toHaveLength(1);
		expect(result[0]).toBe(-1);
	});
	test('3x²+5x+7', () => {
		const result = resolve2ndDegreePolynom(3, 5, 7);
		expect(result).toHaveLength(0);
	});
	test('4x²+4x+1', () => {
		const result = resolve2ndDegreePolynom(4, 4, 1);
		expect(result).toHaveLength(1);
		expect(result[0]).toBeCloseTo(-0.5);
	});
	test('2x²+9x-5', () => {
		const result = resolve2ndDegreePolynom(2, 9, -5);
		expect(result).toHaveLength(2);
		expect(result[0]).toBeCloseTo(-5);
		expect(result[1]).toBeCloseTo(0.5);
	});
	test('-x²+2x+3', () => {
		const result = resolve2ndDegreePolynom(-1, 2, 3);
		expect(result).toHaveLength(2);
		expect(result[0]).toBeCloseTo(3);
		expect(result[1]).toBeCloseTo(-1);
	});
});

describe('line/circle intersections', () => {
	const A = new Intersection(3, 7);
	const B = new Intersection(6, 4);
	const C = new Intersection(7, 2);
	const D = new Intersection(2, 2);
	const E = new Intersection(6, 12);
	const F = new Intersection(0, 4);

	test('BC & circle(A,3)', () => {
		const result = intersectLineWithCircle(new Line(B, C), A, 3);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(3);
		expect(result[0].y).toBeCloseTo(10);
		expect(result[1].x).toBeCloseTo(5.4);
		expect(result[1].y).toBeCloseTo(5.2);
	});
	test('BC & circle(A,5)', () => {
		const result = intersectLineWithCircle(new Line(B, C), A, 5);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(2.05);
		expect(result[0].y).toBeCloseTo(11.91);
		expect(result[1].x).toBeCloseTo(6.35);
		expect(result[1].y).toBeCloseTo(3.29);
	});
	test('BC & circle(A,10)', () => {
		const result = intersectLineWithCircle(new Line(B, C), A, 10);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(-0.23);
		expect(result[0].y).toBeCloseTo(16.46);
		expect(result[1].x).toBeCloseTo(8.63);
		expect(result[1].y).toBeCloseTo(-1.26);
	});
	test('BD & circle(A,3) : out', () => {
		const result = intersectLineWithCircle(new Line(B, D), A, 3);
		expect(result).toHaveLength(0);
	});
	test('BF & circle(A,4): horizontal', () => {
		const l = new Line(B, F);
		const result = intersectLineWithCircle(l, A, 3.5);
		expect(result).toHaveLength(2);
		expect(result[0].x).toBeCloseTo(1.2);
		expect(result[0].y).toBeCloseTo(4);
		expect(result[1].x).toBeCloseTo(4.8);
		expect(result[1].y).toBeCloseTo(4);
	});
	test('BE & circle(A,3): vertical tangent', () => {
		const l = new Line(B, E);
		const result = intersectLineWithCircle(l, A, 3);
		expect(result).toHaveLength(1);
		expect(result[0].x).toBeCloseTo(6);
		expect(result[0].y).toBeCloseTo(7);
	});
});

describe('constrain segment to drawing bounds', () => {
	initBounds(1000, 600);

	test('inside segment', () => {
		const s = new Segment(new Point(20, 30), new Point(230, 400));
		constrainSegmentToBounds(s);
		expect(s.A.x).toBe(20);
		expect(s.A.y).toBe(30);
		expect(s.B.x).toBe(230);
		expect(s.B.y).toBe(400);
	});

	test('one bound outside', () => {
		const s = new Segment(new Point(-20, -30), new Point(230, 400));
		constrainSegmentToBounds(s);
		expect(s.A.x).toBeCloseTo(0);
		expect(s.A.y).toBeCloseTo(4.4);
		expect(s.B.x).toBe(230);
		expect(s.B.y).toBe(400);
	});

	test('two bounds outside, threw drawing area', () => {
		const s = new Segment(new Point(-20, 80), new Point(428, 1200));
		constrainSegmentToBounds(s);
		expect(s.A.x).toBeCloseTo(0);
		expect(s.A.y).toBeCloseTo(130);
		expect(s.B.x).toBeCloseTo(188);
		expect(s.B.y).toBeCloseTo(600);
	});

	test('two bounds outside, out of drawing area', () => {
		const s = new Segment(new Point(-60, -20), new Point(-20, 80));
		constrainSegmentToBounds(s);
		expect(s.A.x).toBeCloseTo(0);
		expect(s.A.y).toBeCloseTo(130);
		expect(s.B.x).toBeCloseTo(0);
		expect(s.B.y).toBeCloseTo(130);
	});

	test('two bounds outside, no line intersections with drawing area', () => {
		const s = new Segment(new Point(-20, -30), new Point(-60, -20));
		constrainSegmentToBounds(s);
		expect(s.A.x).toBeCloseTo(0);
		expect(s.A.y).toBeCloseTo(0);
		expect(s.B.x).toBeCloseTo(0);
		expect(s.B.y).toBeCloseTo(0);
	});
});

describe('constrain point in distance bounds', () => {
	const p1 = new Point(10, 2);
	const p2 = new Point(10, 10);
	const p3 = new Point(15, 15);

	test('constrain distance : in bounds', () => {
		expect(constrainDistance(p2, p3, 2, 10)).toBe(p3);
	});

	test('constrain distance : min', () => {
		const p = constrainDistance(p2, p3, 7 * Math.sqrt(2), 100);
		expect(p.x).toBeCloseTo(17);
		expect(p.y).toBeCloseTo(17);
	});

	test('constrain distance : max', () => {
		const p = constrainDistance(p2, p3, 1, 2 * Math.sqrt(2));
		expect(p.x).toBeCloseTo(12);
		expect(p.y).toBeCloseTo(12);
	});

	test('constrain distance with itself', () => {
		const p = constrainDistance(p2, p2, 3, 5);
		expect(p.x).toBeCloseTo(10);
		expect(p.y).toBeCloseTo(7);
	});

	test('constrain rotation : void params', () => {
		const result = constrainAngle(p2, p3, p1, 0, 0);
		expect(result).toBe(p3);
	});
});

describe('constrain point in angle bounds', () => {
	const p1 = new Point(10, 2);
	const p2 = new Point(10, 10);
	const p3 = new Point(15, 15);
	const p4 = new Point(25, 15);
	const deg10 = Math.PI / 18;
	const deg15 = Math.PI / 12;
	const deg30 = Math.PI / 6;
	const deg40 = Math.PI / 4.5;
	const deg45 = Math.PI / 4;

	test('constrain rotation : min', () => {
		const result = constrainAngle(p1, p4, p3, deg45, 0);
		// From 28° to 45°
		expect(result.x).toBeCloseTo(28.14);
		expect(result.y).toBeCloseTo(10.06);
	});

	test('constrain rotation : step', () => {
		const result = constrainAngle(p3, p2, undefined, 0, deg10);
		// From 45° (to X axis) to 40°
		expect(result.x).toBeCloseTo(10.45);
		expect(result.y).toBeCloseTo(9.58);
	});

	test('constrain rotation : min (ignored) & step', () => {
		const result = constrainAngle(p3, p2, p4, deg30, deg10);
		// From 135° to 130°
		expect(result.x).toBeCloseTo(10.45);
		expect(result.y).toBeCloseTo(9.58);
	});

	test('constrain rotation : min & step', () => {
		const result = constrainAngle(p1, p3, p2, deg40, deg15);
		// From 21° to 45°
		expect(result.x).toBeCloseTo(19.85);
		expect(result.y).toBeCloseTo(11.85);
	});
});
