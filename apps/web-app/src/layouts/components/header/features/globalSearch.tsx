import { Search, X } from "lucide-react";
import { Button } from "@rap/components-base/button";
import { Input } from "@rap/components-base/input";
import { useState } from "react";

interface GlobalSearchFeatureProps {
  className?: string;
}

export function GlobalSearchFeature({ className }: GlobalSearchFeatureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 执行搜索逻辑
    console.log('搜索:', searchValue);
  };

  return (
    <div className={className}>
      {isOpen ? (
        <div className="flex items-center">
          <form onSubmit={handleSearch} className="flex">
            <Input
              type="text"
              placeholder="搜索..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-64 mr-2"
              autoFocus
            />
            <Button type="submit" size="sm" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <Button variant="ghost" size="icon" onClick={toggleSearch}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="icon" onClick={toggleSearch} title="全局搜索">
          <Search className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}