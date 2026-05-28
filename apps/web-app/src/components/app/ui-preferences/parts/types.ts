import type { UIPreferences } from "@/config/ui-preferences";

export interface PreferencesPanelProps {
	preferences: UIPreferences;
	updatePreferences: (recipe: (draft: UIPreferences) => void) => void;
}
