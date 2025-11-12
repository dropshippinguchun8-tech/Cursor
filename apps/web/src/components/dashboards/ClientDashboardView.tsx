"use client";

import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { clientApiFetch } from "../../lib/api";
import { LeadCard } from "../leads/LeadCard";
import { LeadListItem, LeadStatus } from "../../types/leads";

type Props = {
  locale: string;
  initialLeads: LeadListItem[];
};

const clientTransitions: Record<LeadStatus, LeadStatus[]> = {
  NEW: [],
  OPERATOR_ASSIGNED: ["ACCEPTED", "ARCHIVED"],
  ACCEPTED: ["ARCHIVED"],
  ARCHIVED: [],
  SENT: [],
  SOLD: []
};

export function ClientDashboardView({ initialLeads }: Props) {
  const { t } = useTranslation();

  const { data, mutate, isValidating } = useSWR<{ data: LeadListItem[] }>(
    "/api/leads",
    (url) => clientApiFetch<{ data: LeadListItem[] }>(url),
    {
      fallbackData: { data: initialLeads },
      refreshInterval: 10000
    }
  );

  const leads = data?.data ?? [];

  const handleTransition = async (leadId: string, status: LeadStatus, comment: string) => {
    await clientApiFetch(`/api/leads/${leadId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, comment })
    });
    await mutate();
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">{t("dashboard.clientTitle")}</h1>
        <p className="text-sm text-slate-500">{t("dashboard.confirmOrder")}</p>
      </header>

      <section className="space-y-4">
        {leads.length === 0 ? (
          <p className="text-sm text-slate-500">{t("empty.noData")}</p>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              transitions={(clientTransitions[lead.status] ?? []).map((status) => ({
                status,
                label: status === "ACCEPTED" ? t("buttons.confirm") : t("buttons.cancel")
              }))}
              onTransition={handleTransition}
              disableActions={isValidating}
            />
          ))
        )}
      </section>
    </div>
  );
}
