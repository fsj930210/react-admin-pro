import { Transfer, TransferPanel } from "@rap/components-ui/transfer";
import { useState } from "react";
import {
  dataSource,
  initialValue,
  ListPanelContent,
  PanelFooter,
  Section,
  TransferActions,
  type User,
} from "./-shared";

export function BasicTransferDemo() {
  const [value, setValue] = useState<string[]>(initialValue);

  return (
    <Section
      title="Basic Transfer"
      description="Fixed-height panels keep long text from stretching the layout."
    >
      <Transfer<User>
        dataSource={dataSource}
        value={value}
        getValue={(item) => item.id}
        getLabel={(item) => item.name}
        getDisabled={(item) => item.disabled || item.status === "locked"}
        onChange={setValue}
      >
        <div className="flex min-h-0 flex-col gap-4 md:flex-row">
          <TransferPanel
            type="source"
            title="Available members"
            footer={<PanelFooter type="source" />}
          >
            <ListPanelContent placeholder="Search available" />
          </TransferPanel>
          <TransferActions />
          <TransferPanel
            type="target"
            title="Selected members"
            footer={<PanelFooter type="target" />}
          >
            <ListPanelContent placeholder="Search selected" />
          </TransferPanel>
        </div>
      </Transfer>
    </Section>
  );
}
