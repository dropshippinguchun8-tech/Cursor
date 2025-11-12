import { apiFetch } from "./api";

export type UserListItem = {
  id: string;
  username: string;
  email: string;
  role: string;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

export async function fetchUsersByRole(role: string, limit = 100): Promise<UserListItem[]> {
  const response = await apiFetch<PaginatedResponse<UserListItem>>(
    `/api/users?role=${role}&page=1&limit=${limit}`,
    { withAuth: true }
  );
  return response.data;
}

export async function fetchCurrentUser(): Promise<UserListItem> {
  return apiFetch<UserListItem>(`/api/users/me`, { withAuth: true });
}
