/** Same-origin when Vercel rewrites proxy to API; full URL for local dev or direct API. */
function getApiBase(): string {
  if (typeof window !== "undefined") {
    const pub = process.env.NEXT_PUBLIC_API_URL ?? "";
    if (!pub || pub === "/" || pub === "same-origin") return "";
    return pub.replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

const API_URL = getApiBase();

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = API_URL || "";
  const res = await fetch(`${base}/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "Request failed");
  }
  return data as T;
}

export function getGoogleAuthUrl() {
  const base = API_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:4000");
  return `${base}/api/v1/auth/google`;
}
