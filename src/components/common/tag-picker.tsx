"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useCRM } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const palette = [
  "bg-destructive/15 text-destructive",
  "bg-warning/20 text-warning-foreground",
  "bg-primary/15 text-primary",
  "bg-success/15 text-success",
  "bg-[var(--color-chart-4)]/15 text-[var(--color-chart-4)]",
];

export function TagPicker({ leadId }: { leadId: string }) {
  const tags = useCRM((s) => s.tags);
  const leadTags = useCRM((s) => s.leadTags[leadId] ?? []);
  const toggleLeadTag = useCRM((s) => s.toggleLeadTag);
  const addTag = useCRM((s) => s.addTag);
  const [newTag, setNewTag] = useState("");

  function handleAdd() {
    if (!newTag.trim()) return;
    const color = palette[Math.floor(Math.random() * palette.length)];
    const tag = addTag(newTag.trim(), color);
    toggleLeadTag(leadId, tag.id);
    setNewTag("");
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {leadTags.map((tagId) => {
        const tag = tags.find((t) => t.id === tagId);
        if (!tag) return null;
        return (
          <span key={tag.id} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tag.color}`}>
            {tag.name}
            <button onClick={() => toggleLeadTag(leadId, tag.id)} className="hover:opacity-70">
              <X className="size-3" />
            </button>
          </span>
        );
      })}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary hover:text-primary">
            <Plus className="size-3" /> Tag
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuLabel>Apply tags</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-48 overflow-y-auto py-1">
            {tags.length === 0 && <div className="px-2 py-1 text-xs text-muted-foreground">No tags yet</div>}
            {tags.map((tag) => {
              const applied = leadTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleLeadTag(leadId, tag.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-sm hover:bg-secondary"
                >
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${tag.color}`}>{tag.name}</span>
                  {applied && <span className="text-xs text-primary">✓</span>}
                </button>
              );
            })}
          </div>
          <DropdownMenuSeparator />
          <form
            onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
            className="flex gap-1 p-1"
          >
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag…"
              className="h-7 text-xs"
            />
            <Button type="submit" size="sm" disabled={!newTag.trim()}>Add</Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
