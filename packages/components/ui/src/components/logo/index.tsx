import { cn } from "@rap/utils";
import defaultLogo from "./default-logo.svg";

type LogoProps = {
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
    // biome-ignore lint:a11y/noStaticElementInteractions
    <div className={cn("flex-items-center gap-2", className)} onClick={onClick}>
      <img
        src={url ?? defaultLogo}
        alt="logo"
        className={`object-contain ${animate ? "animate-rotate" : ""}`}
      />
      {showTitle && <h2 className="truncate font-medium text-base">{title}</h2>}
    </div>
  );
};

export { Logo };
