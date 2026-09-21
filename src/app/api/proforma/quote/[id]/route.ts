import { NextResponse } from "next/server";
import { getQuoteRequestById } from "@/lib/commerce/repository";
import { getSiteSettings } from "@/lib/commerce/settings";
import { renderProformaPdf, type ProformaData } from "@/lib/pdf/proforma";
import { CONTACT } from "@/lib/contact";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const quote = await getQuoteRequestById(id);
  if (!quote) {
    return NextResponse.json({ error: "Devis introuvable." }, { status: 404 });
  }
  const settings = await getSiteSettings();

  const data: ProformaData = {
    kind: "DEVIS",
    number: quote.quoteNumber,
    dateISO: quote.createdAt,
    client: {
      companyName: quote.companyName,
      ninea: quote.ninea,
      contactName: quote.contactName,
      phone: quote.phone,
      email: quote.email,
    },
    items: quote.items.map((i) => ({
      title: i.title,
      variantTitle: i.variantTitle,
      quantity: i.quantity,
      unitPrice: i.price,
    })),
    currency: "XOF",
    deliveryFee: 0,
    deliveryToConfirm: true,
    paymentMethods: ["Comptant", "Chèque", "Virement bancaire"],
    invoice: {
      phone: settings?.invoicePhone ?? CONTACT.phone,
      whatsapp: settings?.invoiceWhatsapp ?? CONTACT.whatsapp,
      email: settings?.invoiceEmail ?? CONTACT.email,
      address: settings?.invoiceAddress ?? CONTACT.address,
      bankAccountNumber: settings?.bankAccountNumber ?? null,
      bankRib: settings?.bankRib ?? null,
      bankCode: settings?.bankCode ?? null,
    },
  };

  const buffer = await renderProformaPdf(data);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="devis-${quote.quoteNumber}.pdf"`,
    },
  });
}
