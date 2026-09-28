import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createInvoiceForPayment } from "@/lib/invoice-generation";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { paymentId } = (await req.json()) as { paymentId: string };
  if (!paymentId) return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });

  try {
    const result = await createInvoiceForPayment(paymentId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to generate invoice" }, { status: 500 });
  }
}
