 "use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function authorizedFetch(path: string, options: RequestInit = {}) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.detail ?? "Request failed");
  }

  return response.json();
}

export async function claimLeadAction(locale: string, leadId: string, comment: string) {
  await authorizedFetch("/api/leads/claim", {
    method: "POST",
    body: JSON.stringify({ leadId, comment })
  });
  revalidatePath(`/${locale}/dashboard`);
}

export async function updateLeadStatusAction(locale: string, leadId: string, status: string, comment: string) {
  await authorizedFetch(`/api/leads/${leadId}/status`, {
    method: "POST",
    body: JSON.stringify({ status, comment })
  });
  revalidatePath(`/${locale}/dashboard`);
}

export async function approvePayoutAction(locale: string, leadId: string) {
  await authorizedFetch("/api/balance/approve-payout", {
    method: "POST",
    body: JSON.stringify({ leadId })
  });
  revalidatePath(`/${locale}/dashboard`);
}
