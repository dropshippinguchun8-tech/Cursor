import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { apiFetch } from "../../../../src/lib/api";
import { Card, CardContent, CardHeader, CardTitle, Badge, StatCard } from "@cpamarket/ui";
import { StatsChart } from "../../../../src/components/StatsChart";

type TotalsResponse = {
  clicks: number;
  leads: number;
  approved: number;
  revenue: number;
  conversionRate: number;
};

type TimeseriesPoint = { date: string; value: number };

const roleTitles: Record<string, { title: string; description: string }> = {
  admin: { title: "Admin overview", description: "Global health and finance metrics" },
  operator: { title: "Operator queue", description: "Lead approvals and ticket loads" },
  targetolog: { title: "Targetologist lab", description: "Campaign pacing and creatives" },
  advertiser: { title: "Advertiser control", description: "Offer performance and spend" },
  affiliate: { title: "Affiliate insights", description: "Traffic performance and payouts" }
};

export const dynamic = "force-dynamic";

export default async function RoleDashboard({
  params
}: {
  params: { locale: string; role: string };
}) {
  const allowedRoles = Object.keys(roleTitles);
  if (!allowedRoles.includes(params.role)) {
    notFound();
  }

  const [tDashboard, user, totals, timeseries, topOffers] = await Promise.all([
    getTranslations({ locale: params.locale, namespace: "dashboard" }),
    apiFetch<{ id: string; username: string; role: string }>(`/api/users/me`, {
      withAuth: true
    }),
    apiFetch<TotalsResponse>(`/api/stats/totals`, { withAuth: true }),
    apiFetch<{ clicks: TimeseriesPoint[]; leads: TimeseriesPoint[] }>(`/api/stats/timeseries`, { withAuth: true }),
    apiFetch<Array<{ id: string; title: string; leads: number; clicks: number; revenue: number }>>(
      `/api/stats/top`,
      { withAuth: true }
    )
  ]);

  if (user.role !== params.role) {
    redirect(`/${params.locale}/dashboard/${user.role}`);
  }

  const roleMeta = roleTitles[params.role];

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-2">
          <Badge variant="secondary" className="uppercase tracking-wider">
            {params.role}
          </Badge>
          <h1 className="text-3xl font-semibold text-slate-900">
            {tDashboard("welcome", { name: user.username ?? "Guest" })}
          </h1>
          <p className="text-base font-medium text-slate-700">{roleMeta.title}</p>
          <p className="text-sm text-slate-500">{roleMeta.description}</p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Clicks"
            value={totals.clicks.toLocaleString()}
            trend={{ direction: "up", label: "+12%" }}
          />
          <StatCard
            label="Leads"
            value={totals.leads.toLocaleString()}
            trend={{ direction: "neutral", label: "weekly" }}
          />
          <StatCard
            label="Approved"
            value={totals.approved.toLocaleString()}
            trend={{ direction: "up", label: `${totals.conversionRate.toFixed(1)}% CR` }}
          />
          <StatCard
            label="Revenue"
            value={`$${totals.revenue.toFixed(2)}`}
            trend={{ direction: "up", label: "net" }}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{tDashboard("analytics")} · Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsChart data={timeseries.clicks} color="#6366f1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{tDashboard("analytics")} · Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsChart data={timeseries.leads} color="#0ea5e9" />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">{tDashboard("offers")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {topOffers.map((offer) => (
              <Card key={offer.id} className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900">{offer.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm text-slate-600">
                  <div>
                    <div>Leads: {offer.leads}</div>
                    <div>Clicks: {offer.clicks}</div>
                  </div>
                  <div className="font-semibold text-slate-900">${offer.revenue.toFixed(2)}</div>
                </CardContent>
              </Card>
            ))}
            {topOffers.length === 0 ? <p className="text-sm text-slate-500">No data yet</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
