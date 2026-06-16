import { Tooltip, TooltipContent, TooltipTrigger } from "@rap/components-ui/tooltip";
import { cn } from "@rap/utils";
import { Button } from "../../../../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../dropdown-menu";
import { ClipboardCopy, MoreHorizontal, Download, Link, Maximize } from "lucide-react";
import {
  useCallback,
  useMemo,
  useState,
  type ComponentProps,
  type FC,
  type MouseEvent,
  type ReactNode,
} from "react";

interface ImageActionsProps {
  shouldMerge?: boolean;
  isLink?: boolean;
  onView?: () => void;
  onDownload?: () => void;
  onCopy?: () => void;
  onCopyLink?: () => void;
}

interface ActionButtonProps extends ComponentProps<"button"> {
  icon: ReactNode;
  tooltip: string;
}

export const ActionWrapper = ({ children, className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn(
      "absolute top-3 right-3 flex flex-row rounded px-0.5 opacity-0 group-hover/node-image:opacity-100",
      "border-[0.5px] bg-(--mt-bg-secondary) [backdrop-filter:saturate(1.8)_blur(20px)]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

ActionWrapper.displayName = "ActionWrapper";

export const ActionButton = ({ icon, tooltip, className, ...props }: ActionButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        className={cn(
          "text-muted-foreground hover:text-foreground relative flex h-7 w-7 flex-row rounded-none p-0",
          "bg-transparent hover:bg-transparent",
          className
        )}
        {...props}
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom">{tooltip}</TooltipContent>
  </Tooltip>
);

ActionButton.displayName = "ActionButton";

type ActionKey = "onView" | "onDownload" | "onCopy" | "onCopyLink";

const ActionItems: Array<{
  key: ActionKey;
  icon: ReactNode;
  tooltip: string;
  isLink?: boolean;
}> = [
  {
    key: "onView",
    icon: <Maximize />,
    tooltip: "View image",
  },
  {
    key: "onDownload",
    icon: <Download />,
    tooltip: "Download image",
  },
  {
    key: "onCopy",
    icon: <ClipboardCopy />,
    tooltip: "Copy image to clipboard",
  },
  {
    key: "onCopyLink",
    icon: <Link />,
    tooltip: "Copy image link",
    isLink: true,
  },
];

export const ImageActions: FC<ImageActionsProps> = ({
  shouldMerge = false,
  isLink = false,
  ...actions
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = useCallback((e: MouseEvent, action: (() => void) | undefined) => {
    e.preventDefault();
    e.stopPropagation();
    action?.();
  }, []);

  const filteredActions = useMemo(
    () => ActionItems.filter((item) => isLink || !item.isLink),
    [isLink]
  );

  return (
    <ActionWrapper className={cn({ "opacity-100": isOpen })}>
      {shouldMerge ? (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <ActionButton
              icon={<MoreHorizontal />}
              tooltip="Open menu"
              onClick={(e) => e.preventDefault()}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            {filteredActions.map(({ key, icon, tooltip }) => (
              <DropdownMenuItem key={key} onClick={(e) => handleAction(e, actions[key])}>
                <div className="flex flex-row items-center gap-2">
                  {icon}
                  <span>{tooltip}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        filteredActions.map(({ key, icon, tooltip }) => (
          <ActionButton
            key={key}
            icon={icon}
            tooltip={tooltip}
            onClick={(e) => handleAction(e, actions[key])}
          />
        ))
      )}
    </ActionWrapper>
  );
};

ImageActions.displayName = "ImageActions";
