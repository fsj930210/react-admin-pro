import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import type { ComponentProps, ReactNode } from "react";

interface DndContainerProps extends ComponentProps<typeof DragDropProvider> {
	overlay?: ReactNode;
}

export function DndContainer({ children, overlay, ...props }: DndContainerProps) {
  return (
    <DragDropProvider {...props}>
      {children}
      <DragOverlay>
        {overlay}
      </DragOverlay>
    </DragDropProvider>
  );
}
