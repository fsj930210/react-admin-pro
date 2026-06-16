import { Separator } from "../../../separator";
import { ToolbarButton } from "../toolbar-button";
import { Copy, ExternalLink, Link2 } from "lucide-react";
import { useCallback, useState, type FC, type MouseEvent } from "react";

interface LinkPopoverBlockProps {
  url: string;
  onClear: () => void;
  onEdit: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const LinkPopoverBlock: FC<LinkPopoverBlockProps> = ({ url, onClear, onEdit }) => {
  const [copyTitle, setCopyTitle] = useState<string>("Copy");

  const handleCopy = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopyTitle("Copied!");
          setTimeout(() => setCopyTitle("Copy"), 1000);
        })
        .catch(() => undefined);
    },
    [url]
  );

  const handleOpenLink = useCallback(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);

  return (
    <div className="bg-background flex overflow-hidden rounded p-2 shadow-lg">
      <div className="inline-flex items-center gap-1">
        <ToolbarButton tooltip="Edit link" onClick={onEdit}>
          Edit link
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton tooltip="Open link in a new tab" onClick={handleOpenLink}>
          <ExternalLink />
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton tooltip="Clear link" onClick={onClear}>
          <Link2 />
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton
          tooltip={copyTitle}
          onClick={handleCopy}
          tooltipOptions={{
            onPointerDownOutside: (e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            },
          }}
        >
          <Copy />
        </ToolbarButton>
      </div>
    </div>
  );
};
