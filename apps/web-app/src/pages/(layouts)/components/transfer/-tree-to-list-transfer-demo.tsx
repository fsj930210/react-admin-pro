import { Transfer, TransferPanel } from "@rap/components-ui/transfer";
import type { TreeNode } from "@rap/components-ui/tree/types";
import { useMemo, useState } from "react";
import {
  Section,
  TransferActions,
  TreeSourcePanelContent,
  TreeTargetListContent,
  flattenTree,
  treeTransferData,
} from "./-shared";

export function TreeToListTransferDemo() {
  const [value, setValue] = useState<string[]>(["frontend"]);
  const flatTree = useMemo(() => flattenTree(treeTransferData), []);

  return (
    <Section
      title="Tree to List Transfer"
      description="The source panel renders a Tree and the target panel renders a list. Moved nodes are removed from the source tree."
    >
      <Transfer<TreeNode>
        dataSource={flatTree}
        value={value}
        getValue={(item) => String(item.key)}
        getLabel={(item) => item.label}
        getDisabled={(item) => Boolean(item.disabled)}
        onChange={setValue}
      >
        <div className="flex min-h-0 flex-col gap-4 md:flex-row">
          <TransferPanel type="source" title="Organization tree">
            <TreeSourcePanelContent />
          </TransferPanel>
          <TransferActions />
          <TransferPanel type="target" title="Selected list">
            <TreeTargetListContent />
          </TransferPanel>
        </div>
      </Transfer>
    </Section>
  );
}
