/**
 * Extract a safe, log-friendly message from a Plaid SDK error.
 *
 * The Plaid SDK is axios-based. A raw axios error carries `.config.headers`,
 * which includes the `PLAID-SECRET` request header — logging the whole error
 * object would write that secret to Vercel logs in plaintext. Always pass
 * Plaid errors through this function before logging.
 */
export function safePlaidError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: unknown; status?: number } })
      .response;
    if (response?.data && typeof response.data === "object") {
      const data = response.data as Record<string, unknown>;
      const code = data.error_code ?? data.error_type ?? "plaid_error";
      const message = data.error_message ?? "no message";
      return `${String(code)}: ${String(message)}`;
    }
    if (response?.status) {
      return `plaid http ${response.status}`;
    }
  }
  if (err instanceof Error) return err.message;
  return "unknown error";
}
