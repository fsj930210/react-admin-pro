import { DatePicker, DateTimePicker, RangePicker } from "@rap/components-pro/date-picker";
import { Button } from "@rap/components-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@rap/components-ui/card";
import { FieldDescription, FieldGroup, FieldLabel } from "@rap/components-ui/field";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { CalendarDays, Clock3, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

export const Route = createFileRoute("/(layouts)/components/date-picker/")({
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

function BasicSection() {
  const [value, setValue] = useState<dayjs.Dayjs | null>(dayjs());

  return (
    <DemoSection title="Basic">
      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Default</FieldLabel>
          <DatePicker value={value} onChange={setValue} format="YYYY-MM-DD" />
          <FieldDescription>
            Current value: {value ? value.format("YYYY-MM-DD") : "empty"}
          </FieldDescription>
        </div>
        <div className="space-y-2">
          <FieldLabel>Prefix / Suffix / Clear</FieldLabel>
          <DatePicker
            allowClear
            prefix={<CalendarDays className="size-4" />}
            suffix={<Sparkles className="size-4" />}
            placeholder="Select date"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel>Disabled</FieldLabel>
          <DatePicker disabled value={dayjs("2026-06-12")} />
        </div>
        <div className="space-y-2">
          <FieldLabel>Readonly</FieldLabel>
          <DatePicker readOnly value={dayjs("2026-06-12")} />
        </div>
      </FieldGroup>
    </DemoSection>
  );
}

function ModeSection() {
  return (
    <DemoSection title="Picker Modes">
      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Date</FieldLabel>
          <DatePicker placeholder="Select date" format="YYYY-MM-DD" />
        </div>
        <div className="space-y-2">
          <FieldLabel>Week</FieldLabel>
          <DatePicker mode="week" placeholder="Select week" format="GGGG-[W]WW" />
        </div>
        <div className="space-y-2">
          <FieldLabel>Month</FieldLabel>
          <DatePicker mode="month" placeholder="Select month" format="YYYY-MM" />
        </div>
        <div className="space-y-2">
          <FieldLabel>Quarter</FieldLabel>
          <DatePicker mode="quarter" placeholder="Select quarter" format="YYYY-[Q]Q" />
        </div>
        <div className="space-y-2">
          <FieldLabel>Year</FieldLabel>
          <DatePicker mode="year" placeholder="Select year" format="YYYY" />
        </div>
      </FieldGroup>
    </DemoSection>
  );
}

function RangeSection() {
  const [value, setValue] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>([
    dayjs().subtract(6, "day"),
    dayjs(),
  ]);

  return (
    <DemoSection title="Range Picker">
      <FieldGroup className="grid gap-5">
        <div className="space-y-2">
          <FieldLabel>Basic Range</FieldLabel>
          <RangePicker
            value={value}
            onChange={setValue}
            format="YYYY-MM-DD"
            presets={[
              { label: "Last 7 Days", value: () => [dayjs().subtract(6, "day"), dayjs()] },
              { label: "This Month", value: () => [dayjs().startOf("month"), dayjs().endOf("month")] },
            ]}
          />
          <FieldDescription>
            Current value: {value?.[0]?.format("YYYY-MM-DD") ?? "empty"} {"->"}{" "}
            {value?.[1]?.format("YYYY-MM-DD") ?? "empty"}
          </FieldDescription>
        </div>
        <div className="space-y-2">
          <FieldLabel>Allow Empty End</FieldLabel>
          <RangePicker
            allowEmpty={[false, true]}
            placeholder={["Start date", "Till now"]}
            format="YYYY-MM-DD"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel>Month Range</FieldLabel>
          <RangePicker mode="month" placeholder={["Start month", "End month"]} format="YYYY-MM" />
        </div>
      </FieldGroup>
    </DemoSection>
  );
}

function RenderSection() {
  return (
    <DemoSection title="Presets, Footer And Cell Render">
      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Custom Footer</FieldLabel>
          <DatePicker
            format="YYYY-MM-DD"
            presets={[
              { label: "Today", value: () => dayjs() },
              { label: "Tomorrow", value: () => dayjs().add(1, "day") },
            ]}
            footer={<Button size="sm">Confirm</Button>}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel>Custom Cell</FieldLabel>
          <DatePicker
            format="YYYY-MM-DD"
            renderCell={(info) => (
              <div className="flex h-9 w-full items-center justify-center px-1">
                <div
                  className={[
                    "flex h-8 w-full items-center justify-between rounded-md px-2 text-sm transition-colors",
                    info.selected ? "bg-primary text-primary-foreground shadow-sm" : "bg-accent/30",
                    info.today && !info.selected ? "border border-primary text-primary" : "",
                    info.disabled ? "opacity-40" : "",
                  ].join(" ")}
                >
                  {info.text}
                  <span className="text-[10px] opacity-70">
                    {info.today ? "Now" : info.date.date() % 3 === 0 ? "Tag" : ""}
                  </span>
                </div>
              </div>
            )}
          />
        </div>
      </FieldGroup>
    </DemoSection>
  );
}

function DateTimeSection() {
  const [value, setValue] = useState<dayjs.Dayjs | null>(dayjs());

  return (
    <DemoSection title="Date Time">
      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Date Time Picker</FieldLabel>
          <DateTimePicker
            value={value}
            onChange={setValue}
            format="YYYY-MM-DD HH:mm:ss"
            prefix={<Clock3 className="size-4" />}
          />
          <FieldDescription>
            Current value: {value ? value.format("YYYY-MM-DD HH:mm:ss") : "empty"}
          </FieldDescription>
        </div>
        <div className="space-y-2">
          <FieldLabel>Disabled Time</FieldLabel>
          <DateTimePicker
            format="YYYY-MM-DD HH:mm:ss"
            disabledTime={(current) => ({
              disabledHours: () => (current.isSame(dayjs(), "day") ? [0, 1, 2, 3, 4, 5] : []),
              disabledMinutes: (hour) => (hour === 12 ? [15, 16, 17, 18] : []),
              disabledSeconds: (hour, minute) => (hour === 12 && minute === 30 ? [10, 11, 12] : []),
            })}
          />
        </div>
      </FieldGroup>
    </DemoSection>
  );
}

function DisabledDateSection() {
  return (
    <DemoSection title="Disabled Date">
      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Before Today Disabled</FieldLabel>
          <DatePicker
            format="YYYY-MM-DD"
            disabledDate={(current) => current.isBefore(dayjs().startOf("day"), "day")}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel>Range Limit 30 Days</FieldLabel>
          <RangePicker
            format="YYYY-MM-DD"
            disabledDate={(current, info) =>
              !!info.from && Math.abs(current.startOf("day").diff(info.from.startOf("day"), "day")) > 30
            }
          />
        </div>
      </FieldGroup>
    </DemoSection>
  );
}

function RouteComponent() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Date Picker</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dayjs-first date picker demos with date, range, datetime, presets, custom cells, and disabled time.
        </p>
      </div>

      <BasicSection />
      <ModeSection />
      <RangeSection />
      <RenderSection />
      <DateTimeSection />
      <DisabledDateSection />
    </div>
  );
}
