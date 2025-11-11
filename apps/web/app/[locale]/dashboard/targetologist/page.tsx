import { fetchLeads, fetchBalance } from "../../../../src/lib/leads";
import { fetchCurrentUser } from "../../../../src/lib/users";
import { TargetologistDashboardView } from "../../../../src/components/dashboards/TargetologistDashboardView";

type Props = {
  params: { locale: string };
};

export const dynamic = "force-dynamic";

export default async function TargetologistDashboardPage({ params }: Props) {
  const user = await fetchCurrentUser();
  if (user.role !== "targetologist") {
    return null;
  }

  const [leadResponse, balance] = await Promise.all([
    fetchLeads({ targetologistId: user.id }),
    fetchBalance(user.id)
  ]);

  return (
    <TargetologistDashboardView
      locale={params.locale}
      targetologist={user}
      initialLeads={leadResponse.data}
      balance={balance}
    />
  );
}
