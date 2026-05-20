const PREFIX = "mockcertify-exam-";

export function cacheExamStart(attemptId: string, payload: unknown) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${PREFIX}${attemptId}`, JSON.stringify(payload));
  } catch {
    /* quota exceeded — fall back to network fetch */
  }
}

/** Read cached exam payload. Does not delete — call clearExamStart after state is set. */
export function readExamStart<T>(attemptId: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${attemptId}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearExamStart(attemptId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${PREFIX}${attemptId}`);
}
