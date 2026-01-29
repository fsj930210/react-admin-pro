import { RefreshCw } from "lucide-react";
import { Button } from "@rap/components-base/button";

interface ReloadCurrentTabFeatureProps {
  className?: string;
}

export function ReloadCurrentTabFeature({ className }: ReloadCurrentTabFeatureProps) {
  const handleReload = () => {
    // 重新加载当前页面
    window.location.reload();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleReload}
      className={className}
      title="重新加载当前页面"
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
}