import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  type CountryCode,
  type Products,
} from "plaid";

function readEnv() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const env = (process.env.PLAID_ENV ?? "sandbox") as keyof typeof PlaidEnvironments;
  if (!clientId || !secret) {
    throw new Error(
      "Missing Plaid env vars: set PLAID_CLIENT_ID and PLAID_SECRET (see .env.local.example).",
    );
  }
  return { clientId, secret, env };
}

let cached: PlaidApi | null = null;

export function getPlaidClient(): PlaidApi {
  if (cached) return cached;
  const { clientId, secret, env } = readEnv();
  const config = new Configuration({
    basePath: PlaidEnvironments[env] ?? PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": clientId,
        "PLAID-SECRET": secret,
      },
    },
  });
  cached = new PlaidApi(config);
  return cached;
}

export const PLAID_PRODUCTS: Products[] = ["transactions" as Products];
export const PLAID_COUNTRY_CODES: CountryCode[] = ["US" as CountryCode];

export function getWebhookUrl(): string | undefined {
  return process.env.PLAID_WEBHOOK_URL || undefined;
}
