type CallbackMap = Record<string, ((updater: unknown) => void) | undefined>;

/**
 * TanStack passes state changes as either a value or an updater function. When
 * multiple features listen to the same table callback, each feature must see the
 * same "previous -> next" transition. This composer does not let callbacks
 * override each other; it fans out the original updater to each listener in a
 * stable order. Individual feature hooks still own their own no-op checks, so
 * the updater is not expanded into extra React state writes here.
 */
export function composeTableCallbacks<TCallbacks extends object>(
	callbackGroups: Array<Partial<TCallbacks> | undefined>,
): Partial<TCallbacks> {
	const result: CallbackMap = {};
	const keys = new Set<string>();

	for (const callbacks of callbackGroups) {
		for (const key of Object.keys(callbacks ?? {})) {
			keys.add(key);
		}
	}

	for (const key of keys) {
		const handlers = callbackGroups
			.map((callbacks) => callbacks?.[key as keyof TCallbacks])
			.filter((handler) => typeof handler === "function") as Array<(updater: unknown) => void>;

		if (handlers.length === 1) {
			result[key] = handlers[0];
			continue;
		}

		result[key] = (updater: unknown) => {
			for (const handler of handlers) {
				handler(updater);
			}
		};
	}

	return result as Partial<TCallbacks>;
}
