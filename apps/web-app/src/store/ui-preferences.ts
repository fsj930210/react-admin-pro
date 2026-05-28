import { createStore } from "@rap/hooks/use-zustand";
import {
	DEFAULT_UI_PREFERENCES,
	PROJECT_UI_PREFERENCES,
	type DeepPartial,
	type UIPreferences,
} from "@/config/ui-preferences";

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};

export function mergeUIPreferences(
	base: UIPreferences,
	overrides?: DeepPartial<UIPreferences>,
): UIPreferences {
	if (!overrides) return structuredClone(base);

	const merge = (target: unknown, source: unknown): unknown => {
		if (!isPlainObject(target) || !isPlainObject(source)) {
			return source ?? target;
		}

		const result: Record<string, unknown> = { ...target };
		for (const key of Object.keys(source)) {
			result[key] = merge(result[key], source[key]);
		}
		return result;
	};

	return merge(base, overrides) as UIPreferences;
}

const readPreviewPreferences = (base: UIPreferences): DeepPartial<UIPreferences> | undefined => {
	if (typeof window === "undefined") return undefined;

	try {
		if (new URLSearchParams(window.location.search).has("resetUiPreferences")) {
			window.localStorage.removeItem(base.templatePreview.storageKey);
			return undefined;
		}
		if (!base.templatePreview.enabled || !base.templatePreview.persist) {
			window.localStorage.removeItem(base.templatePreview.storageKey);
			return undefined;
		}
		const rawValue = window.localStorage.getItem(base.templatePreview.storageKey);
		return rawValue ? (JSON.parse(rawValue) as DeepPartial<UIPreferences>) : undefined;
	} catch {
		return undefined;
	}
};

const projectPreferences = mergeUIPreferences(DEFAULT_UI_PREFERENCES, PROJECT_UI_PREFERENCES);
const initialPreferences = mergeUIPreferences(
	projectPreferences,
	readPreviewPreferences(projectPreferences),
);
initialPreferences.templatePreview.panelOpen = false;

interface UIPreferencesState {
	preferences: UIPreferences;
	projectPreferences: UIPreferences;
	setPreferences: (preferences: UIPreferences) => void;
	updatePreferences: (recipe: (draft: UIPreferences) => void) => void;
	resetPreview: () => void;
}

const persistPreview = (preferences: UIPreferences) => {
	if (typeof window === "undefined") return;
	if (!preferences.templatePreview.enabled || !preferences.templatePreview.persist) {
		window.localStorage.removeItem(preferences.templatePreview.storageKey);
		return;
	}
	const persistedPreferences = structuredClone(preferences);
	persistedPreferences.templatePreview.panelOpen = false;
	window.localStorage.setItem(
		preferences.templatePreview.storageKey,
		JSON.stringify(persistedPreferences),
	);
};

export const uiPreferencesStore = createStore<UIPreferencesState>(
	(set) => ({
		preferences: initialPreferences,
		projectPreferences,
		setPreferences: (preferences) => {
			set((state) => {
				state.preferences = {
					...preferences,
					templatePreview: {
						...preferences.templatePreview,
						panelOpen: false,
					},
				};
			});
			persistPreview(uiPreferencesStore.store.getState().preferences);
		},
		updatePreferences: (recipe) => {
			set((state) => {
				recipe(state.preferences);
			});
			persistPreview(uiPreferencesStore.store.getState().preferences);
		},
		resetPreview: () => {
			if (typeof window !== "undefined") {
				window.localStorage.removeItem(projectPreferences.templatePreview.storageKey);
			}
			set((state) => {
				state.preferences = structuredClone(projectPreferences);
				state.preferences.templatePreview.panelOpen = false;
			});
		},
	}),
	{
		name: "UIPreferencesStore",
	},
);

export const useUIPreferences = uiPreferencesStore.use;
