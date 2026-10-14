import { Metadata } from "next";
import { ClientFollowShell } from "@/components/layout/clientfollow-shell";
import { ClientFollowProvider } from "@/context/clientfollow-context";
import ClientFollowSettingsView from "@/components/settings/clientfollow-settings-view";

export const metadata: Metadata = {
  title: "Settings - ClientFollow CRM",
  description: "Account and workspace settings, automated cadence defaults, and preferences.",
};

export default function SettingsPage() {
  return (
    <ClientFollowProvider>
      <ClientFollowShell>
        <ClientFollowSettingsView />
      </ClientFollowShell>
    </ClientFollowProvider>
  );
}
