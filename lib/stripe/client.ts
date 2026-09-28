import "server-only";
import type { ConnectAccountStatus, CreateTransferInput, TransferResult } from "./types";

export const MOCK_MODE = !process.env.STRIPE_SECRET_KEY;

function randomId(prefix: string): string {
  return `${prefix}_mock_${Math.random().toString(36).slice(2, 12)}`;
}

async function getStripe() {
  const { default: Stripe } = await import("stripe");
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-08-26.dahlia",
  });
}

export async function createConnectAccount(
  influencerId: string,
  email: string | null
): Promise<string> {
  if (MOCK_MODE) return randomId("acct");

  const stripe = await getStripe();
  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    email: email ?? undefined,
    capabilities: { transfers: { requested: true } },
    metadata: { influencer_id: influencerId },
  });
  return account.id;
}

export async function createOnboardingLink(
  accountId: string,
  influencerId: string
): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (MOCK_MODE) {
    return `https://connect.stripe.com/mock-onboarding/${accountId}`;
  }

  const stripe = await getStripe();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/payments/${influencerId}?stripe=refresh`,
    return_url: `${appUrl}/payments/${influencerId}?stripe=success`,
    type: "account_onboarding",
  });
  return link.url;
}

export async function getAccountStatus(accountId: string): Promise<ConnectAccountStatus> {
  if (MOCK_MODE) return { chargesEnabled: true, payoutsEnabled: true };

  const stripe = await getStripe();
  const account = await stripe.accounts.retrieve(accountId);
  return {
    chargesEnabled: Boolean(account.charges_enabled),
    payoutsEnabled: Boolean(account.payouts_enabled),
  };
}

export async function createTransfer(input: CreateTransferInput): Promise<TransferResult> {
  if (MOCK_MODE) {
    return { transferId: randomId("tr"), status: "paid" };
  }

  const stripe = await getStripe();
  const transfer = await stripe.transfers.create({
    amount: input.amountCents,
    currency: "usd",
    destination: input.destinationAccountId,
    description: input.description,
    metadata: input.metadata,
  });
  return { transferId: transfer.id, status: "processing" };
}
