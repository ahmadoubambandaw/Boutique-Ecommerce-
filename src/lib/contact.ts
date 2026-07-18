/**
 * GSE — Global Safety Équipement · contact & brand constants.
 * Single source of truth used across the footer, contact page and checkout.
 */
export const CONTACT = {
  name: "GSE — Global Safety Équipement",
  shortName: "GSE",
  tagline: "Votre sécurité, notre engagement.",
  /** Display + tel: values. */
  phone: "+221 70 544 26 02",
  phoneTel: "+221705442602",
  whatsapp: "+221 76 262 63 14",
  whatsappNumber: "221762626314", // wa.me format
  email: "commerciale.gse@gmail.com",
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
