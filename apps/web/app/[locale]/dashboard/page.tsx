import { redirect } from "next/navigation";
import { apiFetch } from "../../../src/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardRedirect({ params }: { params: { locale: string } }) {
  try {
    const user = await apiFetch<{ role: string }>(`/api/users/me`, { withAuth: true });
    redirect(`/${params.locale}/dashboard/${user.role ?? "affiliate"}`);
  } catch {
    redirect(`/${params.locale}/auth/login`);
  }
}
