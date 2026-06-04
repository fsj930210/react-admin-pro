import { Button } from "@rap/components-ui/button";
import { Settings2 } from "lucide-react";
import { useUIPreferences } from "@/store/ui-preferences";

export function UIPreferencesFeature() {
  const preferences = useUIPreferences("preferences");
  const updatePreferences = useUIPreferences((state) => state.updatePreferences);

  if (!preferences.templatePreview.enabled) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title="偏好设置"
      onClick={() =>
        updatePreferences((draft) => {
          draft.templatePreview.panelOpen = true;
        })
      }
    >
      <Settings2 className="size-4" />
      <span className="sr-only">偏好设置</span>
    </Button>
  );
}
