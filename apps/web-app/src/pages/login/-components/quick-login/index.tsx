import { Button } from "@rap/components-ui/button";
import { useTranslation } from "@rap/i18n";
import { cn } from "@rap/utils";
import Github from "@/assets/icons/github.svg?react";
import Google from "@/assets/icons/google.svg?react";

interface QuickLogFormProps {
  block?: boolean;
}
export function QuickLogForm({ block }: QuickLogFormProps) {
  const { t } = useTranslation("webApp");

  return (
    <div className="flex flex-col gap-6">
      <div className={cn("grid gap-6", block ? "" : "grid-cols-2")}>
        <Button variant="outline" className="w-full">
          <Github />
          {t("auth.github")}
        </Button>
        <Button variant="outline" className="w-full">
          <Google />
          {t("auth.google")}
        </Button>
      </div>
    </div>
  );
}
