import { fetchLeads, fetchBalance } from "../../../../src/lib/leads";
import { fetchCurrentUser } from "../../../../src/lib/users";
import { OperatorDashboardView } from "../../../../src/components/dashboards/OperatorDashboardView";

type Props = {
  params: { locale: string };
};

export const dynamic = "force-dynamic";

export default async function OperatorDashboardPage({ params }: Props) {
  const user = await fetchCurrentUser();
  if (user.role !== "operator") {
    return null;
  }

  const [leadResponse, balance] = await Promise.all([
    fetchLeads(),
    fetchBalance(user.id)
  ]);

  return (
    <OperatorDashboardView
      locale={params.locale}
      operatorId={user.id}
      initialLeads={leadResponse.data}
      balance={balance}
    />
  );
}
