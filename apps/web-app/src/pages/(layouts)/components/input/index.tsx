import { Input, NumberInput, PasswordInput } from "@rap/components-pro/input";
import { Button } from "@rap/components-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@rap/components-ui/card";
import { FieldDescription, FieldGroup, FieldLabel } from "@rap/components-ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rap/components-ui/select";
import { Space } from "@rap/components-ui/space";
import { createFileRoute } from "@tanstack/react-router";
import { CircleHelp, LockKeyhole, Mail, Search, User } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";

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
        <div className="space-y-2">
          <FieldLabel>Default</FieldLabel>
          <Input placeholder="Project name" />
        </div>
        <div className="space-y-2">
          <FieldLabel>Disabled</FieldLabel>
          <Input disabled value="disabled project" />
        </div>
        <div className="space-y-2">
          <FieldLabel>Readonly</FieldLabel>
          <Input readOnly value="readonly project" />
        </div>
        <div className="space-y-2">
          <FieldLabel>Clearable</FieldLabel>
          <Input allowClear defaultValue="admin@rap.dev" prefix={<Mail />} />
        </div>
        <div className="space-y-2">
          <FieldLabel>Invalid</FieldLabel>
          <Input aria-invalid defaultValue="wrong-format" />
          <FieldDescription className="text-destructive">
            Value does not match the rule.
          </FieldDescription>
        </div>
      </FieldGroup>
    </DemoSection>
  );
}

function PrefixSuffixInputs() {
  return (
    <DemoSection title="Prefix And Suffix">
      <div className="grid gap-5">
        <Input
          prefix={<User />}
          suffix={<CircleHelp />}
          placeholder="Enter your username"
          allowClear
        />
        <Input prefix={<span>&yen;</span>} suffix="RMB" />
        <Input disabled prefix={<span>&yen;</span>} suffix="RMB" />
        <PasswordInput
          allowClear
          placeholder="input password support suffix"
          suffix={
            <Space size="xs">
              <LockKeyhole className="size-4" />
            </Space>
          }
        />
      </div>
    </DemoSection>
  );
}

function AddonInputs() {
  return (
    <DemoSection title="Addons And Compact">
      <div className="grid max-w-xl gap-5">
        <Input addonBefore="0571" defaultValue="26888888" />
        <Input
          addonBefore="https://"
          addonAfter={
            <Button variant="outline" size="icon" className="w-10">
              <Search />
            </Button>
          }
          placeholder="input search text"
        />
        <Input
          addonAfter={<Button className="px-4">Submit</Button>}
          placeholder="Combine input and button"
        />
        <Input
          addonBefore={
            <Select defaultValue="zhejiang">
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zhejiang">Zhejiang</SelectItem>
                <SelectItem value="jiangsu">Jiangsu</SelectItem>
                <SelectItem value="shanghai">Shanghai</SelectItem>
              </SelectContent>
            </Select>
          }
          defaultValue="Xihu District, Hangzhou"
        />
        <Space.Compact block>
          <Space.Addon>
            <Search />
          </Space.Addon>
          <Input placeholder="large size" />
          <Input placeholder="another input" />
        </Space.Compact>
      </div>
    </DemoSection>
  );
}

function ControlledInputs() {
  const [value, setValue] = useState("controlled value");

  return (
    <DemoSection title="Controlled And Uncontrolled">
      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Controlled</FieldLabel>
          <Input
            allowClear
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            onClear={() => {
              setValue("");
            }}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel>Uncontrolled</FieldLabel>
          <Input allowClear defaultValue="uncontrolled value" />
        </div>
      </FieldGroup>
    </DemoSection>
  );
}

function NumberInputs() {
  const [value, setValue] = useState<number | undefined>(8);

  return (
    <DemoSection title="Number Input">
      <div className="grid max-w-xl gap-5">
        <NumberInput
          suffix="%"
          min={0}
          max={100}
          precision={2}
          defaultValue={12.5}
        />
        <NumberInput
          value={value}
          onChange={setValue}
          min={0}
          max={10}
          step={1}
          mode="spinner"
        />
        <NumberInput
          prefix="$"
          defaultValue={1234}
          formatter={(next) => (next === undefined ? "" : next.toLocaleString())}
          parser={(input) => {
            const next = Number(input.replace(/,/g, ""));
            return Number.isFinite(next) ? next : undefined;
          }}
        />
      </div>
    </DemoSection>
  );
}

function RefInputs() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <DemoSection title="Ref API">
      <div className="grid max-w-xl gap-3">
        <Input
          ref={inputRef}
          placeholder="Focus and blur by input ref"
          allowClear
          suffix={<CircleHelp />}
        />
        <Space>
          <Button
            variant="outline"
            onClick={() => {
              inputRef.current?.focus();
            }}
          >
            Focus
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              inputRef.current?.blur();
            }}
          >
            Blur
          </Button>
        </Space>
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
          Pro input examples with icons, addons, clear actions, and compact combinations.
        </p>
      </div>

      <BasicInputs />
      <PrefixSuffixInputs />
      <AddonInputs />
      <ControlledInputs />
      <NumberInputs />
      <RefInputs />
    </div>
  );
}
