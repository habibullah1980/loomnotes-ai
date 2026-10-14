import { Metadata } from "next";
import { ClientFollowShell } from "@/components/layout/clientfollow-shell";
import { ClientFollowProvider } from "@/context/clientfollow-context";
import ClientProfileView from "@/components/clients/client-profile-view";

export const metadata: Metadata = {
  title: "Client Profile Dossier - LoomNotesAI CRM",
  description: "Detailed client profile, touchpoints, engagement scopes, and historical correspondence.",
};

export default function ClientProfilePage() {
  return (
    <ClientFollowProvider>
      <ClientFollowShell>
        <ClientProfileView />
      </ClientFollowShell>
    </ClientFollowProvider>
  );
}
