import type { TreeFeature } from "../types";

export function crudFeature(): TreeFeature {
	return {
		name: "crud-feature",
		install() {
			// CRUD is implemented by the core instance so every adapter can use the same mutation path.
		},
	};
}
