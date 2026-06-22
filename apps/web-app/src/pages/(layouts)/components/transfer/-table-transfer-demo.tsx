import { Transfer, TransferPanel } from "@rap/components-ui/transfer";
import { useState } from "react";
import { DataGridPanelContent, Section, TransferActions, dataSource, type User } from "./-shared";

export function TableTransferDemo() {
  const [value, setValue] = useState<string[]>(["user-1", "user-3"]);

  return (
    <Section
      title="DataGrid Transfer"
      description="Table panels render DataGrid with internal pagination."
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
          <TransferPanel type="source" title="Available table">
            <DataGridPanelContent />
          </TransferPanel>
          <TransferActions />
          <TransferPanel type="target" title="Selected table">
            <DataGridPanelContent />
          </TransferPanel>
        </div>
      </Transfer>
    </Section>
  );
}
