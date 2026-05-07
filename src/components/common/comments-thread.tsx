"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCRM } from "@/lib/store";
import { initials } from "@/lib/utils";
import { AtSign } from "lucide-react";

export function CommentsThread({
  entityType,
  entityId,
}: {
  entityType: "lead" | "deal" | "listing";
  entityId: string;
}) {
  const allComments = useCRM((s) => s.comments);
  const comments = useMemo(
    () => allComments.filter((c) => c.entityType === entityType && c.entityId === entityId),
    [allComments, entityType, entityId]
  );
  const addComment = useCRM((s) => s.addComment);
  const user = useCRM((s) => s.user);
  const [body, setBody] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const mentions = Array.from(body.matchAll(/@(\w+)/g)).map((m) => m[1]);
    addComment({
      entityType,
      entityId,
      author: `${user.firstName} ${user.lastName}`,
      body: body.trim(),
      mentions,
    });
    if (mentions.length > 0) toast.success(`Mentioned ${mentions.join(", ")}`);
    setBody("");
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {comments.length === 0 && (
          <li className="text-sm text-muted-foreground text-center py-6">No comments yet.</li>
        )}
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="text-[10px]">{initials(c.author)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{c.author}</span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap mt-0.5">
                {renderMentions(c.body)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="space-y-2 border-t border-border pt-4">
        <Textarea
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment… use @name to mention someone"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <AtSign className="size-3" /> Mentions
          </span>
          <Button type="submit" size="sm" disabled={!body.trim()}>Comment</Button>
        </div>
      </form>
    </div>
  );
}

function renderMentions(text: string) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((p, i) =>
    p.startsWith("@") ? (
      <span key={i} className="bg-primary/10 text-primary rounded px-1 font-medium">{p}</span>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
