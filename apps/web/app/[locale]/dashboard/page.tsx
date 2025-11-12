import { redirect } from "next/navigation";
import { apiFetch } from "../../../src/lib/api";

export const dynamic = "force-dynamic";

const roleToPath: Record<string, string> = {
  admin: "admin",
  operator: "operator",
  targetologist: "targetologist",
  client: "client"
};

export default async function DashboardRedirect({ params }: { params: { locale: string } }) {
  try {
    const user = await apiFetch<{ role: string }>(`/api/users/me`, { withAuth: true });
    const path = roleToPath[user.role] ?? "admin";
    redirect(`/${params.locale}/dashboard/${path}`);
  } catch {
    redirect(`/${params.locale}/auth/login`);
  }
}
