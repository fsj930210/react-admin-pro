import { Button } from "@rap/components-ui/button";
import { useTranslation } from "@rap/i18n";
import { useRouterState } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useAppContext } from "@/app-context";

export function ReloadFeature(props: React.ComponentProps<"button">) {
  const { t } = useTranslation("webApp");
  const { eventBus } = useAppContext();
  const fullUrl = useRouterState({
    select: (state) => state.location.pathname + state.location.searchStr,
  });

  const handleReload = () => {
    eventBus.emit({
      type: "reload-tab",
      payload: fullUrl,
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleReload}
      title={t("header.reloadCurrentPage")}
      {...props}
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
}
