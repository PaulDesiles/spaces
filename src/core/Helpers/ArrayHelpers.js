
// Loop over array to find its i-th element
export function loopedGet(array, i) {
	const l = array.length;
	let index = i;
	while (index < 0) {
		index += l;
	}

	return array[index % l];
}

// Call a function to consecutive elements of an array (looping)
export function forEachConsecutive(array, callback, startingIndex) {
	const l = array.length;
	const nbArguments = callback.length;
	startingIndex = startingIndex || 0;
	while (startingIndex < 0) {
		startingIndex += l;
	}

	for (let i = startingIndex; i !== (l + startingIndex); ++i) {
		const parameters = [];
		for (let j = 0; j !== nbArguments; j++) {
			parameters.push(array[(i + j) % l]);
		}

		callback(...parameters);
	}
}

// Apply a transformation function to consecutive elements of an array (looping)
export function mapConsecutive(array, transformator) {
	const transformed = [];
	const l = array.length;
	const nbArguments = transformator.length;
	for (let i = 0; i !== l; ++i) {
		const parameters = [];
		for (let j = 0; j !== nbArguments; j++) {
			parameters.push(array[(i + j) % l]);
		}

		transformed.push(transformator(...parameters));
	}

	return transformed;
}

// Removes first occurence 'element' from the array if found
export function removeIfAny(array, element) {
	const index = array.indexOf(element);
	if (index >= 0) {
		array.splice(index, 1);
	}
}

// Filter method : only first occurence of an object will be returned
// usage: myArray.filter(distinct)
export function distinct(value, index, self) {
	return self.indexOf(value) === index;
}
