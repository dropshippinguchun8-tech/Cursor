"use client";

import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { clientApiFetch } from "../../lib/api";
import { LeadCard } from "../leads/LeadCard";
import { LeadListItem, LeadStatus, BalanceSummary } from "../../types/leads";

type Props = {
  locale: string;
  operatorId: string;
  initialLeads: LeadListItem[];
  balance: BalanceSummary;
};

const operatorTransitions: Record<LeadStatus, LeadStatus[]> = {
  NEW: [],
  OPERATOR_ASSIGNED: ["ACCEPTED", "ARCHIVED"],
  ACCEPTED: [],
  ARCHIVED: [],
  SENT: [],
  SOLD: []
};

export function OperatorDashboardView({ operatorId, initialLeads, balance }: Props) {
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
  const queue = leads.filter((lead) => lead.status === "NEW" && !lead.operator);
  const assigned = leads.filter((lead) => lead.operator?.id === operatorId);

  const handleClaim = async (leadId: string, comment: string) => {
    await clientApiFetch(`/api/leads/claim`, {
      method: "POST",
      body: JSON.stringify({ leadId, comment })
    });
    await mutate();
  };

  const handleTransition = async (leadId: string, status: LeadStatus, comment: string) => {
    await clientApiFetch(`/api/leads/${leadId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, comment })
    });
    await mutate();
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">{t("dashboard.operatorTitle")}</h1>
        <div className="flex gap-4 text-sm text-slate-600">
          <div>
            {t("common.holdBalance", { defaultValue: "Hold" })}:{" "}
            <span className="font-semibold text-slate-900">${balance.holdBalance.toFixed(2)}</span>
          </div>
          <div>
            {t("common.mainBalance", { defaultValue: "Main" })}:{" "}
            <span className="font-semibold text-slate-900">${balance.mainBalance.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">{t("dashboard.leadQueue")}</h2>
        {queue.length === 0 ? (
          <p className="text-sm text-slate-500">{t("empty.noData")}</p>
        ) : (
          queue.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClaim={handleClaim} disableActions={isValidating} />
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">{t("dashboard.myAssignments")}</h2>
        {assigned.length === 0 ? (
          <p className="text-sm text-slate-500">{t("empty.noData")}</p>
        ) : (
          assigned.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              transitions={(operatorTransitions[lead.status] ?? []).map((status) => ({
                status,
                label: status === "ACCEPTED" ? t("buttons.confirm") : t("buttons.reject")
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
