"use client";

import { Direction } from "radix-ui";
import { type ComponentProps } from "react";

function DirectionProvider({
  dir,
  direction,
  children,
}: ComponentProps<typeof Direction.DirectionProvider> & {
  direction?: ComponentProps<typeof Direction.DirectionProvider>["dir"];
}) {
  return (
    <Direction.DirectionProvider dir={direction ?? dir}>{children}</Direction.DirectionProvider>
  );
}

const useDirection = Direction.useDirection;

export { DirectionProvider, useDirection };
