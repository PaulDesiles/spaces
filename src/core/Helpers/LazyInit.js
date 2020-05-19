// Adds lazy getters to instance
export function lazyInit(that, initializers) {
	Object.values(initializers)
		.forEach(initializer => {
			Object.defineProperty(that, initializer.name, {
				get() {
					Object.defineProperty(that, initializer.name, {
						configurable: true,
						enumerable: true,
						value: initializer.apply(that),
						writable: true
					});
					return that[initializer.name];
				},
				configurable: true,
				enumerable: true
			});
		});
}
