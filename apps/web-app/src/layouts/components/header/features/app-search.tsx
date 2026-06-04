import { Button } from "@rap/components-ui/button";
import { Input } from "@rap/components-ui/input";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface GlobalSearchFeatureProps {
  className?: string;
}

export function AppSearchFeature({ className }: GlobalSearchFeatureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchValue.trim()) {
      setIsOpen(false);
    }
  };

  return (
    <div className={className}>
      {isOpen ? (
        <div className="flex items-center">
          <form onSubmit={handleSearch} className="flex">
            <Input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-64 mr-2"
            />
            <Button type="submit" size="sm" variant="outline" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <Button variant="ghost" size="icon" onClick={toggleSearch} aria-label="Close search">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSearch}
          title="Global search"
          aria-label="Global search"
        >
          <Search className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
