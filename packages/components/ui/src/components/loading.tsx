import { cn } from "@rap/utils";
import { type ComponentProps } from "react";

type LoadingProps = {
  text?: string;
} & ComponentProps<"div">;
export const Loading = ({ text, className, ...props }: LoadingProps) => {
  return (
    <div className={cn("flex-col-center size-full gap-2", className)} {...props}>
      <div className="w-(--dots-loader-size) h-(--dots-loader-size) rounded-full shadow-dots-loader animate-dots-loader" />
      {text && <span className="mt-4">{text}</span>}
    </div>
  );
};
