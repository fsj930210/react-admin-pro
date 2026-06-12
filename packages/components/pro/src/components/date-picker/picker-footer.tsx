import { Button } from "@rap/components-ui/button";
import { cn } from "@rap/utils";
import type { ReactNode } from "react";
import type { PickerFooterActions, PickerPanelContext } from "./types";

interface PickerFooterProps {
  context: PickerPanelContext;
  footer?: ReactNode | ((context: PickerPanelContext) => ReactNode) | null;
  actions?: PickerFooterActions;
  onToday?: () => void;
  onClear?: () => void;
  className?: string;
}

function PickerFooter(props: PickerFooterProps) {
  const { context, footer, actions = { today: true, clear: true }, onToday, onClear, className } = props;
  const customFooter = typeof footer === "function" ? footer(context) : footer;
  const showToday = !!actions && actions.today !== false;
  const showClear = !!actions && actions.clear !== false;

  if (!showToday && !showClear && !customFooter) {
    return null;
  }

  return (
    <div className={cn("border-t p-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {showToday ? (
            <Button type="button" variant="ghost" size="sm" onClick={onToday}>
              今天
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {showClear ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              清空
            </Button>
          ) : null}
          {customFooter}
        </div>
      </div>
    </div>
  );
}

export { PickerFooter };
