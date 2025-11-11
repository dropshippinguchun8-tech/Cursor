"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ResetPayload = {
  token: string;
  password: string;
};

export async function resetPasswordAction(locale: string, payload: ResetPayload) {
  const csrfResponse = await fetch(`${API_URL}/api/auth/csrf`, {
    headers: { "Accept-Language": locale },
    cache: "no-store"
  });
  const csrfData = await csrfResponse.json();
  const csrfCookieHeader = csrfResponse.headers.get("set-cookie") ?? "";
  const csrfCookie = csrfCookieHeader.split(",")[0]?.split(";")[0] ?? "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": locale,
    "x-csrf-token": csrfData.token
  };
  if (csrfCookie) {
    headers.Cookie = csrfCookie;
  }

  const response = await fetch(`${API_URL}/api/auth/reset`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.detail ?? "Failed to reset password");
  }
}
