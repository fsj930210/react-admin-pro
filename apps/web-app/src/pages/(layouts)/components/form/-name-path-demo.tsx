import { Form, FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Button } from "@rap/components-ui/button";
import { useState } from "react";
import { z } from "zod";

import { DemoSection } from "./-demo-section";

const schema = z.object({
  user: z.object({
    profile: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Email format is invalid"),
    }),
  }),
});

type NamePathValues = z.infer<typeof schema>;

export function NamePathDemo() {
  const [values, setValues] = useState<NamePathValues>();

  return (
    <DemoSection title="Name Path">
      <Form<NamePathValues>
        layout="horizontal"
        className="max-w-2xl"
        initialValues={{
          user: {
            profile: {
              name: "",
              email: "",
            },
          },
        }}
        validators={{
          onSubmit: schema,
        }}
        onFinish={setValues}
      >
        <FormItem
          name={["user", "profile", "name"]}
          label="Profile name"
          required
          description="Array name path writes into values.user.profile.name."
        >
          <Input />
        </FormItem>

        <FormItem
          name={["user", "profile", "email"]}
          label="Profile email"
          required
          description="Array name path writes into values.user.profile.email."
        >
          <Input />
        </FormItem>

        <div className="col-start-2">
          <Button type="submit">Submit</Button>
        </div>

        {values ? (
          <pre className="col-span-full rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(values, null, 2)}
          </pre>
        ) : null}
      </Form>
    </DemoSection>
  );
}
