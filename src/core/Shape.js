import {Point} from './Point';
import {Intersection} from './Intersection';
import {Line} from './Line';
import {isFormClockwiseOriented, moveSegmentOutside, getIntersection} from './Helpers/GeometryHelpers';
import {mapConsecutive, forEachConsecutive, removeIfAny} from './Helpers/ArrayHelpers';

let shapeCount = 0;
export class Shape {
	constructor(points, xmax, ymax, formsGap) {
		this.points = [...points];

		let clockwisePoints = this.points;
		if (!isFormClockwiseOriented(clockwisePoints)) {
			clockwisePoints = [...points].reverse();
		}

		const lineMap = new Map(mapConsecutive(clockwisePoints, (A, B) => {
			let line = A.crossingLines.find(l => l.includes(B));

			if (line === undefined) {
				line = B.crossingLines.find(l => l.includes(A));
			}

			if (line === undefined) {
				line = new Line(A, B, xmax, ymax);
			} else {
				line.addPoint(A);
				line.addPoint(B);
			}

			return [A, line];
		}));

		this.lines = Array.from(lineMap.values());
		this.spacedLines = [];

		const createParallelLines = (A, B, C, D) => {
			const AB = lineMap.get(A);
			const BC = lineMap.get(B);
			const CD = lineMap.get(C);

			let parallelLine;
			let B2;
			let C2;
			let Btemp;
			let Ctemp;

			// Retrieve previously created line and points
			if (BC.parallels.length > 0) {
				parallelLine = BC.parallels[0]; // TODO: correct this wrong assumption !

				B2 = parallelLine.getKnownIntersectionWith(AB);
				C2 = parallelLine.getKnownIntersectionWith(CD);

				if (B2 === undefined) {
					Btemp = parallelLine.intersections.find(i => i !== C2);
				} else {
					Btemp = B2;
				}

				if (C2 === undefined) {
					Ctemp = parallelLine.intersections.find(i => i !== B2 && i !== Btemp);
				} else {
					Ctemp = C2;
				}
			}

			if (B2 === undefined || C2 === undefined) {
				if (Btemp === undefined || Ctemp === undefined) {
					const movedBC = moveSegmentOutside(B, C, formsGap);
					Btemp = Btemp || movedBC.A2;
					Ctemp = Ctemp || movedBC.B2;
				}

				// Get intersections with the form's previous and next segment
				// to keep points that have more interest
				if (B2 === undefined) {
					const i = getIntersection(A, B, Btemp, Ctemp);
					B2 = i instanceof Point ? Intersection.createFrom(i) : Btemp;
				}

				if (C2 === undefined) {
					const i = getIntersection(Btemp, Ctemp, C, D);
					C2 = i instanceof Point ? Intersection.createFrom(i) : Ctemp;
				}
			}

			if (parallelLine === undefined) {
				parallelLine = new Line(B2, C2, xmax, ymax);
			} else {
				parallelLine.addPoint(B2);
				parallelLine.addPoint(C2);
			}

			AB.addPoint(B2);
			CD.addPoint(C2);

			Line.linkParallelLines(BC, parallelLine);
			this.spacedLines.push(parallelLine);
		};

		forEachConsecutive(clockwisePoints, createParallelLines, -1);

		forEachConsecutive(this.spacedLines, (l1, l2) => {
			l1.getOrCreateIntersectionWith(l2);
		});

		this.lines
			.concat(this.spacedLines)
			.forEach(l => l.linkedShapes.push(this));

		this.id = 'S' + shapeCount++;
	}

	updateIntersections(lines) {
		const newLines = this.lines.concat(this.spacedLines);
		lines.forEach(line => {
			newLines.forEach(newLine => {
				line.getOrCreateIntersectionWith(newLine);
			});
		});
	}

	removeAllLinks() {
		// Remove all links on lines that are linked only to this shape
		const myLines = this.lines
			.concat(this.spacedLines)
			.filter(line => line.linkedShapes.length === 1);

		myLines.forEach(line => {
			line.parallels.forEach(p => {
				removeIfAny(p.parallels, line);
			});
			line.parallels = [];
			line.linkedShapes = [];
		});

		[...myLines.map(line => line.intersections).flat()]
			.forEach(i => {
				i.crossingLines.forEach(l => {
					removeIfAny(l.intersections, i);
				});

				myLines.forEach(l => {
					removeIfAny(i.crossingLines, l);
				});
			});
	}
}
