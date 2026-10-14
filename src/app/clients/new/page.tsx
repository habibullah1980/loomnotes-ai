import { Metadata } from "next";
import { ClientFollowShell } from "@/components/layout/clientfollow-shell";
import { ClientFollowProvider } from "@/context/clientfollow-context";
import AddClientFormView from "@/components/clients/add-client-form-view";

export const metadata: Metadata = {
  title: "Add New Client - ClientFollow CRM",
  description: "Create a new client profile with commercial scope and follow-up cadences.",
};

export default function NewClientPage() {
  return (
    <ClientFollowProvider>
      <ClientFollowShell>
        <AddClientFormView />
      </ClientFollowShell>
    </ClientFollowProvider>
  );
}
