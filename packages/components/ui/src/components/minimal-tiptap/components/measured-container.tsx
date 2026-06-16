import { useContainerSize } from "../hooks/use-container-size";
import { useRef, type ComponentProps, type ElementType, type ReactNode } from "react";

interface MeasuredContainerProps<T extends ElementType> {
  as: T;
  name: string;
  children?: ReactNode;
}

export const MeasuredContainer = <T extends ElementType>({
  as: Component,
  name,
  children,
  style = {},
  ...props
}: MeasuredContainerProps<T> & ComponentProps<T>) => {
  const innerRef = useRef<HTMLElement>(null);
  const rect = useContainerSize(innerRef.current);

  const customStyle = {
    [`--${name}-width`]: `${rect.width}px`,
    [`--${name}-height`]: `${rect.height}px`,
  };

  return (
    <Component {...props} ref={innerRef} style={{ ...customStyle, ...style }}>
      {children}
    </Component>
  );
};

MeasuredContainer.displayName = "MeasuredContainer";
