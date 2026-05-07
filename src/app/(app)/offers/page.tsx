"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/common/data-table";
import { OfferFormDialog } from "@/components/dialogs/offer-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCRM, type Offer } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, FileText, MoreHorizontal, Trash2 } from "lucide-react";

const statusVariant = {
  Accepted: "success",
  Counter: "warning",
  Pending: "secondary",
  Rejected: "destructive",
} as const;

export default function OffersPage() {
  const offers = useCRM((s) => s.offers);
  const updateOffer = useCRM((s) => s.updateOffer);
  const deleteOffer = useCRM((s) => s.deleteOffer);

  const [formOpen, setFormOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        description={`${offers.length} offers · ${formatCurrency(offers.reduce((s, o) => s + o.amount, 0))} total`}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> New offer
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Offer</TH>
                <TH>Listing</TH>
                <TH>Buyer</TH>
                <TH>Amount</TH>
                <TH>Status</TH>
                <TH>Submitted by</TH>
                <TH>Date</TH>
                <TH className="w-10"></TH>
              </TR>
            </THead>
            <TBody>
              {offers.map((o) => (
                <TR key={o.id}>
                  <TD className="font-medium">{o.id}</TD>
                  <TD className="text-muted-foreground">{o.listing}</TD>
                  <TD>{o.buyer}</TD>
                  <TD className="font-medium">{formatCurrency(o.amount)}</TD>
                  <TD><Badge variant={statusVariant[o.status]}>{o.status}</Badge></TD>
                  <TD className="text-muted-foreground">{o.submittedBy}</TD>
                  <TD>{o.date}</TD>
                  <TD>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info(`Opening ${o.id} document`)}>
                          <FileText className="size-4" /> View document
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(["Pending", "Counter", "Accepted", "Rejected"] as Offer["status"][])
                          .filter((s) => s !== o.status)
                          .map((s) => (
                            <DropdownMenuItem key={s} onClick={() => { updateOffer(o.id, { status: s }); toast.success(`Marked as ${s}`); }}>
                              Mark as {s}
                            </DropdownMenuItem>
                          ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(o.id)}>
                          <Trash2 className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <OfferFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) { deleteOffer(confirmId); toast.success("Offer deleted"); }
        }}
        title="Delete this offer?"
      />
    </div>
  );
}
