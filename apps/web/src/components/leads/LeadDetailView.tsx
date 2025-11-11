import { LeadListItem } from "../../types/leads";
import { LeadCard } from "./LeadCard";

type Props = {
  lead: LeadListItem;
};

export function LeadDetailView({ lead }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <LeadCard lead={lead} disableActions />
    </div>
  );
}
