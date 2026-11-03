const apiUrl =
  process.env.VERITAS_API_URL ?? "https://verifyapi.leulzenebe.pro";

const apiKey = process.env.VERITAS_API_KEY;

if (!apiKey) {
  throw new Error("VERITAS_API_KEY is required");
}

export async function veritas(path, init = {}) {
  const headers = new Headers(init.headers);

  headers.set("x-api-key", apiKey);

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(
      result.error ?? `Veritas request failed (${response.status})`
    );
  }

  return result;
}