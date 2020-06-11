// Backend api connections

// Ask for a new drawing id
export async function generateDrawingId() {
	try {
		const urlBase = process.env.VUE_APP_BACKENDURL;
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
export async function retrieveDrawing(id) {
	return undefined;
}
