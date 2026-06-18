import { Form, FormItem, useForm } from "@rap/components-pro/form";
import { Input, NumberInput } from "@rap/components-pro/input";
import { Button } from "@rap/components-ui/button";
import { Checkbox } from "@rap/components-ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rap/components-ui/select";
import { useState } from "react";

import { DemoSection } from "./-demo-section";

type AdvancedValues = {
  id: string;
  title: string;
  type: "personal" | "company";
  companyName: string;
  amount?: number;
  enabled: boolean;
};

export function AdvancedDemo() {
  const form = useForm<AdvancedValues>({
    defaultValues: {
      id: "advanced-hidden-id",
      title: "Quarterly plan",
      type: "personal",
      companyName: "",
      amount: 12,
      enabled: true,
    },
  });
  const [values, setValues] = useState<AdvancedValues>();

  return (
    <DemoSection title="Advanced">
      <Form
        form={form}
        layout="horizontal"
        className="max-w-2xl"
        onFinish={setValues}
        onValuesChange={(changedValues) => {
          console.log("advanced changed", changedValues);
        }}
      >
        <FormItem name="id" hidden />
        <FormItem name="title" label="Title" required>
          <Input allowClear />
        </FormItem>

        <FormItem name="type" label="Account type">
          {({ field, form }) => (
            <Select
              value={field.state.value}
              onValueChange={(value: AdvancedValues["type"]) => {
                field.handleChange(value);

                if (value !== "company") {
                  form.setFieldValue("companyName", "");
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormItem>

        <FormItem noStyle dependencies={["type"]}>
          {({ getFieldValue }) =>
            getFieldValue("type") === "company" ? (
              <FormItem name="companyName" label="Company name" required>
                <Input />
              </FormItem>
            ) : null
          }
        </FormItem>

        <FormItem name="amount" label="Budget">
          <NumberInput min={0} precision={2} prefix="$" />
        </FormItem>

        <FormItem
          name="enabled"
          label="Enabled"
          valuePropName="checked"
          trigger="onCheckedChange"
        >
          <Checkbox />
        </FormItem>

        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setValues(undefined);
            }}
          >
            Reset
          </Button>
        </div>

        {values ? (
          <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(values, null, 2)}</pre>
        ) : null}
      </Form>
    </DemoSection>
  );
}
