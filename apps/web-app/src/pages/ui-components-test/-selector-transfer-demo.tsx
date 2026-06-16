import {
  Selector,
  SelectorContent,
  SelectorCount,
  SelectorFooter,
  SelectorSearch,
  SelectorSelectAll,
} from "@rap/components-ui/selector";
import {
  MoveAllToSourceAction,
  MoveAllToTargetAction,
  MoveToSourceAction,
  MoveToTargetAction,
  Transfer,
  TransferPanel,
} from "@rap/components-ui/transfer";

const selectorItems = [
  { label: "Dashboard", value: "dashboard" },
  { label: "Components", value: "components" },
  { label: "Settings", value: "settings" },
];

const transferItems = [
  { label: "Users", value: "users" },
  { label: "Roles", value: "roles" },
  { label: "Menus", value: "menus" },
  { label: "Logs", value: "logs" },
];

export function SelectorTransferDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Selector dataSource={selectorItems} defaultValue={["dashboard"]}>
        <SelectorSearch />
        <SelectorSelectAll />
        <SelectorContent />
        <SelectorFooter>
          <SelectorCount />
        </SelectorFooter>
      </Selector>

      <Transfer dataSource={transferItems} defaultValue={["roles"]}>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr]">
          <TransferPanel type="source" title="Available" className="h-72" />
          <div className="flex flex-col justify-center gap-2">
            <MoveAllToTargetAction />
            <MoveToTargetAction />
            <MoveToSourceAction />
            <MoveAllToSourceAction />
          </div>
          <TransferPanel type="target" title="Selected" className="h-72" />
        </div>
      </Transfer>
    </div>
  );
}
