import type { ReactNode } from "react";

export type SearchValues = {
  channel?: string;
  city?: string;
  createdAt?: unknown;
  customCode?: string;
  department?: string;
  keyword?: string;
  level?: string;
  owner?: string;
  priceRange?: string;
  region?: string;
  reviewer?: string;
  status?: string;
  tag?: string;
  type?: string;
  updatedAt?: unknown;
};

export const statusOptions = [
  { label: "All", value: "all" },
  { label: "Enabled", value: "enabled" },
  { label: "Disabled", value: "disabled" },
];

export const typeOptions = [
  { label: "Normal", value: "normal" },
  { label: "Custom", value: "custom" },
];

export const levelOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export function DemoCard({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-xs">
      <div className="border-b bg-muted/30 px-5 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function ResultPreview({ values }: { values?: SearchValues }) {
  if (!values) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
      {Object.entries(values).map(([key, value]) => (
        <span key={key} className="rounded border bg-muted/50 px-2 py-1">
          {key}: {value ? String(value) : "-"}
        </span>
      ))}
    </div>
  );
}
