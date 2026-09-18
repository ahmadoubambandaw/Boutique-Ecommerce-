/**
 * GSE — Global Safety Équipement · contact & brand constants.
 * Single source of truth used across the footer, contact page and checkout.
 */
/** All phone lines, in display order. The first is the primary number used
 * for single-value contexts (JSON-LD, `tel:` CTAs, inline prose). */
export const PHONES = [
  { display: "+221 70 544 26 02", tel: "+221705442602" },
  { display: "+221 76 26 26 314", tel: "+221762626314" },
  { display: "+221 78 45 75 354", tel: "+221784575354" },
] as const;

export const CONTACT = {
  name: "GSE — Global Safety Équipement",
  shortName: "GSE",
  tagline: "Votre sécurité, notre engagement.",
  /** Display + tel: values for the primary number. */
  phone: PHONES[0].display,
  phoneTel: PHONES[0].tel,
  /** All numbers joined for prose, e.g. "contactez-nous au {CONTACT.phonesJoined}". */
  phonesJoined: PHONES.map((p) => p.display).join(" / "),
  whatsapp: "+221 78 45 75 354",
  whatsappNumber: "221784575354", // wa.me format
  email: "commerciale.gsec@gmail.com",
  address: "Zac Mbao, Dakar, Sénégal",
  city: "Dakar",
  country: "Sénégal",
} as const;

/**
 * Number the customer pays for Wave / Orange Money. Both services are reachable
 * on the merchant's phone; confirm the exact split if it differs.
 */
export const MOBILE_MONEY_NUMBER = "+221 70 544 26 02";

export const waLink = `https://wa.me/${CONTACT.whatsappNumber}`;
