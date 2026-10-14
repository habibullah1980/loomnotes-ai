import { Metadata } from "next";
import { ClientFollowShell } from "@/components/layout/clientfollow-shell";
import { ClientFollowProvider } from "@/context/clientfollow-context";
import ClientsDirectoryView from "@/components/clients/clients-directory-view";

export const metadata: Metadata = {
  title: "Clients Directory - ClientFollow CRM",
  description: "Manage client relationships, contract milestones, and communication cadence.",
};

export default function ClientsPage() {
  return (
    <ClientFollowProvider>
      <ClientFollowShell>
        <ClientsDirectoryView />
      </ClientFollowShell>
    </ClientFollowProvider>
  );
}
