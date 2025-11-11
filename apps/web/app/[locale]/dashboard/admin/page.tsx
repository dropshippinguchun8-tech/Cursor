import { fetchLeads } from "../../../../src/lib/leads";
import { fetchCurrentUser, fetchUsersByRole } from "../../../../src/lib/users";
import { AdminDashboardView } from "../../../../src/components/dashboards/AdminDashboardView";

type Props = {
  params: { locale: string };
  searchParams: {
    status?: string;
    operatorId?: string;
    targetologistId?: string;
  };
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ params, searchParams }: Props) {
  const user = await fetchCurrentUser();
  if (user.role !== "admin") {
    return null;
  }

  const [leadResponse, operators, targetologists] = await Promise.all([
    fetchLeads({
      status: searchParams.status,
      operatorId: searchParams.operatorId,
      targetologistId: searchParams.targetologistId
    }),
    fetchUsersByRole("operator"),
    fetchUsersByRole("targetologist")
  ]);

  return (
    <AdminDashboardView
      locale={params.locale}
      initialLeads={leadResponse.data}
      meta={leadResponse.meta}
      operators={operators}
      targetologists={targetologists}
      initialFilters={{
        status: searchParams.status ?? "",
        operatorId: searchParams.operatorId ?? "",
        targetologistId: searchParams.targetologistId ?? ""
      }}
    />
  );
}
