"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useCRM } from "@/lib/store";
import { CheckCircle2 } from "lucide-react";

export default function IntegrationsPage() {
  const integrations = useCRM((s) => s.integrations);
  const toggleIntegration = useCRM((s) => s.toggleIntegration);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description={`${integrations.filter((i) => i.connected).length} of ${integrations.length} connected`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((i) => (
          <Card key={i.name}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className={`size-10 rounded-lg bg-gradient-to-br ${i.color} flex items-center justify-center text-white font-semibold`}>
                  {i.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{i.name}</h3>
                    {i.connected && <CheckCircle2 className="size-4 text-success" />}
                  </div>
                  <Badge variant="outline" className="mt-0.5 text-[10px]">{i.category}</Badge>
                </div>
                <Switch
                  checked={i.connected}
                  onCheckedChange={() => { toggleIntegration(i.name); }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{i.description}</p>
              <Button
                variant={i.connected ? "outline" : "default"}
                size="sm"
                className="w-full"
                onClick={() => {
                  toggleIntegration(i.name);
                }}
              >
                {i.connected ? "Disconnect" : "Connect"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
