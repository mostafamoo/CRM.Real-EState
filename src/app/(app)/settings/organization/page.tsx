import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/common/data-table";
import { initials } from "@/lib/utils";
import { UserPlus } from "lucide-react";

const members = [
  { name: "Taylor Lambert", email: "tl@tl.com", role: "Owner", status: "Active" },
  { name: "Marcus Reed", email: "marcus@bayrealty.com", role: "Admin", status: "Active" },
  { name: "Diana Powell", email: "diana@bayrealty.com", role: "Agent", status: "Active" },
  { name: "Naomi Lee", email: "naomi@bayrealty.com", role: "Agent", status: "Active" },
  { name: "Kenji Watanabe", email: "kenji@bayrealty.com", role: "Agent", status: "Pending" },
];

export default function OrganizationPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Members</CardTitle>
          <CardDescription>{members.length} people in Bay Realty Group</CardDescription>
        </div>
        <Button size="sm">
          <UserPlus className="size-4" /> Invite member
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <THead>
            <TR>
              <TH>Member</TH>
              <TH>Role</TH>
              <TH>Status</TH>
              <TH className="w-20"></TH>
            </TR>
          </THead>
          <TBody>
            {members.map((m) => (
              <TR key={m.email}>
                <TD>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{initials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.email}</div>
                    </div>
                  </div>
                </TD>
                <TD><Badge variant="outline">{m.role}</Badge></TD>
                <TD>
                  <Badge variant={m.status === "Active" ? "success" : "warning"}>{m.status}</Badge>
                </TD>
                <TD>
                  <Button variant="ghost" size="sm">Manage</Button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </CardContent>
    </Card>
  );
}
