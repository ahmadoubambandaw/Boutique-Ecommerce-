import { NextResponse } from "next/server";
import { getOrder } from "@/lib/commerce/repository";
import { getSiteSettings } from "@/lib/commerce/settings";
import { deliveryNeedsQuote } from "@/lib/commerce/shipping";
import { renderProformaPdf, type ProformaData } from "@/lib/pdf/proforma";
import { CONTACT } from "@/lib/contact";

export const runtime = "nodejs";

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Paiement à la livraison",
  mobile_money: "Wave / Orange Money",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }
  const settings = await getSiteSettings();

  const data: ProformaData = {
    kind: "FACTURE PROFORMA",
    number: order.orderNumber,
    dateISO: order.createdAt,
    client: {
      companyName: order.address.fullName,
      contactName: order.address.fullName,
      phone: order.address.phone,
      email: order.address.email,
      address: `${order.address.address}, ${order.address.city}${
        order.address.region ? `, ${order.address.region}` : ""
      }`,
    },
    items: order.items.map((i) => ({
      title: i.title,
      variantTitle: i.variantTitle,
      quantity: i.quantity,
      unitPrice: i.price,
    })),
    currency: order.currency,
    deliveryFee: order.deliveryFee,
    deliveryToConfirm: deliveryNeedsQuote(order.subtotal),
    paymentMethods: [PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod],
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
      "Content-Disposition": `inline; filename="facture-proforma-${order.orderNumber}.pdf"`,
    },
  });
}
