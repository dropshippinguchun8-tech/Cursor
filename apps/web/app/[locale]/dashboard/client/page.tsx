import { fetchLeads } from "../../../../src/lib/leads";
import { fetchCurrentUser } from "../../../../src/lib/users";
import { ClientDashboardView } from "../../../../src/components/dashboards/ClientDashboardView";

type Props = {
  params: { locale: string };
};

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage({ params }: Props) {
  const user = await fetchCurrentUser();
  if (user.role !== "client") {
    return null;
  }

  const leadResponse = await fetchLeads();

  return (
    <ClientDashboardView
      locale={params.locale}
      initialLeads={leadResponse.data}
    />
  );
}
