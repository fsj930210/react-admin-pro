import isEqual from "lodash-es/isEqual";
import type { Draft } from "immer";
import type { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
	createWithEqualityFn,
	useStoreWithEqualityFn,
} from "zustand/traditional";

type EqualityFn<T> = (prev: T, next: T) => boolean;
type StoreSelector<T extends object, R> = (state: T) => R;
type SelectorParam<T extends object> =
	| keyof T
	| ReadonlyArray<keyof T>
	| StoreSelector<T, unknown>;

type SelectorResult<T extends object, S> = S extends StoreSelector<T, infer R>
	? R
	: S extends ReadonlyArray<keyof T>
		? Pick<T, S[number]>
		: S extends keyof T
			? T[S]
			: never;
type ObjectKeys<T extends object> = {
	[K in keyof T]: T[K] extends object ? K : never;
}[keyof T];

interface CreateStoreOptions {
	name?: string;
	equalityFn?: EqualityFn<unknown>;
}

export type StoreSet<T extends object> = <K extends keyof T>(
	key: K,
	value: T[K]
) => void;

export type StoreUpdate<T extends object> = <K extends ObjectKeys<T>>(
	key: K,
	recipe: (draft: Draft<T[K]>) => void
) => void;

export type StoreUpdateState<T extends object> = (
	recipe: (draft: Draft<T>) => void
) => void;

export type SetterFunction<T extends object, K extends keyof T> = (
	nextValue: T[K] | ((draft: Draft<T[K]>, state: Draft<T>) => void)
) => void;

function smartEqual<T>(
	prev: T,
	next: T,
	customEqual?: EqualityFn<T>
): boolean {
	if (customEqual) {
		return customEqual(prev, next);
	}
	if (Object.is(prev, next)) {
		return true;
	}
	if (shallow(prev, next)) {
		return true;
	}
	return isEqual(prev, next);
}

function buildSelector<T extends object, S extends SelectorParam<T>>(
	selector: S
): StoreSelector<T, SelectorResult<T, S>> {
	return ((state: T) => {
		if (typeof selector === "function") {
			return selector(state);
		}

		if (Array.isArray(selector)) {
			const keys = selector as ReadonlyArray<keyof T>;
			return keys.reduce<Partial<T>>((picked, key) => {
				picked[key] = state[key];
				return picked;
			}, {});
		}

		return state[selector as keyof T];
	}) as StoreSelector<T, SelectorResult<T, S>>;
}

/**
 * Creates a zustand store with immer, devtools, and smart equality.
 *
 * Read:
 * - use("count") returns the field value
 * - use(["count", "layoutConfig"]) returns a picked object
 * - use((state) => state.xxx) supports custom selectors
 *
 * Write:
 * - set("count", 1) replaces a field
 * - update("layoutConfig", draft => {}) updates one field with immer
 * - updateState(draft => {}) updates multiple fields in one transaction
 */
export function createStore<T extends object>(
	initializer: StateCreator<T, [["zustand/immer", never]], []>,
	options?: CreateStoreOptions
) {
	const store = createWithEqualityFn<T>()(
		devtools(immer(initializer), { name: options?.name }),
		(prev, next) => smartEqual(prev, next, options?.equalityFn)
	);

	function use<S extends SelectorParam<T>>(
		selector: S,
		equalityFn?: EqualityFn<SelectorResult<T, S>>
	): SelectorResult<T, S> {
		return useStoreWithEqualityFn(
			store,
			buildSelector(selector),
			(prev, next) => smartEqual(prev, next, equalityFn)
		);
	}

	const set: StoreSet<T> = (key, value) => {
		store.setState((state) => {
			(state as Record<typeof key, T[typeof key]>)[key] = value;
		});
	};

	const update: StoreUpdate<T> = (key, recipe) => {
		store.setState((state) => {
			recipe((state as Record<typeof key, Draft<T[typeof key]>>)[key]);
		});
	};

	const updateState: StoreUpdateState<T> = (recipe) => {
		store.setState((state) => {
			recipe(state);
		});
	};

	return { store, use, set, update, updateState };
}

export function createSetter<S extends object, K extends keyof S>(
	set: (fn: (state: Draft<S>) => void) => void,
	key: K
): SetterFunction<S, K> {
	return (nextValue) =>
		set((state) => {
			if (typeof nextValue === "function") {
				(nextValue as (draft: Draft<S[K]>, state: Draft<S>) => void)(
					(state as Record<K, Draft<S[K]>>)[key],
					state
				);
				return;
			}

			(state as Record<K, S[K]>)[key] = nextValue;
		});
}
