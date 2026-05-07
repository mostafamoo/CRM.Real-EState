"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TBody, TD, TH, THead, TR } from "@/components/common/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useCRM } from "@/lib/store";
import { initials } from "@/lib/utils";
import {
  Plus, Search, FileText, Download, MoreHorizontal, Trash2, Send, FileCheck, PenLine,
} from "lucide-react";
import type { Document } from "@/lib/types";

const statusVariant = {
  Draft: "muted",
  Sent: "warning",
  Signed: "success",
  Expired: "destructive",
} as const;

const types: Document["type"][] = ["Listing Agreement", "Purchase Agreement", "Disclosure", "Inspection", "Counter Offer", "Addendum", "Other"];

export default function DocumentsPage() {
  const documents = useCRM((s) => s.documents);
  const addDocument = useCRM((s) => s.addDocument);
  const signDocument = useCRM((s) => s.signDocument);
  const deleteDocument = useCRM((s) => s.deleteDocument);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [signOpen, setSignOpen] = useState<Document | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", type: "Other" as Document["type"], signerName: "", signerEmail: "" });

  const filtered = useMemo(() => {
    let d = documents;
    if (query) {
      const q = query.toLowerCase();
      d = d.filter((x) => x.name.toLowerCase().includes(q) || x.type.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") d = d.filter((x) => x.status === statusFilter);
    if (typeFilter !== "all") d = d.filter((x) => x.type === typeFilter);
    return d;
  }, [documents, query, statusFilter, typeFilter]);

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error("Document name is required"); return; }
    addDocument({
      name: form.name.endsWith(".pdf") ? form.name : `${form.name}.pdf`,
      type: form.type,
      size: Math.floor(Math.random() * 200000) + 50000,
      status: form.signerEmail ? "Sent" : "Draft",
      signers: form.signerEmail ? [{ name: form.signerName || form.signerEmail, email: form.signerEmail, signed: false }] : [],
      uploadedBy: "Taylor Lambert",
    });
    toast.success("Document uploaded");
    setUploadOpen(false);
    setForm({ name: "", type: "Other", signerName: "", signerEmail: "" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description={`${documents.length} files · ${documents.filter(d => d.status === "Sent").length} pending signatures`}
        actions={
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Plus className="size-4" /> Upload document
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search documents…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
            <SelectItem value="Signed">Signed</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No documents.</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Document</TH>
                  <TH>Type</TH>
                  <TH>Status</TH>
                  <TH>Signers</TH>
                  <TH>Uploaded by</TH>
                  <TH>Created</TH>
                  <TH className="w-10"></TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((d) => (
                  <TR key={d.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-md bg-secondary flex items-center justify-center">
                          <FileText className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium truncate max-w-[20rem]">{d.name}</div>
                          <div className="text-xs text-muted-foreground">{(d.size / 1024).toFixed(0)} KB</div>
                        </div>
                      </div>
                    </TD>
                    <TD><Badge variant="outline">{d.type}</Badge></TD>
                    <TD><Badge variant={statusVariant[d.status]}>{d.status}</Badge></TD>
                    <TD>
                      <div className="flex items-center gap-1">
                        {d.signers.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          d.signers.slice(0, 3).map((s, i) => (
                            <Avatar key={i} className="size-6 ring-2 ring-card" title={`${s.name}${s.signed ? ' (signed)' : ' (pending)'}`}>
                              <AvatarFallback className={`text-[10px] ${s.signed ? "bg-success/15 text-success" : ""}`}>
                                {initials(s.name)}
                              </AvatarFallback>
                            </Avatar>
                          ))
                        )}
                      </div>
                    </TD>
                    <TD className="text-muted-foreground">{d.uploadedBy}</TD>
                    <TD className="text-muted-foreground text-xs">{new Date(d.createdAt).toLocaleDateString()}</TD>
                    <TD>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info(`Downloading ${d.name}…`)}>
                            <Download className="size-4" /> Download
                          </DropdownMenuItem>
                          {d.signers.some((s) => !s.signed) && (
                            <DropdownMenuItem onClick={() => setSignOpen(d)}>
                              <PenLine className="size-4" /> Sign / send for signing
                            </DropdownMenuItem>
                          )}
                          {d.status === "Draft" && (
                            <DropdownMenuItem onClick={() => toast.success(`Sent ${d.name} for signature`)}>
                              <Send className="size-4" /> Send for signature
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(d.id)}>
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

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>Add a new document and optionally request a signature.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1.5">
              <Label>File name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Purchase Agreement — 318 Spruce" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Document["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Signer name (optional)</Label>
                <Input value={form.signerName} onChange={(e) => setForm({ ...form, signerName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Signer email</Label>
                <Input type="email" value={form.signerEmail} onChange={(e) => setForm({ ...form, signerEmail: e.target.value })} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button type="submit">Upload</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={signOpen !== null} onOpenChange={(o) => !o && setSignOpen(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sign document</DialogTitle>
            <DialogDescription>{signOpen?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {signOpen?.signers.map((s) => (
              <div key={s.email} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8"><AvatarFallback className="text-[10px]">{initials(s.name)}</AvatarFallback></Avatar>
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </div>
                </div>
                {s.signed ? (
                  <Badge variant="success" className="gap-1"><FileCheck className="size-3" /> Signed</Badge>
                ) : (
                  <Button size="sm" onClick={() => { signDocument(signOpen.id, s.email); toast.success(`${s.name} signed`); }}>
                    Sign now
                  </Button>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSignOpen(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteDocument(confirmId); toast.success("Document deleted"); } }}
        title="Delete this document?"
      />
    </div>
  );
}
