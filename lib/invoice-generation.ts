import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { getNextInvoiceNumber } from "@/lib/payments-data";
import type { LineItem } from "@/lib/types";

export async function createInvoiceForPayment(paymentId: string): Promise<{
  invoiceId: string;
  pdfUrl: string;
  invoiceNumber: string;
}> {
  const supabase = createServerClient();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select(
      "*, campaign_influencers(fee, commission_rate, influencers(id, name, handle, email), campaigns(id, name, brand))"
    )
    .eq("id", paymentId)
    .single();

  if (paymentError || !payment) {
    throw new Error(paymentError?.message ?? "Payment not found");
  }

  const influencer = payment.campaign_influencers.influencers;
  const campaign = payment.campaign_influencers.campaigns;

  const invoiceNumber = await getNextInvoiceNumber();
  const lineItems: LineItem[] = [
    { description: payment.description ?? `${campaign.name} payment`, amount: Number(payment.amount) },
  ];

  const pdfBytes = await generateInvoicePdf({
    invoiceNumber,
    influencer: { name: influencer.name, handle: influencer.handle, email: influencer.email },
    campaign: { name: campaign.name, brand: campaign.brand },
    amount: Number(payment.amount),
    lineItems,
  });

  const fileName = `invoices/${invoiceNumber}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("stylecraftreach")
    .upload(fileName, pdfBytes, { contentType: "application/pdf", upsert: true });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("stylecraftreach").getPublicUrl(fileName);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      payment_id: paymentId,
      invoice_number: invoiceNumber,
      influencer_id: influencer.id,
      campaign_id: campaign.id,
      amount: payment.amount,
      description: payment.description,
      line_items: lineItems,
      pdf_url: publicUrl,
    })
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  await supabase.from("payments").update({ invoice_id: invoice.id }).eq("id", paymentId);

  return { invoiceId: invoice.id, pdfUrl: publicUrl, invoiceNumber };
}
