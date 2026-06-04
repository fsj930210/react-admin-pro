import { Button } from "@rap/components-ui/button";
import { Settings2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { useUIPreferences } from "@/store/ui-preferences";

const UIPreferencesPanel = lazy(() => import("./ui-preferences-panel"));

export function UIPreferencesPreview() {
  const preferences = useUIPreferences("preferences");
  const updatePreferences = useUIPreferences((state) => state.updatePreferences);

  if (!preferences.templatePreview.enabled) return null;

  const openPanel = () => {
    updatePreferences((draft) => {
      draft.templatePreview.panelOpen = true;
    });
  };

  return (
    <>
      <Button
        type="button"
        size="icon"
        className="fixed right-5 bottom-5 z-100 rounded-full shadow-lg"
        title="偏好设置"
        onClick={openPanel}
      >
        <Settings2 className="size-4" />
      </Button>
      {preferences.templatePreview.panelOpen && (
        <Suspense fallback={null}>
          <UIPreferencesPanel />
        </Suspense>
      )}
    </>
  );
}
