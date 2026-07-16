import type { Collection, Product } from "@/lib/shopify/types";

/**
 * Demo catalogue used ONLY when no Shopify credentials are configured, so the
 * storefront renders end-to-end out of the box. As soon as real credentials
 * are set, every page pulls live data from Shopify instead — Shopify remains
 * the single source of truth. This data is never written anywhere.
 */

const img = (seed: string, w = 1200, h = 1500) => ({
  url: `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=80`,
  altText: null,
  width: w,
  height: h,
});

function money(amount: string, currencyCode = "EUR") {
  return { amount, currencyCode };
}

function makeProduct(p: {
  handle: string;
  title: string;
  vendor: string;
  type: string;
  price: string;
  compareAt?: string;
  seed: string;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
}): Product {
  const colors = p.colors ?? ["Noir", "Blanc", "Sable"];
  const sizes = p.sizes ?? ["S", "M", "L", "XL"];
  const image = img(p.seed);
  const variants = colors.flatMap((color) =>
    sizes.map((size) => ({
      id: `gid://shopify/ProductVariant/${p.handle}-${color}-${size}`,
      title: `${color} / ${size}`,
      availableForSale: true,
      quantityAvailable: 12,
      selectedOptions: [
        { name: "Couleur", value: color },
        { name: "Taille", value: size },
      ],
      price: money(p.price),
      compareAtPrice: p.compareAt ? money(p.compareAt) : null,
      image,
    })),
  );

  return {
    id: `gid://shopify/Product/${p.handle}`,
    handle: p.handle,
    title: p.title,
    description: `${p.title} — une pièce essentielle, pensée dans les moindres détails. Matières nobles, coupe impeccable, finitions durables.`,
    descriptionHtml: `<p>${p.title} — une pièce essentielle, pensée dans les moindres détails. Matières nobles, coupe impeccable, finitions durables.</p><ul><li>Matière premium certifiée</li><li>Coupe ajustée moderne</li><li>Fabrication responsable</li></ul>`,
    vendor: p.vendor,
    productType: p.type,
    tags: p.tags ?? [],
    availableForSale: true,
    totalInventory: variants.length * 12,
    featuredImage: image,
    images: [image, img(p.seed, 1200, 1500), img(p.seed + "&sat=-20", 1200, 1500)],
    options: [
      { id: "opt-color", name: "Couleur", values: colors },
      { id: "opt-size", name: "Taille", values: sizes },
    ],
    variants,
    priceRange: {
      minVariantPrice: money(p.price),
      maxVariantPrice: money(p.price),
    },
    compareAtPriceRange: {
      minVariantPrice: money(p.compareAt ?? "0"),
      maxVariantPrice: money(p.compareAt ?? "0"),
    },
    seo: { title: p.title, description: null },
    updatedAt: new Date().toISOString(),
  };
}

export const MOCK_PRODUCTS: Product[] = [
  makeProduct({ handle: "manteau-laine", title: "Manteau en laine structuré", vendor: "Atelier", type: "Manteaux", price: "289", compareAt: "349", seed: "photo-1544022613-e87ca75a784a", tags: ["nouveaute", "hiver"] }),
  makeProduct({ handle: "sneakers-minimal", title: "Sneakers minimalistes", vendor: "Kite", type: "Chaussures", price: "159", seed: "photo-1549298916-b41d501d3772", colors: ["Blanc", "Noir"], sizes: ["40", "41", "42", "43", "44"], tags: ["populaire"] }),
  makeProduct({ handle: "sac-cuir", title: "Sac en cuir pleine fleur", vendor: "Maison Lume", type: "Accessoires", price: "219", compareAt: "260", seed: "photo-1584917865442-de89df76afd3", colors: ["Cognac", "Noir"], sizes: ["Unique"], tags: ["nouveaute"] }),
  makeProduct({ handle: "pull-cachemire", title: "Pull en cachemire", vendor: "Atelier", type: "Mailles", price: "179", seed: "photo-1576566588028-4147f3842f27", tags: ["populaire", "hiver"] }),
  makeProduct({ handle: "montre-acier", title: "Montre automatique acier", vendor: "Horizon", type: "Montres", price: "349", seed: "photo-1523275335684-37898b6baf30", colors: ["Argent", "Or"], sizes: ["Unique"], tags: ["nouveaute"] }),
  makeProduct({ handle: "jean-brut", title: "Jean brut selvedge", vendor: "Kite", type: "Pantalons", price: "129", seed: "photo-1542272604-787c3835535d", colors: ["Indigo"], sizes: ["28", "30", "32", "34"], tags: ["populaire"] }),
  makeProduct({ handle: "lunettes-solaires", title: "Lunettes de soleil acétate", vendor: "Horizon", type: "Accessoires", price: "89", compareAt: "120", seed: "photo-1511499767150-a48a237f0083", colors: ["Écaille", "Noir"], sizes: ["Unique"] }),
  makeProduct({ handle: "chemise-lin", title: "Chemise en lin", vendor: "Atelier", type: "Chemises", price: "79", seed: "photo-1596755094514-f87e34085b2c", colors: ["Blanc", "Bleu", "Sable"], tags: ["ete"] }),
];

export const MOCK_COLLECTIONS: Collection[] = [
  { id: "gid://shopify/Collection/nouveautes", handle: "nouveautes", title: "Nouveautés", description: "Les dernières pièces ajoutées à la collection.", image: img("photo-1441984904996-e0b6ba687e04", 1600, 900), seo: { title: null, description: null }, updatedAt: new Date().toISOString() },
  { id: "gid://shopify/Collection/homme", handle: "homme", title: "Homme", description: "Vestiaire masculin essentiel.", image: img("photo-1516257984-b1b4d707412e", 1600, 900), seo: { title: null, description: null }, updatedAt: new Date().toISOString() },
  { id: "gid://shopify/Collection/femme", handle: "femme", title: "Femme", description: "Élégance intemporelle.", image: img("photo-1483985988355-763728e1935b", 1600, 900), seo: { title: null, description: null }, updatedAt: new Date().toISOString() },
  { id: "gid://shopify/Collection/accessoires", handle: "accessoires", title: "Accessoires", description: "Les détails qui font la différence.", image: img("photo-1523170335258-f5ed11844a49", 1600, 900), seo: { title: null, description: null }, updatedAt: new Date().toISOString() },
];

export function mockSearch(query: string): Product[] {
  const q = query.toLowerCase();
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.vendor.toLowerCase().includes(q) ||
      p.productType.toLowerCase().includes(q),
  );
}
