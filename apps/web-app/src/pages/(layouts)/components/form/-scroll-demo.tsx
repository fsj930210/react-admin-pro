import { Form, FormItem } from "@rap/components-pro/form";
import { Input, PasswordInput } from "@rap/components-pro/input";
import { Button } from "@rap/components-ui/button";
import { cn } from "@rap/utils";
import type { ComponentProps } from "react";
import { z } from "zod";

import { DemoSection } from "./-demo-section";

const scrollSchema = z.object({
  title: z.string().min(1, "Title is required"),
  owner: z.string().min(1, "Owner is required"),
  reviewer: z.string().min(1, "Reviewer is required"),
  customCode: z.string().min(1, "Custom code is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function CustomInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-[border-color,box-shadow]",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/45",
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
        className
      )}
    />
  );
}

export function ScrollDemo() {
  return (
    <DemoSection title="scrollToFirstError">
      <div className="max-w-2xl rounded-md border">
        <Form
          layout="horizontal"
          className="grid max-h-96 overflow-auto p-4"
          id="scroll-error-demo-form"
          initialValues={{
            title: "",
            owner: "",
            reviewer: "",
            customCode: "",
            password: "",
          }}
          validators={{
            onSubmit: scrollSchema,
          }}
          scrollToFirstError
        >
          <div className="col-span-full rounded-md bg-muted p-3 text-sm text-muted-foreground">
            The submit button stays visible outside the scroll area. Submit while fields are empty
            and the inner form scrolls to the first invalid control.
          </div>
          <div className="col-span-full rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            For custom controls, pass Form injected props to a real DOM control. The scroll logic
            finds the first element with <code>aria-invalid="true"</code>; focus only works when
            that element can receive focus.
          </div>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="contents">
              <div className="self-start pt-2.5 text-right text-sm font-medium">
                Readonly {index + 1}
              </div>
              <Input readOnly value={`Filler row ${index + 1}`} />
            </div>
          ))}
          <FormItem name="title" label="Title" required>
            <Input />
          </FormItem>
          <FormItem name="owner" label="Owner" required>
            <Input />
          </FormItem>
          <FormItem name="reviewer" label="Reviewer" required>
            <Input />
          </FormItem>
          <FormItem
            name="customCode"
            label="Custom code"
            required
            description="Custom controls must pass aria-invalid to a real DOM element so scrollToFirstError can find it."
          >
            <CustomInput />
          </FormItem>
          <FormItem name="password" label="Password" required>
            <PasswordInput />
          </FormItem>
        </Form>
        <div className="sticky bottom-0 flex justify-end border-t bg-background p-3">
          <Button type="submit" form="scroll-error-demo-form">
            Submit
          </Button>
        </div>
      </div>
    </DemoSection>
  );
}
