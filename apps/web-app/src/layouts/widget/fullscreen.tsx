import { Button } from "@rap/components-ui/button";
import { useTranslation } from "@rap/i18n";
import { Maximize, Minimize } from "lucide-react";
import { useState } from "react";

export function FullscreenFeature(props: React.ComponentProps<"button">) {
  const { t } = useTranslation("webApp");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFullscreen}
      title={isFullscreen ? t("header.fullscreenExit") : t("header.fullscreenEnter")}
      {...props}
    >
      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
    </Button>
  );
}
