import { Input } from "@rap/components-pro/input";
import { useSidebar } from "@rap/components-ui/sidebar";
import { useTranslation } from "@rap/i18n";
import { cn } from "@rap/utils";
import { Search } from "lucide-react";
import { useRef, useState } from "react";

interface sidebarSearchProps {
  onChange?: (value: string) => void | Promise<void>;
}
export function SidebarSearch({ onChange }: sidebarSearchProps) {
  const { state, toggleSidebar } = useSidebar();
  const { t } = useTranslation("webApp");
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleInputChange = (value: string) => {
    setSearchKeyword(value);
    onChange?.(value);
  };

  const handleClearSearch = () => {
    setSearchKeyword("");
    onChange?.("");
  };
  return (
    <div className="flex-center px-2 py-1">
      <Input
        placeholder={t("sidebar.searchPlaceholder")}
        ref={searchRef as React.RefObject<HTMLInputElement>}
        className={cn("w-full", state === "collapsed" ? "hidden" : "")}
        onChange={(event) => handleInputChange(event.target.value)}
        value={searchKeyword}
        onClear={handleClearSearch}
        allowClear
      />
      <Search
        className={cn("size-5 cursor-pointer", state === "expanded" ? "hidden" : "")}
        onClick={() => {
          toggleSidebar();
          requestAnimationFrame(() => {
            searchRef.current?.focus?.();
          });
        }}
      />
    </div>
  );
}
