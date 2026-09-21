import "server-only";
import fs from "node:fs";
import path from "node:path";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatPrice } from "@/lib/utils";

/**
 * `Intl.NumberFormat` inserts narrow no-break spaces (U+202F) as thousands
 * separators, which Helvetica's WinAnsi encoding can't render (they show up
 * as "/" in the PDF) — normalize to plain spaces for react-pdf output.
 */
function pdfPrice(amount: number, currency: string): string {
  return formatPrice(amount, currency).replace(/[  ]/g, " ");
}

/**
 * Shared "Facture Proforma" template — used both for a downloadable devis
 * (before an order exists) and for the proforma invoice a client gets after
 * placing an order. Same layout, only the title and item source differ.
 */

export type ProformaLineItem = {
  title: string;
  variantTitle?: string | null;
  quantity: number;
  unitPrice: number;
};

export type ProformaData = {
  kind: "DEVIS" | "FACTURE PROFORMA";
  number: number;
  dateISO: string;
  client: {
    companyName: string;
    ninea?: string | null;
    contactName: string;
    phone: string;
    email?: string | null;
    address?: string | null;
  };
  items: ProformaLineItem[];
  currency: string;
  deliveryFee: number;
  deliveryToConfirm: boolean;
  paymentMethods: string[];
  invoice: {
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    address: string | null;
    bankAccountNumber: string | null;
    bankRib: string | null;
    bankCode: string | null;
  };
};

const NAVY = "#122347";
const RED = "#d81f2a";
const BORDER = "#d8dce3";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    paddingBottom: 10,
    marginBottom: 14,
  },
  logo: { width: 48, height: 48, marginRight: 12 },
  brandName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: NAVY },
  brandTagline: { fontSize: 8, color: "#555", marginTop: 2 },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    textAlign: "center",
    marginBottom: 14,
    textTransform: "uppercase",
  },
  infoRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  infoBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 8,
  },
  infoBoxTitle: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    fontSize: 9,
    color: NAVY,
  },
  infoLine: { marginBottom: 2, lineHeight: 1.4 },
  table: { marginBottom: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: NAVY,
    color: "#fff",
    fontFamily: "Helvetica-Bold",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  colQty: { width: "10%" },
  colDesc: { width: "50%" },
  colUnit: { width: "20%", textAlign: "right" },
  colTotal: { width: "20%", textAlign: "right" },
  totals: { marginTop: 8, marginLeft: "50%" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginTop: 3,
    borderTopWidth: 1,
    borderTopColor: NAVY,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  boxRow: { flexDirection: "row", gap: 10, marginTop: 22 },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 8,
  },
  boxTitle: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    fontSize: 9,
    color: NAVY,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: NAVY,
    color: "#fff",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 8,
  },
});

function logoBuffer(): Buffer | null {
  try {
    return fs.readFileSync(path.join(process.cwd(), "public", "gse-logo.jpg"));
  } catch {
    return null;
  }
}

function ProformaDocument({ data }: { data: ProformaData }) {
  const logo = logoBuffer();
  const subtotal = data.items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
  const total = subtotal + data.deliveryFee;
  const date = new Date(data.dateISO).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const invoiceLines = [
    data.invoice.phone && `Tél : ${data.invoice.phone}`,
    data.invoice.whatsapp && `WhatsApp : ${data.invoice.whatsapp}`,
    data.invoice.email && `E-mail : ${data.invoice.email}`,
    data.invoice.address && `Adresse : ${data.invoice.address}`,
  ].filter(Boolean) as string[];
  const hasBank =
    data.invoice.bankAccountNumber || data.invoice.bankRib || data.invoice.bankCode;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logo && <Image src={logo} style={styles.logo} />}
          <View>
            <Text style={styles.brandName}>GSE | GLOBAL SAFETY ÉQUIPEMENT</Text>
            <Text style={styles.brandTagline}>
              Votre partenaire en sécurité au travail et en protection incendie
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          {data.kind} N°{data.number}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Adressé à</Text>
            <Text style={styles.infoLine}>{data.client.companyName}</Text>
            {data.client.address && (
              <Text style={styles.infoLine}>{data.client.address}</Text>
            )}
            {data.client.ninea && (
              <Text style={styles.infoLine}>NINEA/ICE : {data.client.ninea}</Text>
            )}
            <Text style={styles.infoLine}>Contact : {data.client.contactName}</Text>
            <Text style={styles.infoLine}>Tél : {data.client.phone}</Text>
            {data.client.email && (
              <Text style={styles.infoLine}>E-mail : {data.client.email}</Text>
            )}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Détails</Text>
            <Text style={styles.infoLine}>Date : {date}</Text>
            <Text style={styles.infoLine}>Validité : 30 jours</Text>
            <Text style={styles.infoLine}>Émis par : GSE — Dakar</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colDesc}>Désignation</Text>
            <Text style={styles.colUnit}>Prix Unitaire</Text>
            <Text style={styles.colTotal}>Prix Total</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colDesc}>
                {item.title}
                {item.variantTitle && item.variantTitle !== "Default Title"
                  ? ` — ${item.variantTitle}`
                  : ""}
              </Text>
              <Text style={styles.colUnit}>
                {pdfPrice(item.unitPrice, data.currency)}
              </Text>
              <Text style={styles.colTotal}>
                {pdfPrice(item.unitPrice * item.quantity, data.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Sous-total</Text>
            <Text>{pdfPrice(subtotal, data.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Frais de livraison</Text>
            <Text>
              {data.deliveryToConfirm
                ? "À confirmer"
                : pdfPrice(data.deliveryFee, data.currency)}
            </Text>
          </View>
          <View style={styles.totalRowFinal}>
            <Text>Montant Total</Text>
            <Text>{pdfPrice(total, data.currency)}</Text>
          </View>
        </View>

        <View style={styles.boxRow}>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Mode de paiement</Text>
            {data.paymentMethods.map((m) => (
              <Text key={m} style={styles.infoLine}>
                - {m}
              </Text>
            ))}
          </View>
          {hasBank && (
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Coordonnées bancaires</Text>
              {data.invoice.bankAccountNumber && (
                <Text style={styles.infoLine}>
                  N° Compte : {data.invoice.bankAccountNumber}
                </Text>
              )}
              {data.invoice.bankRib && (
                <Text style={styles.infoLine}>Clé RIB : {data.invoice.bankRib}</Text>
              )}
              {data.invoice.bankCode && (
                <Text style={styles.infoLine}>
                  Code Banque : {data.invoice.bankCode}
                </Text>
              )}
            </View>
          )}
        </View>

        {invoiceLines.length > 0 && (
          <View style={styles.footer} fixed>
            {invoiceLines.map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function renderProformaPdf(data: ProformaData): Promise<Buffer> {
  return renderToBuffer(<ProformaDocument data={data} />);
}
