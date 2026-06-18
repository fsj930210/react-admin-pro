import { Form, FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Button } from "@rap/components-ui/button";
import { useState } from "react";

import { DemoSection } from "./-demo-section";

type HiddenValues = {
  id: string;
  source: string;
  name: string;
};

export function HiddenDemo() {
  const [values, setValues] = useState<HiddenValues>();

  return (
    <DemoSection title="Hidden Field">
      <Form
        className="max-w-xl"
        initialValues={{
          id: "user-10001",
          source: "components-form-demo",
          name: "",
        }}
        onFinish={setValues}
      >
        <FormItem name="id" hidden />
        <FormItem name="source" hidden />
        <FormItem name="name" label="Name" required>
          <Input />
        </FormItem>
        <Button type="submit" className="w-fit">
          Submit
        </Button>
        {values ? (
          <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(values, null, 2)}</pre>
        ) : null}
      </Form>
    </DemoSection>
  );
}
