import { Button } from "@rap/components-ui/button";
import { useTranslation } from "@rap/i18n";
import { RefreshCw } from "lucide-react";

export function ReloadFeature(props: React.ComponentProps<"button">) {
  const { t } = useTranslation("webApp");
  const handleReload = () => {
    window.location.reload();
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
