import { Button } from "@rap/components-ui/button";
import {
  MoveToSourceAction,
  MoveToTargetAction,
  Transfer,
  TransferPanel,
} from "@rap/components-ui/transfer";
import { useState } from "react";
import { Section, dataSource, type User } from "./-shared";

export function CustomActionTransferDemo() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <Section
      title="Custom actions"
      description="Action components expose render props so business buttons can replace the defaults."
    >
      <Transfer<User>
        dataSource={dataSource.slice(0, 18)}
        value={value}
        getValue={(item) => item.id}
        getLabel={(item) => item.name}
        onChange={setValue}
      >
        <div className="flex min-h-0 flex-col gap-4 md:flex-row">
          <TransferPanel type="source" title="Candidates" />
          <div className="flex shrink-0 flex-row items-center justify-center gap-2 md:flex-col">
            <MoveToTargetAction>
              {({ action, disabled }) => (
                <Button type="button" disabled={disabled} onClick={action}>
                  Add
                </Button>
              )}
            </MoveToTargetAction>
            <MoveToSourceAction>
              {({ action, disabled }) => (
                <Button type="button" variant="outline" disabled={disabled} onClick={action}>
                  Remove
                </Button>
              )}
            </MoveToSourceAction>
          </div>
          <TransferPanel type="target" title="Result" />
        </div>
      </Transfer>
    </Section>
  );
}
