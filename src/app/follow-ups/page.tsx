import { Metadata } from "next";
import { ClientFollowShell } from "@/components/layout/clientfollow-shell";
import { ClientFollowProvider } from "@/context/clientfollow-context";
import FollowUpsView from "@/components/follow-ups/follow-ups-view";

export const metadata: Metadata = {
  title: "Follow-ups & Cadences - ClientFollow CRM",
  description: "Cadence Control Hub: manage timely client follow-ups, invoices, and deliverable touchpoints.",
};

export default function FollowUpsPage() {
  return (
    <ClientFollowProvider>
      <ClientFollowShell>
        <FollowUpsView />
      </ClientFollowShell>
    </ClientFollowProvider>
  );
}
