import "server-only";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { LineItem } from "@/lib/types";

const GOLD = rgb(0.784, 0.663, 0.431);
const DARK = rgb(0.1, 0.1, 0.1);
const GRAY = rgb(0.5, 0.5, 0.5);
const LIGHT_GRAY = rgb(0.6, 0.6, 0.6);
const DIVIDER = rgb(0.9, 0.9, 0.9);

export interface InvoicePdfInput {
  invoiceNumber: string;
  influencer: { name: string; handle: string; email: string | null };
  campaign: { name: string; brand: string };
  amount: number;
  lineItems: LineItem[];
}

export async function generateInvoicePdf(input: InvoicePdfInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  page.drawText("StylecraftReach", { x: 50, y: height - 60, size: 22, font: boldFont, color: GOLD });
  page.drawText("stylecraftus.com", { x: 50, y: height - 80, size: 10, font, color: LIGHT_GRAY });

  page.drawText("INVOICE", { x: 400, y: height - 60, size: 22, font: boldFont, color: DARK });
  page.drawText(input.invoiceNumber, { x: 400, y: height - 80, size: 12, font, color: rgb(0.4, 0.4, 0.4) });

  page.drawLine({
    start: { x: 50, y: height - 100 },
    end: { x: width - 50, y: height - 100 },
    thickness: 1,
    color: DIVIDER,
  });

  page.drawText("Bill to:", { x: 50, y: height - 130, size: 10, font: boldFont, color: DARK });
  page.drawText(input.influencer.name, { x: 50, y: height - 148, size: 12, font, color: DARK });
  page.drawText(`@${input.influencer.handle.replace(/^@/, "")}`, {
    x: 50,
    y: height - 164,
    size: 10,
    font,
    color: GRAY,
  });
  if (input.influencer.email) {
    page.drawText(input.influencer.email, { x: 50, y: height - 180, size: 10, font, color: GRAY });
  }

  page.drawText(
    `Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    { x: 350, y: height - 130, size: 10, font, color: DARK }
  );
  page.drawText(`Campaign: ${input.campaign.name}`, { x: 350, y: height - 148, size: 10, font, color: DARK });
  page.drawText(`Brand: ${input.campaign.brand}`, { x: 350, y: height - 164, size: 10, font, color: DARK });

  page.drawRectangle({
    x: 50,
    y: height - 240,
    width: width - 100,
    height: 24,
    color: rgb(0.95, 0.95, 0.95),
  });
  page.drawText("Description", { x: 60, y: height - 230, size: 10, font: boldFont, color: DARK });
  page.drawText("Amount", { x: width - 130, y: height - 230, size: 10, font: boldFont, color: DARK });

  const lineItems = input.lineItems.length > 0 ? input.lineItems : [{ description: "Payment", amount: input.amount }];
  let yPos = height - 260;
  for (const item of lineItems) {
    page.drawText(item.description, { x: 60, y: yPos, size: 10, font, color: DARK });
    page.drawText(`$${item.amount.toFixed(2)}`, { x: width - 130, y: yPos, size: 10, font, color: DARK });
    yPos -= 20;
  }

  page.drawLine({
    start: { x: 350, y: yPos - 10 },
    end: { x: width - 50, y: yPos - 10 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  page.drawText("Total", { x: 350, y: yPos - 30, size: 12, font: boldFont, color: DARK });
  page.drawText(`$${input.amount.toFixed(2)} USD`, {
    x: width - 150,
    y: yPos - 30,
    size: 14,
    font: boldFont,
    color: GOLD,
  });

  page.drawText("Thank you for your partnership with StylecraftUS.", {
    x: 50,
    y: 60,
    size: 10,
    font,
    color: LIGHT_GRAY,
  });
  page.drawText("Questions? team@stylecraftus.com", { x: 50, y: 44, size: 9, font, color: LIGHT_GRAY });

  return pdfDoc.save();
}
