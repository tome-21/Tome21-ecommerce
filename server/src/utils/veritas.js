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

  let result;
  let response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers,
      signal: AbortSignal.timeout(10000),
    });
    result = await response.json();
  } catch (error) {
    console.error(error);
    if (error.name === "TimeoutError") {
      throw new Error("Request timeout");
    }
    throw new Error("veritas verification faild", error);
  }

  if (!response.ok || result.success === false) {
    const err = new Error(result.error ?? "veritas request faild");
    err.status = response.status;
    throw err;
  }

  return result;
}
