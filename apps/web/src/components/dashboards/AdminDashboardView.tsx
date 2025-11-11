"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { clientApiFetch } from "../../lib/api";
import { LeadCard } from "../leads/LeadCard";
import { LeadListItem, LeadStatus } from "../../types/leads";
import { UserListItem } from "../../lib/users";
import { Button, useToast } from "@cpamarket/ui";

type Meta = {
  total: number;
  page: number;
  limit: number;
};

type FiltersState = {
  status: string;
  operatorId: string;
  targetologistId: string;
};

type Props = {
  locale: string;
  initialLeads: LeadListItem[];
  meta: Meta;
  operators: UserListItem[];
  targetologists: UserListItem[];
  initialFilters: FiltersState;
};

type SwrResponse = {
  data: LeadListItem[];
  meta: Meta;
};

const adminTransitions: Record<LeadStatus, LeadStatus[]> = {
  NEW: ["ARCHIVED"],
  OPERATOR_ASSIGNED: ["ARCHIVED"],
  ACCEPTED: ["SENT"],
  SENT: ["SOLD"],
  ARCHIVED: [],
  SOLD: []
};

const statusOptions: Array<{ value: string; labelKey: string }> = [
  { value: "", labelKey: "filters" },
  { value: "NEW", labelKey: "status.NEW" },
  { value: "OPERATOR_ASSIGNED", labelKey: "status.OPERATOR_ASSIGNED" },
  { value: "ACCEPTED", labelKey: "status.ACCEPTED" },
  { value: "ARCHIVED", labelKey: "status.ARCHIVED" },
  { value: "SENT", labelKey: "status.SENT" },
  { value: "SOLD", labelKey: "status.SOLD" }
];

export function AdminDashboardView({
  locale,
  initialLeads,
  meta,
  operators,
  targetologists,
  initialFilters
}: Props) {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const router = useRouter();
  const [filters, setFilters] = useState<FiltersState>(initialFilters);

  const buildKey = (state: FiltersState) => {
    const params = new URLSearchParams();
    if (state.status) params.set("status", state.status);
    if (state.operatorId) params.set("operatorId", state.operatorId);
    if (state.targetologistId) params.set("targetologistId", state.targetologistId);
    params.set("page", "1");
    params.set("limit", "20");
    return `/api/leads?${params.toString()}`;
  };

  const { data, mutate, isValidating } = useSWR<SwrResponse>(
    buildKey(filters),
    (url) => clientApiFetch<SwrResponse>(url),
    {
      fallbackData: { data: initialLeads, meta },
      refreshInterval: 10000
    }
  );

  const leads = data?.data ?? [];

  const updateFilters = (next: Partial<FiltersState>) => {
    const updated = { ...filters, ...next };
    setFilters(updated);
    const params = new URLSearchParams();
    if (updated.status) params.set("status", updated.status);
    if (updated.operatorId) params.set("operatorId", updated.operatorId);
    if (updated.targetologistId) params.set("targetologistId", updated.targetologistId);
    router.replace(`/${locale}/dashboard/admin${params.toString() ? `?${params}` : ""}`);
    mutate();
  };

  const handleTransition = async (leadId: string, status: LeadStatus, comment: string) => {
    await clientApiFetch<LeadListItem>(`/api/leads/${leadId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, comment })
    });
    await mutate();
  };

  const handleApproveTransaction = async (leadId: string) => {
    try {
      await clientApiFetch(`/api/admin/approve-transaction`, {
        method: "POST",
        body: JSON.stringify({ leadId })
      });
      pushToast({ title: t("dashboard.approvePayout"), variant: "success" });
      await mutate();
    } catch (error: any) {
      pushToast({
        title: t("notifications.error"),
        description: error?.message ?? "Unable to approve transaction",
        variant: "destructive"
      });
    }
  };

  const leadTransitions = useMemo(
    () =>
      leads.map((lead) => {
        const statuses = adminTransitions[lead.status] ?? [];
        return statuses.map((status) => ({
          status,
          label: status === "SOLD" ? t("buttons.markSold") : t(`status.${status}`)
        }));
      }),
    [leads, t]
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">{t("dashboard.adminTitle")}</h1>
        <p className="text-sm text-slate-500">
          {isValidating ? t("notifications.statusUpdated") : `${t("dashboard.allLeads")}: ${data?.meta.total ?? 0}`}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">{t("dashboard.statusFilter")}</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={filters.status}
              onChange={(event) => updateFilters({ status: event.target.value })}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value ? t(option.labelKey) : t("dashboard.filters")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">{t("dashboard.operatorFilter")}</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={filters.operatorId}
              onChange={(event) => updateFilters({ operatorId: event.target.value })}
            >
              <option value="">{t("dashboard.filters")}</option>
              {operators.map((operator) => (
                <option key={operator.id} value={operator.id}>
                  {operator.username}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">{t("dashboard.targetologistFilter")}</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={filters.targetologistId}
              onChange={(event) => updateFilters({ targetologistId: event.target.value })}
            >
              <option value="">{t("dashboard.filters")}</option>
              {targetologists.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {leads.length === 0 ? (
          <p className="text-sm text-slate-500">{t("empty.noData")}</p>
        ) : (
          leads.map((lead, index) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              transitions={leadTransitions[index]}
              onTransition={handleTransition}
              disableActions={isValidating}
            >
              {lead.status === "SOLD" ? (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => handleApproveTransaction(lead.id)}>
                    {t("dashboard.approvePayout")}
                  </Button>
                </div>
              ) : null}
            </LeadCard>
          ))
        )}
      </section>
    </div>
  );
}
