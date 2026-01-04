import { cn } from "@rap/utils";

export type LogoProps = {
  animate?: boolean;
  className?: string;
  title?: string;
  showTitle?: boolean;
  url?: string;
  onClick?: () => void;
};
const Logo = ({
  animate,
  className,
  url,
  title = "React Admin Pro",
  showTitle = true,
  onClick,
}: LogoProps) => {
  return (
    <div className={cn("flex-items-center gap-2", className)} onClick={onClick}>
      <img
        src={url ?? '/logo.svg'}
        alt="logo"
        className={`object-contain ${animate ? "animate-rotate" : ""}`}
      />
      {showTitle && <h2 className="truncate font-medium text-base">{title}</h2>}
    </div>
  );
};

export { Logo };
