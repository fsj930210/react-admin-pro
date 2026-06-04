import { Button } from "@rap/components-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu";
import { Globe } from "lucide-react";
import React from "react";

interface I18nFeatureProps {
  className?: string;
}

export function I18nFeature({ className }: I18nFeatureProps) {
  const languages = [
    { code: "zh-CN", name: "Simplified Chinese" },
    { code: "en-US", name: "English" },
  ];

  const [currentLanguage, setCurrentLanguage] = React.useState("zh-CN");

  const handleLanguageChange = (code: string) => {
    setCurrentLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Globe className="h-4 w-4" />
          <span className="sr-only">Language switcher</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={currentLanguage === language.code ? "bg-accent" : ""}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
