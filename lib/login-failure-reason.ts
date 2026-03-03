/**
 * Short-lived store for login failure reason (e.g. "locked") so the client
 * can show the correct message when NextAuth returns generic AccessDenied.
 * In-memory only; entries expire after 60 seconds.
 */

const store = new Map<string, { reason: string; expiresAt: number }>();
const TTL_MS = 60 * 1000;

export function setLoginFailureReason(email: string, reason: string): void {
  const normalized = email.trim().toLowerCase();
  store.set(normalized, { reason, expiresAt: Date.now() + TTL_MS });
}

export function getLoginFailureReason(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const entry = store.get(normalized);
  if (!entry || Date.now() > entry.expiresAt) {
    store.delete(normalized);
    return null;
  }
  store.delete(normalized); // one-time read
  return entry.reason;
}
