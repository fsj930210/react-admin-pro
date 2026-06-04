import { Input, PasswordInput } from "@rap/components-pro/input";
import { Button } from "@rap/components-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@rap/components-ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@rap/components-ui/field";
import { createFileRoute } from "@tanstack/react-router";
import {
  AtSign,
  CheckCircle2,
  DollarSign,
  Globe2,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/(layouts)/components/input/")({
  component: RouteComponent,
});

function DemoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function BasicInputs() {
  return (
    <DemoSection title="Basic">
      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel>Default</FieldLabel>
          <Input placeholder="Project name" />
        </Field>
        <Field>
          <FieldLabel>Disabled</FieldLabel>
          <Input disabled value="Readonly project" />
        </Field>
        <Field>
          <FieldLabel>Invalid</FieldLabel>
          <Input aria-invalid defaultValue="wrong-format" />
          <FieldDescription className="text-destructive">
            Value does not match the rule.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Password</FieldLabel>
          <PasswordInput prefix={<LockKeyhole />} placeholder="Password" />
        </Field>
      </FieldGroup>
    </DemoSection>
  );
}

function IconInputs() {
  return (
    <DemoSection title="Prefix And Suffix">
      <div className="grid gap-5 md:grid-cols-2">
        <Input prefix={<Search />} placeholder="Search menu, route, action" allowClear />
        <Input
          prefix={<Mail />}
          suffix={<CheckCircle2 className="text-emerald-600" />}
          defaultValue="admin@rap.dev"
        />
        <Input prefix={<User />} placeholder="Username" />
        <Input suffix={<ShieldCheck className="text-blue-600" />} placeholder="Verified account" />
      </div>
    </DemoSection>
  );
}

function AddonInputs() {
  return (
    <DemoSection title="Addons">
      <div className="grid gap-5 md:grid-cols-2">
        <Input addonBefore="https://" addonAfter=".com" placeholder="react-admin-pro" />
        <Input addonBefore={<AtSign className="size-4" />} placeholder="team" />
        <Input
          addonBefore={<DollarSign className="size-4" />}
          addonAfter="USD"
          defaultValue="128.00"
        />
        <Input
          addonBefore={<Globe2 className="size-4" />}
          suffix=".internal"
          placeholder="service-name"
        />
      </div>
    </DemoSection>
  );
}

function ClearableInputs() {
  const [value, setValue] = useState("Clearable controlled value");
  const [customValue, setCustomValue] = useState("Custom clear icon");

  return (
    <DemoSection title="Clearable">
      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel>Controlled</FieldLabel>
          <Input
            value={value}
            onValueChange={setValue}
            prefix={<Search />}
            allowClear
            placeholder="Type something"
          />
          <FieldDescription>Current value: {value || "empty"}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Uncontrolled</FieldLabel>
          <Input defaultValue="Uncontrolled value" allowClear />
          <FieldDescription>Uses defaultValue and internal state.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Custom Clear</FieldLabel>
          <Input
            value={customValue}
            onValueChange={setCustomValue}
            allowClear={{ icon: <X className="size-4" />, ariaLabel: "Reset input" }}
          />
        </Field>
        <Field>
          <FieldLabel>No Clear When Empty</FieldLabel>
          <Input allowClear placeholder="Clear button appears after input" />
        </Field>
      </FieldGroup>
    </DemoSection>
  );
}

function RefInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  return (
    <DemoSection title="Ref And Value Callback">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <Input
            ref={inputRef}
            value={value}
            onValueChange={setValue}
            prefix={<Search />}
            allowClear
            placeholder="Focus from button"
          />
          <Button type="button" variant="outline" onClick={() => inputRef.current?.focus()}>
            Focus
          </Button>
        </div>
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Value callback: {value || "empty"}
        </div>
      </div>
    </DemoSection>
  );
}

function CompactForm() {
  const [email, setEmail] = useState("demo@rap.dev");
  const [amount, setAmount] = useState("256");

  return (
    <DemoSection title="Form Layout">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            value={email}
            onValueChange={setEmail}
            prefix={<Mail />}
            allowClear
            placeholder="name@example.com"
          />
        </Field>
        <Field>
          <FieldLabel>Budget</FieldLabel>
          <Input
            value={amount}
            onValueChange={setAmount}
            addonBefore={<DollarSign className="size-4" />}
            addonAfter="per month"
            allowClear
          />
        </Field>
        <Field className="lg:col-span-2">
          <FieldLabel>Slug</FieldLabel>
          <Input
            addonBefore="admin.rap.dev/"
            prefix={<Globe2 />}
            placeholder="workspace"
            allowClear
          />
        </Field>
        <FieldContent className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground lg:col-span-2">
          Email: {email || "empty"} · Budget: {amount || "empty"}
        </FieldContent>
      </div>
    </DemoSection>
  );
}

function RouteComponent() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Input</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pro input examples with icons, addons, clear actions, controlled state, and ref access.
        </p>
      </div>

      <BasicInputs />
      <IconInputs />
      <AddonInputs />
      <ClearableInputs />
      <RefInput />
      <CompactForm />
    </div>
  );
}
