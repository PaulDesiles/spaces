// Backend api connections

// If the url is not defined, we'll run offline
const urlBase = process.env.VUE_APP_BACKENDURL;

let serverShapeIds = [];
const callMinInterval = 3000;
let lastCallTime;
let callScheduled = false;

async function safelyRun(asyncAction) {
	try {
		if (urlBase) {
			return await asyncAction();
		}
	} catch (error) {
		console.log(error);
	}

	return undefined;
}

function delay(duration) {
	return new Promise(resolve => setTimeout(resolve, duration));
}

// Ask for a new drawing id
export async function getNewIdAsync() {
	try {
		if (urlBase) {
			const response = await fetch(`${urlBase}/generateId`);
			if (response.ok) {
				const {id} = await response.json();
				return id;
			}

			console.log(response);
		}
	} catch (error) {
		console.log(error);
	}

	return undefined;
}

// Retrieve drawing data from an id
export async function getDrawingAsync(id) {
	try {
		if (urlBase && id) {
			const response = await fetch(`${urlBase}/drawing/${id}`);
			if (response.ok) {
				const drawing = await response.json();
				serverShapeIds = drawing.shapes.map(s => s._id);
				return drawing;
			}

			console.log(response);
		}
	} catch (error) {
		console.log(error);
	}

	return undefined;
}

// Limit the backend calls to one call every {callMinInterval}
// If other calls are asked while already waiting, they are dismissed :
// since all calls are constructed as a batch of changes only one call is necessary
export async function alertShapeChangesAsync(id, shapes) {
	try {
		if (urlBase && id && !callScheduled) {
			callScheduled = true;

			let now = Date.now();
			const durationBeforeNextCall = lastCallTime ?
				lastCallTime + callMinInterval - now :
				-1; // First call should not wait

			if (durationBeforeNextCall > 0) {
				await delay(durationBeforeNextCall);
				now += durationBeforeNextCall;
			}

			lastCallTime = now;
			callScheduled = false;
			await sendShapeChangesAsync(id, shapes);
		}
	} catch (error) {
		console.log(error);
		callScheduled = false;
	}
}

// Send a batch of shapes changes (addition or removal) since last call
async function sendShapeChangesAsync(id, shapes) {
	try {
		const addShapes = [];
		const knownShapeIds = [];
		shapes.forEach(s => {
			if (s.remoteId) {
				knownShapeIds.push(s.remoteId);
			} else {
				addShapes.push({
					points: s.points.map(p => {
						return {x: p.x, y: p.y};
					})
				});
			}
		});
		const removeShapeIds = serverShapeIds.filter(id => !knownShapeIds.includes(id));

		if (addShapes.length > 0 || removeShapeIds.length > 0) {
			const response = await fetch(`${urlBase}/drawing/${id}`,
				{
					method: 'PUT',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({
						removeShapeIds,
						addShapes
					})
				}
			);

			if (response.ok) {
				const {shapeIds} = await response.json();
				if (shapeIds) {
					serverShapeIds = shapeIds;
				}
			} else {
				console.log(response);
			}
		}
	} catch (error) {
		console.log(error);
	}
}
