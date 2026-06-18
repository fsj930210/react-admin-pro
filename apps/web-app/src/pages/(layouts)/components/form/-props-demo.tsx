import { Form, FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Button } from "@rap/components-ui/button";
import { Checkbox } from "@rap/components-ui/checkbox";
import { useState } from "react";

import { DemoSection } from "./-demo-section";

type PropsValues = {
  agree: boolean;
  code: string;
  normalizedCode: string;
  displayName: string;
};

function ActionRow() {
  return (
    <div className="col-start-2">
      <Button type="submit">Submit</Button>
    </div>
  );
}

export function PropsDemo() {
  const [values, setValues] = useState<PropsValues>();

  return (
    <DemoSection title="Item Props">
      <Form
        layout="horizontal"
        className="max-w-2xl"
        initialValues={{
          agree: false,
          code: "",
          normalizedCode: "",
          displayName: "readonly text",
        }}
        onFinish={setValues}
      >
        <FormItem
          name="agree"
          label="valuePropName + trigger"
          valuePropName="checked"
          trigger="onCheckedChange"
        >
          <Checkbox />
        </FormItem>

        <FormItem
          name="code"
          label="getValueFromEvent"
          description="Transforms the event value before it enters Form state."
          getValueFromEvent={(event) => event.target.value.trim().toUpperCase()}
        >
          <Input placeholder="Trim and uppercase on change" />
        </FormItem>

        <FormItem
          name="normalizedCode"
          label="normalize"
          description="Transforms the parsed value with access to previous value and all previous values."
          normalize={(value) => String(value).replace(/\s/g, "-").toLowerCase()}
        >
          <Input placeholder="Replace spaces with hyphens" />
        </FormItem>

        <FormItem
          name="displayName"
          label="getValueProps"
          description="Maps Form state into control props."
          getValueProps={(value) => ({
            value: `Display: ${value}`,
            readOnly: true,
          })}
        >
          <Input />
        </FormItem>

        <div className="col-span-full rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          noStyle example below renders custom content without label/control/message wrappers.
        </div>

        <FormItem noStyle>
          <div className="col-span-full rounded-md bg-muted p-3 text-sm">
            Custom block rendered by <code>noStyle</code>.
          </div>
        </FormItem>

        <ActionRow />

        {values ? (
          <pre className="col-span-full rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(values, null, 2)}
          </pre>
        ) : null}
      </Form>
    </DemoSection>
  );
}
