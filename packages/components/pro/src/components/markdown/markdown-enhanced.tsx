import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { useEffect, useMemo } from "react";

import type { MarkdownRendererProps } from "./index";

interface MarkdownEnhancedProps {
  value: string;
  baseComponents: Components;
  enableGfm?: MarkdownRendererProps["enableGfm"];
  enableRawHtml?: MarkdownRendererProps["enableRawHtml"];
  sanitizeRawHtml?: MarkdownRendererProps["sanitizeRawHtml"];
  enableCodeHighlight?: MarkdownRendererProps["enableCodeHighlight"];
}

export default function MarkdownEnhanced({
  value,
  baseComponents,
  enableGfm = true,
  enableRawHtml = false,
  sanitizeRawHtml = true,
  enableCodeHighlight = false,
}: MarkdownEnhancedProps) {
  useEffect(() => {
    if (!enableCodeHighlight) return;
    void import("highlight.js/styles/github.css");
  }, [enableCodeHighlight]);

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
