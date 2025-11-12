import { fetchLeadById } from "../../../../src/lib/leads";
import { fetchCurrentUser } from "../../../../src/lib/users";
import { LeadDetailView } from "../../../../src/components/leads/LeadDetailView";

type Props = {
  params: { locale: string; id: string };
};

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: Props) {
  await fetchCurrentUser(); // ensure authenticated
  const lead = await fetchLeadById(params.id);
  return <LeadDetailView lead={lead} />;
}
