import { Metadata } from "next";
import { ClientFollowShell } from "@/components/layout/clientfollow-shell";
import { ClientFollowProvider } from "@/context/clientfollow-context";
import CalendarView from "@/components/calendar/calendar-view";

export const metadata: Metadata = {
  title: "Follow-up Calendar - pdfkitfree CRM",
  description: "Visual timeline and schedule of upcoming client check-ins and billing milestones.",
};

export default function CalendarPage() {
  return (
    <ClientFollowProvider>
      <ClientFollowShell>
        <CalendarView />
      </ClientFollowShell>
    </ClientFollowProvider>
  );
}
