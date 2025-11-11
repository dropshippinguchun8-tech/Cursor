import { apiFetch } from "./api";
import { LeadListItem, BalanceSummary } from "../types/leads";

type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

const defaultPagination = {
  page: 1,
  limit: 20
};

export async function fetchLeads(
  params: Record<string, string | number | undefined> = {}
): Promise<PaginatedResponse<LeadListItem>> {
  const searchParams = new URLSearchParams();
  const merged = { ...defaultPagination, ...params };
  Object.entries(merged).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const response = await apiFetch<PaginatedResponse<LeadListItem>>(
    `/api/leads${query ? `?${query}` : ""}`,
    { withAuth: true }
  );
  return response;
}

export async function fetchLeadById(id: string): Promise<LeadListItem> {
  return apiFetch<LeadListItem>(`/api/leads/${id}`, { withAuth: true });
}

export async function fetchBalance(userId: string): Promise<BalanceSummary> {
  return apiFetch<BalanceSummary>(`/api/users/balance/${userId}`, { withAuth: true });
}
