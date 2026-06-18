import { DatePicker } from "@rap/components-pro/date-picker";
import { Form, FormItem } from "@rap/components-pro/form";
import { Input, PasswordInput } from "@rap/components-pro/input";
import { Select } from "@rap/components-pro/select";
import { Button } from "@rap/components-ui/button";
import { Checkbox } from "@rap/components-ui/checkbox";
import { Textarea } from "@rap/components-ui/textarea";
import { useState } from "react";
import { z } from "zod";

import { DemoSection } from "./-demo-section";

const schema = z.object({
  id: z.string(),
  username: z.string().min(2, "Username must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean(),
  status: z.string().min(1, "Status is required"),
  dueDate: z.any().refine(Boolean, "Due date is required"),
  remark: z.string().min(1, "Remark is required"),
});

export function BasicDemo() {
  const [submitValues, setSubmitValues] = useState<z.infer<typeof schema>>();

  return (
    <DemoSection title="Basic">
      <Form
        className="max-w-xl"
        initialValues={{
          id: "hidden-user-id",
          username: "",
          password: "",
          remember: true,
          status: "",
          dueDate: null,
          remark: "",
        }}
        validators={{
          onSubmit: schema,
        }}
        onFinish={(values) => {
          setSubmitValues(values);
        }}
        onValuesChange={(changedValues) => {
          console.log("changedValues", changedValues);
        }}
      >
        <FormItem name="id" hidden />
        <FormItem name="username" label="Username" required>
          <Input allowClear />
        </FormItem>
        <FormItem name="password" label="Password" required>
          <PasswordInput allowClear />
        </FormItem>
        <FormItem
          name="remember"
          label="Remember me"
          valuePropName="checked"
          trigger="onCheckedChange"
        >
          <Checkbox />
        </FormItem>
        <FormItem name="status" label="Status" required>
          <Select
            allowClear
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Archived", value: "archived" },
            ]}
          />
        </FormItem>
        <FormItem name="dueDate" label="Due date" required>
          <DatePicker className="w-full" />
        </FormItem>
        <FormItem name="remark" label="Remark" required>
          <Textarea />
        </FormItem>
        <Button type="submit" className="w-fit">
          Submit
        </Button>
        {submitValues ? (
          <pre className="rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(submitValues, null, 2)}
          </pre>
        ) : null}
      </Form>
    </DemoSection>
  );
}
