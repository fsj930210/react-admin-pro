import { Button } from "@rap/components-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu";
import { changeLanguage, type Locale, useTranslation } from "@rap/i18n";
import { Globe } from "lucide-react";

interface I18nFeatureProps {
  className?: string;
}

export function I18nFeature({ className }: I18nFeatureProps) {
  const { t, i18n } = useTranslation("webApp");
  const languages = [
    { code: "zh-CN", name: t("language.chinese") },
    { code: "en-US", name: t("language.english") },
  ];

  const handleLanguageChange = (code: Locale) => {
    void changeLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t("language.switcher")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code as Locale)}
            className={i18n.resolvedLanguage === language.code ? "bg-accent" : ""}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
