import { Check, Copy } from "lucide-react";
import React, { lazy, Suspense, useMemo, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@rap/utils";

export interface MarkdownRendererProps {
  value?: string;
  className?: string;
  contentClassName?: string;
  components?: Components;
  enableGfm?: boolean;
  enableRawHtml?: boolean;
  sanitizeRawHtml?: boolean;
  enableCodeHighlight?: boolean;
  emptyFallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

type MarkdownContentProps = MarkdownRendererProps & {
  value: string;
  baseComponents: Components;
};

const MarkdownEnhanced = lazy(() => import("./markdown-enhanced"));

function getTextContent(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getTextContent).join("");
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return getTextContent(children.props.children);
  }

  return "";
}

function MarkdownCode({
  className,
  children,
  ...props
}: React.ComponentProps<"code"> & { inline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const isBlock = typeof className === "string" && className.includes("language-");
  const language = className?.match(/language-(\w+)/)?.[1];
  const code = getTextContent(children).replace(/\n$/, "");

  if (!isBlock) {
    return (
      <code
        className={cn(
          "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="group/code relative my-4 overflow-hidden rounded-md border bg-card">
      <div className="flex h-9 items-center justify-between border-b bg-muted/50 px-3">
        <span className="font-medium text-muted-foreground text-xs uppercase">
          {language || "text"}
        </span>
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded text-muted-foreground opacity-70 transition hover:bg-muted hover:opacity-100"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto p-4 text-sm leading-6">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

function createDefaultComponents(components?: Components): Components {
  return {
    code: MarkdownCode,
    pre: ({ children }) => <>{children}</>,
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse border text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border bg-muted px-3 py-2 text-left font-medium">{children}</th>
    ),
    td: ({ children }) => <td className="border px-3 py-2">{children}</td>,
    a: ({ children, href }) => (
      <a
        href={href}
        className="font-medium text-primary underline-offset-4 hover:underline"
        rel="noopener noreferrer"
        target={href?.startsWith("http") ? "_blank" : undefined}
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-4 border-primary/60 pl-4 text-muted-foreground italic">
        {children}
      </blockquote>
    ),
    h1: ({ children }) => <h1 className="mt-0 mb-4 font-bold text-3xl">{children}</h1>,
    h2: ({ children }) => <h2 className="mt-8 mb-3 font-bold text-2xl">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-6 mb-2 font-semibold text-xl">{children}</h3>,
    h4: ({ children }) => <h4 className="mt-5 mb-2 font-semibold text-lg">{children}</h4>,
    p: ({ children }) => <p className="my-4 leading-7">{children}</p>,
    ul: ({ children }) => <ul className="my-4 list-disc space-y-1 pl-6">{children}</ul>,
    ol: ({ children }) => <ol className="my-4 list-decimal space-y-1 pl-6">{children}</ol>,
    li: ({ children }) => <li className="leading-7">{children}</li>,
    hr: () => <hr className="my-8 border-border" />,
    ...components,
  };
}

function MarkdownBase({ value, enableGfm = true, baseComponents }: MarkdownContentProps) {
  const remarkPlugins = useMemo(() => (enableGfm ? [remarkGfm] : []), [enableGfm]);

  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={baseComponents}>
      {value}
    </ReactMarkdown>
  );
}

export function MarkdownRenderer({
  value,
  className,
  contentClassName,
  components,
  emptyFallback = null,
  loadingFallback = null,
  enableCodeHighlight = false,
  enableRawHtml = false,
  sanitizeRawHtml = true,
  enableGfm = true,
}: MarkdownRendererProps) {
  const markdown = value?.trim();
  const baseComponents = useMemo(() => createDefaultComponents(components), [components]);

  if (!markdown) {
    return emptyFallback;
  }

  const content =
    enableCodeHighlight || enableRawHtml ? (
      <Suspense fallback={loadingFallback}>
        <MarkdownEnhanced
          value={markdown}
          enableGfm={enableGfm}
          enableCodeHighlight={enableCodeHighlight}
          enableRawHtml={enableRawHtml}
          sanitizeRawHtml={sanitizeRawHtml}
          baseComponents={baseComponents}
        />
      </Suspense>
    ) : (
      <MarkdownBase value={markdown} enableGfm={enableGfm} baseComponents={baseComponents} />
    );

  return (
    <div className={cn("max-w-none text-foreground", className)}>
      <div className={cn("min-w-0", contentClassName)}>{content}</div>
    </div>
  );
}

export default MarkdownRenderer;
