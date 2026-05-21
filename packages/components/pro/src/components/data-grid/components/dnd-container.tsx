import { DragDropProvider } from "@dnd-kit/react";
import type { ComponentProps } from "react";

export function DndContainer(props: ComponentProps<typeof DragDropProvider>) {
  return (
    <DragDropProvider {...props}
    />
  );
}
