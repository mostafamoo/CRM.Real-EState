"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/common/data-table";
import { ContactFormDialog } from "@/components/dialogs/contact-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCRM } from "@/lib/store";
import { initials } from "@/lib/utils";
import { Plus, Search, Mail, Phone, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Contact } from "@/lib/mock-data";

export default function ContactsPage() {
  const contacts = useCRM((s) => s.contacts);
  const deleteContact = useCRM((s) => s.deleteContact);

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | undefined>();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query) return contacts;
    const q = query.toLowerCase();
    return contacts.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q)
    );
  }, [contacts, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="External contacts"
        description={`${filtered.length} of ${contacts.length} contacts`}
        actions={
          <Button size="sm" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
            <Plus className="size-4" /> New contact
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Search contacts…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No contacts match.</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Contact</TH>
                  <TH>Role</TH>
                  <TH>Company</TH>
                  <TH>City</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback>{initials(c.name)}</AvatarFallback></Avatar>
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.email}</div>
                        </div>
                      </div>
                    </TD>
                    <TD>{c.role}</TD>
                    <TD className="text-muted-foreground">{c.company}</TD>
                    <TD>{c.city}</TD>
                    <TD className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => { window.location.href = `mailto:${c.email}`; }}><Mail className="size-4" /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => { window.location.href = `tel:${c.phone}`; }}><Phone className="size-4" /></Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditing(c); setFormOpen(true); }}>
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(c.id)}>
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ContactFormDialog open={formOpen} onOpenChange={setFormOpen} contact={editing} />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteContact(confirmId); toast.success("Contact deleted"); } }}
        title="Delete this contact?"
      />
    </div>
  );
}
