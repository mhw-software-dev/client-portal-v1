import { redirect } from "next/navigation";

import { ClientCalendar } from "@/components/client-calendar";
import { Footer, PortalNav } from "@/components/portal-shell";
import { getClientPortalSession } from "@/lib/auth";

export default async function CalendarPage() {
  const session = await getClientPortalSession();

  if (!session) {
    redirect("/sign-in?reason=session-expired");
  }

  return (
    <>
      <PortalNav active="Calendar" />
      <main>
        <ClientCalendar />
      </main>
      <Footer />
    </>
  );
}
