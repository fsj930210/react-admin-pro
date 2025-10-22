/** biome-ignore-all lint:suspicious/noExplicitAny*/

import type { TreeItemInstance } from "./types";

export function defineProperty(
	obj: Record<string, any>,
	key: string,
	descriptor: PropertyDescriptor,
) {
	const desc = Object.getOwnPropertyDescriptor(obj, key);
	if (desc && desc.configurable) {
		delete obj[key];
	}
	Object.defineProperty(obj, key, {
		...desc,
		...descriptor,
		configurable: true,
	});
}

export function getItemsByKeys(
	items: Map<string, TreeItemInstance>,
	keys: string[],
): TreeItemInstance[] {
	return keys.map((key) => items.get(key) as TreeItemInstance);
}
