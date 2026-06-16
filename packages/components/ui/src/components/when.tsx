import { Children, isValidElement, type ReactElement, type ReactNode } from "react";

export interface WhenProps {
  condition: boolean | null | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}

export function When({ condition, children, fallback }: WhenProps) {
  if (condition) {
    return <>{children}</>;
  }
  return fallback ? <>{fallback}</> : null;
}

export interface ChooseProps {
  children: ReactNode;
}

export interface OtherwiseProps {
  children: ReactNode;
}

export function Otherwise({ children }: OtherwiseProps) {
  return <>{children}</>;
}

function isWhenElement(child: ReactElement<any>): child is ReactElement<WhenProps> {
  return child.type === When;
}

function isOtherwiseElement(child: ReactElement<any>): child is ReactElement<OtherwiseProps> {
  return child.type === Otherwise;
}

export function Choose({ children }: ChooseProps) {
  let matchedChild: ReactNode = null;
  let otherwiseChild: ReactNode = null;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (isOtherwiseElement(child)) {
      otherwiseChild = child.props.children;
      return;
    }

    if (isWhenElement(child)) {
      const { condition, children: whenChildren } = child.props;
      if (condition && !matchedChild) {
        matchedChild = whenChildren;
      }
    }
  });

  return <>{matchedChild || otherwiseChild || null}</>;
}
