import ky, { Options } from "ky";

export interface ApiClientOptions extends Options {
  accessToken?: string;
}

export function createApiClient(baseUrl: string, options: ApiClientOptions = {}) {
  const { accessToken, ...rest } = options;

  return ky.create({
    prefixUrl: baseUrl,
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`
        }
      : undefined,
    hooks: {
      beforeRequest: [
        (request) => {
          request.headers.set("Accept", "application/json");
        }
      ],
      afterResponse: [
        async (_request, _options, response) => {
          if (!response.ok) {
            const body = await response.clone().json().catch(() => undefined);
            const error = new Error("API request failed");
            (error as any).status = response.status;
            (error as any).body = body;
            throw error;
          }
        }
      ]
    },
    ...rest
  });
}
