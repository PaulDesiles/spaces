// Backend api connections

// If the url is not defined, we'll run offline
const urlBase = process.env.VUE_APP_BACKENDURL;

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

// Ask for a new drawing id
export async function getNewIdAsync() {
	return safelyRun(async () => {
		const response = await fetch(`${urlBase}/generateId`);
		if (response.ok) {
			const {id} = await response.json();
			return id;
		}

		console.log(response);
		return undefined;
	});
}

// Retrieve drawing data from an id
export async function getDrawingAsync(id) {
	return safelyRun(async () => {
		const response = await fetch(`${urlBase}/drawing/${id}`);
		if (response.ok) {
			return await response.json();
		}

		console.log(response);
		return undefined;
	});
}
