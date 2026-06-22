import { createFileRoute } from "@tanstack/react-router";
import { BasicTransferDemo } from "./-basic-transfer-demo";
import { CustomActionTransferDemo } from "./-custom-action-transfer-demo";
import { PaginatedTransferDemo } from "./-paginated-transfer-demo";
import { TableTransferDemo } from "./-table-transfer-demo";
import { TreeToListTransferDemo } from "./-tree-to-list-transfer-demo";
import { TreeTransferDemo } from "./-tree-transfer-demo";

export const Route = createFileRoute("/(layouts)/components/transfer/")({
  component: TransferDemo,
});

function TransferDemo() {
  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Transfer Components</h1>
        <p className="mt-2 text-muted-foreground">
          Transfer manages source and target collections. Panels can render lists, DataGrid, Tree,
          or paginated Selector views.
        </p>
      </div>
      <div className="space-y-6">
        <BasicTransferDemo />
        <TableTransferDemo />
        <TreeTransferDemo />
        <TreeToListTransferDemo />
        <PaginatedTransferDemo />
        <CustomActionTransferDemo />
      </div>
    </div>
  );
}
