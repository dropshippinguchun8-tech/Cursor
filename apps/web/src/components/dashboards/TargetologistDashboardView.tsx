"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { clientApiFetch } from "../../lib/api";
import { LeadCard } from "../leads/LeadCard";
import { LeadListItem, BalanceSummary } from "../../types/leads";
import { UserListItem } from "../../lib/users";
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from "@cpamarket/ui";

type Props = {
  locale: string;
  targetologist: UserListItem;
  initialLeads: LeadListItem[];
  balance: BalanceSummary;
};

export function TargetologistDashboardView({ targetologist, initialLeads, balance }: Props) {
  const { t } = useTranslation();
  const { pushToast } = useToast();

  const referralLink = `https://cpamarket.uz/lead/${targetologist.id}`;

  const { data, isValidating, mutate } = useSWR<{ data: LeadListItem[] }>(
    `/api/leads?targetologistId=${targetologist.id}`,
    (url) => clientApiFetch<{ data: LeadListItem[] }>(url),
    {
      fallbackData: { data: initialLeads },
      refreshInterval: 10000
    }
  );

  const leads = data?.data ?? [];

  const statusStats = useMemo(() => {
    return leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.status] = (acc[lead.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [leads]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      pushToast({ title: t("dashboard.copied"), variant: "success" });
    } catch {
      pushToast({ title: t("notifications.error"), variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">{t("dashboard.targetologistTitle")}</h1>
        <p className="text-sm text-slate-500">{targetologist.username}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium text-slate-700">{t("dashboard.referralLink")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <code className="block truncate rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{referralLink}</code>
            <Button variant="outline" onClick={handleCopy} className="w-full">
              {t("dashboard.copy")}
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium text-slate-700">{t("common.holdBalance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">${balance.holdBalance.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium text-slate-700">{t("common.mainBalance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">${balance.mainBalance.toFixed(2)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">{t("dashboard.leadsByStatus")}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Object.entries(statusStats).map(([status, count]) => (
            <Card key={status} className="border border-slate-200 bg-slate-50">
              <CardContent className="py-4 text-center">
                <p className="text-sm text-slate-500">{t(`status.${status}`)}</p>
                <p className="text-2xl font-semibold text-slate-900">{count}</p>
              </CardContent>
            </Card>
          ))}
          {Object.keys(statusStats).length === 0 ? (
            <p className="text-sm text-slate-500">{t("empty.noData")}</p>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">{t("dashboard.myLeads")}</h2>
        {leads.length === 0 ? (
          <p className="text-sm text-slate-500">{t("empty.noData")}</p>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} disableActions />)
        )}
      </section>
    </div>
  );
}
