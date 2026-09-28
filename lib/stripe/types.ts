export interface ConnectAccountStatus {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export interface CreateTransferInput {
  amountCents: number;
  destinationAccountId: string;
  description: string;
  metadata: Record<string, string>;
}

export interface TransferResult {
  transferId: string;
  status: "processing" | "paid";
}
