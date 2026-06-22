import { Transfer, TransferPanel } from "@rap/components-ui/transfer";
import { useState } from "react";
import { PaginatedList, Section, TransferActions, dataSource, type User } from "./-shared";

export function PaginatedTransferDemo() {
  const [value, setValue] = useState<string[]>(["user-7", "user-8"]);

  return (
    <Section
      title="Paginated Selector Transfer"
      description="Pagination lives inside each panel footer, not outside Transfer."
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
          <TransferPanel type="source" title="Available pages">
            <PaginatedList />
          </TransferPanel>
          <TransferActions />
          <TransferPanel type="target" title="Selected pages">
            <PaginatedList pageSize={6} />
          </TransferPanel>
        </div>
      </Transfer>
    </Section>
  );
}
