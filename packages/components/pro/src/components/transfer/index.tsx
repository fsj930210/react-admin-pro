import * as React from "react";
import { type ReactNode } from "react";
import {
  MoveAllToSourceAction,
  MoveAllToTargetAction,
  MoveToSourceAction,
  MoveToTargetAction,
  Transfer as UITransfer,
  TransferPanel,
  type TransferProps as UITransferProps,
} from "@rap/components-ui/transfer";
import { Space } from "@rap/components-ui/space";
import { When } from "@rap/components-ui/when";
import { cn } from "@rap/utils";

export interface TransferProps<T, V extends string | number = string> extends UITransferProps<
  T,
  V
> {
  sourceTitle?: React.ReactNode;
  targetTitle?: React.ReactNode;
  showMoveAllButtons?: boolean;
}

export function Transfer<T = any, V extends string | number = string>({
  sourceTitle = "待选",
  targetTitle = "已选",
  className,
  showMoveAllButtons = false,
  ...props
}: TransferProps<T, V>) {
  return (
    <UITransfer className={cn("min-h-0", className)} {...props}>
      <div className="flex min-h-0 items-center gap-3">
        <TransferPanel className="min-w-0 flex-1" type="source" title={sourceTitle} />
        <Space className="flex-col" direction="vertical">
          <MoveToTargetAction />
          <MoveToSourceAction />
          <When condition={showMoveAllButtons}>
            <MoveAllToTargetAction />
            <MoveAllToSourceAction />
          </When>
        </Space>
        <TransferPanel className="min-w-0 flex-1" type="target" title={targetTitle} />
      </div>
    </UITransfer>
  );
}
