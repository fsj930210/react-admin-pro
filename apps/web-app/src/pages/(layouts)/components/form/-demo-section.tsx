import { Card, CardContent, CardHeader, CardTitle } from "@rap/components-ui/card";
import type { ReactNode } from "react";

export function DemoSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
