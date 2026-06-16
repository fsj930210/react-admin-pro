import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";
import "highlight.js/styles/github.css";

import type { MarkdownRendererProps } from "./index";

interface MarkdownContentProps {
  value: string;
  baseComponents: Components;
  enableGfm?: MarkdownRendererProps["enableGfm"];
  enableRawHtml?: MarkdownRendererProps["enableRawHtml"];
  sanitizeRawHtml?: MarkdownRendererProps["sanitizeRawHtml"];
  enableCodeHighlight?: MarkdownRendererProps["enableCodeHighlight"];
}

export function MarkdownContent({
  value,
  baseComponents,
  enableGfm = true,
  enableRawHtml = false,
  sanitizeRawHtml = true,
  enableCodeHighlight = false,
}: MarkdownContentProps) {
  const remarkPlugins = useMemo(() => (enableGfm ? [remarkGfm] : []), [enableGfm]);
  const rehypePlugins = useMemo(
    () => [
      ...(enableRawHtml ? [rehypeRaw] : []),
      ...(enableRawHtml && sanitizeRawHtml ? [rehypeSanitize] : []),
      ...(enableCodeHighlight ? [rehypeHighlight] : []),
    ],
    [enableRawHtml, sanitizeRawHtml, enableCodeHighlight]
  );

  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={baseComponents}
    >
      {value}
    </ReactMarkdown>
  );
}
