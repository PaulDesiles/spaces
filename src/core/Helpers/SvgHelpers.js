
export function getShapePath(shape, closeShape) {
	let path = '';
	shape.forEach((s, i) => {
		path += (i === 0 ? 'M' : 'L');
		path += s.x + ' ' + s.y + ' ';
	});
	if (closeShape) {
		path += 'Z';
	}

	return path;
}

export function createSvgFileFromShapes(shapes, size) {
	let content = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.x}" height="${size.y}">\n`;

	shapes.forEach(shape => {
		let path = '<path stroke-width="0" fill="black"';
		path += ` d="${getShapePath(shape.points, true)}"`;
		path += ' />';
		content += path + '\n';
	});

	content += '</svg>';

	return content;
}
