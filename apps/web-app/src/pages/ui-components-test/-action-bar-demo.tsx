"use client";

import { Copy, Trash2, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@rap/utils";
import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@rap/components-ui/action-bar";
import { Checkbox } from "@rap/components-ui/checkbox";
import { Label } from "@rap/components-ui/label";

interface Task {
  id: string;
  name: string;
}

export function ActionBarDemo() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: crypto.randomUUID(), name: "Weekly Status Report" },
    { id: crypto.randomUUID(), name: "Client Invoice Review" },
    { id: crypto.randomUUID(), name: "Product Roadmap" },
    { id: crypto.randomUUID(), name: "Team Standup Notes" },
  ]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  const open = selectedTaskIds.size > 0;

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelectedTaskIds(new Set());
    }
  }

  function handleItemSelect(id: string, checked: boolean) {
    setSelectedTaskIds((currentSelectedTaskIds) => {
      const newSelected = new Set(currentSelectedTaskIds);
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      return newSelected;
    });
  }

  function handleDuplicate() {
    setTasks((currentTasks) => {
      const selectedItems = currentTasks.filter((task) => selectedTaskIds.has(task.id));
      const duplicates = selectedItems.map((task) => ({
        ...task,
        id: crypto.randomUUID(),
        name: `${task.name} (copy)`,
      }));
      return [...currentTasks, ...duplicates];
    });
    setSelectedTaskIds(new Set());
  }

  function handleDelete() {
    setTasks((currentTasks) => currentTasks.filter((task) => !selectedTaskIds.has(task.id)));
    setSelectedTaskIds(new Set());
  }

  return (
    <div className="flex w-full flex-col gap-2.5">
      <h3 className="font-semibold text-lg">Tasks</h3>
      <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
        {tasks.map((task) => (
          <Label
            key={task.id}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-md border bg-card/70 px-3 py-2.5 transition-colors hover:bg-accent/70",
              selectedTaskIds.has(task.id) && "bg-accent/70"
            )}
          >
            <Checkbox
              checked={selectedTaskIds.has(task.id)}
              onCheckedChange={(checked) => handleItemSelect(task.id, checked === true)}
            />
            <span className="truncate font-medium text-sm">{task.name}</span>
          </Label>
        ))}
      </div>

      <ActionBar open={open} onOpenChange={handleOpenChange}>
        <ActionBarSelection>
          {selectedTaskIds.size} selected
          <ActionBarSeparator />
          <ActionBarClose>
            <X />
          </ActionBarClose>
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarItem onSelect={handleDuplicate}>
            <Copy />
            Duplicate
          </ActionBarItem>
          <ActionBarItem variant="destructive" onSelect={handleDelete}>
            <Trash2 />
            Delete
          </ActionBarItem>
        </ActionBarGroup>
      </ActionBar>
    </div>
  );
}
