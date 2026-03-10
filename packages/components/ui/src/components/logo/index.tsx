export type LogoProps = {
  animate?: boolean;
  className?: string;
  title?: string;
  showTitle?: boolean;
  url?: string;
  onClick?: () => void;
} &  React.ComponentProps<"div">;
const Logo = ({
  animate,
  url,
  title = "React Admin Pro",
  showTitle = true,
	...props
}: LogoProps) => {
  return (
    <div className="flex items-center gap-2" {...props}>
      <img
        src={url ?? '/logo.svg'}
        alt={title}
        className={`object-contain ${animate ? "animate-rotate" : ""}`}
      />
      {showTitle && <h2 className="truncate font-medium text-base">{title}</h2>}
    </div>
  );
};

export { Logo };
