import { PanelLeft, PanelRight } from "lucide-react";
import { Button } from "@rap/components-base/button";
import { useSidebar } from "@rap/components-base/resizable-sidebar";

interface CollapseSidebarFeatureProps {
  className?: string;
}

export function CollapseSidebarFeature({ className }: CollapseSidebarFeatureProps) {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={className}
      title={state === 'collapsed' ? '展开侧边栏' : '收起侧边栏'}
    >
      {state === 'collapsed' ? (
        <PanelRight className="h-4 w-4" />
      ) : (
        <PanelLeft className="h-4 w-4" />
      )}
    </Button>
  );
}