import * as React from "react";
import {
  MoveAllToSourceAction,
  MoveAllToTargetAction,
  MoveToSourceAction,
  MoveToTargetAction,
  Transfer as UITransfer,
  TransferPanel,
  type TransferProps as UITransferProps,
} from "@rap/components-ui/transfer";
import { Input } from "@rap/components-ui/input";
import { ProButtonGroup } from "../button";
import type { ProOption } from "../select";
import { cn } from "@rap/utils";

export interface TransferProps<T = any, V extends string | number = string> extends UITransferProps<
  T,
  V
> {
  sourceTitle?: React.ReactNode;
  targetTitle?: React.ReactNode;
}

export function Transfer<T = any, V extends string | number = string>({
  sourceTitle = "待选",
  targetTitle = "已选",
  className,
  ...props
}: TransferProps<T, V>) {
  return (
    <UITransfer className={cn("min-h-0", className)} {...props}>
      <div className="flex min-h-0 items-center gap-3">
        <TransferPanel className="min-w-0 flex-1" type="source" title={sourceTitle} />
        <ProButtonGroup className="flex-col">
          <MoveToTargetAction />
          <MoveToSourceAction />
          <MoveAllToTargetAction />
          <MoveAllToSourceAction />
        </ProButtonGroup>
        <TransferPanel className="min-w-0 flex-1" type="target" title={targetTitle} />
      </div>
    </UITransfer>
  );
}

export interface TreeTransferProps<T = any, V extends string | number = string> extends Omit<
  TransferProps<T, V>,
  "dataSource"
> {
  treeData?: ProOption<string | number>[];
  requestItems: (node: ProOption<string | number> | null, keyword: string) => Promise<T[]>;
  treeTitle?: React.ReactNode;
}

export function TreeTransfer<T = any, V extends string | number = string>({
  treeData = [],
  requestItems,
  treeTitle = "筛选",
  className,
  ...props
}: TreeTransferProps<T, V>) {
  const [activeNode, setActiveNode] = React.useState<ProOption<string | number> | null>(null);
  const [keyword, setKeyword] = React.useState("");
  const [items, setItems] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    void requestItems(activeNode, keyword)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [activeNode, keyword, requestItems]);

  const renderTree = (nodes: ProOption<string | number>[]) => (
    <div className="space-y-1">
      {nodes.map((node) => (
        <div key={String(node.value)}>
          <button
            type="button"
            className={cn(
              "w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent",
              activeNode?.value === node.value && "bg-accent"
            )}
            onClick={() => setActiveNode(node)}
          >
            {node.label}
          </button>
          {node.children?.length ? <div className="ml-4">{renderTree(node.children)}</div> : null}
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("flex min-h-0 gap-3", className)}>
      <aside className="flex h-[520px] w-64 shrink-0 flex-col rounded-md border bg-background">
        <div className="border-b px-3 py-2 font-medium text-sm">{treeTitle}</div>
        <div className="min-h-0 flex-1 overflow-auto p-2">{renderTree(treeData)}</div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索待选项"
          />
          {loading ? <span className="text-muted-foreground text-sm">加载中...</span> : null}
        </div>
        <Transfer dataSource={items} {...props} />
      </div>
    </div>
  );
}
