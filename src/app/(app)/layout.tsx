import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";
import { Copilot } from "@/components/layout/copilot";
import { HydrateStore } from "@/components/layout/hydrate-store";
import { fetchAllForOrg } from "@/lib/actions/crm";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const data = await fetchAllForOrg();
  return (
    <div className="flex min-h-screen">
      <HydrateStore data={data as never} />
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
      <Copilot />
    </div>
  );
}
