/**
 * Build the catalogue SQL from a WooCommerce Store API export.
 *
 * WooCommerce exposes its catalogue publicly at
 *   /wp-json/wc/store/v1/products?per_page=100&page=N
 * Save each page to a file and pass them here; the script maps them onto our
 * `products` / `collections` schema and prints SQL on stdout.
 *
 * Usage:
 *   node scripts/import-woocommerce.mjs page1.json [page2.json …] > catalogue.sql
 *
 * Options:
 *   --images=source   keep the source image URLs (default: none — we host ours)
 *   --keep            append to the catalogue instead of replacing it
 *
 * Descriptions are carried over as plain text so they can be reviewed and
 * rewritten before going live: product copy is the vendor's own writing, and
 * duplicating it verbatim is both a copyright risk and an SEO penalty.
 */
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith("--"));
const keepImages = args.includes("--images=source");
const replace = !args.includes("--keep");

if (files.length === 0) {
  console.error("usage: node scripts/import-woocommerce.mjs <export.json…>");
  process.exit(1);
}

/** SQL string literal. */
const q = (v) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

const NAMED_ENTITIES = {
  nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
  eacute: "é", egrave: "è", ecirc: "ê", euml: "ë",
  agrave: "à", acirc: "â", auml: "ä",
  ocirc: "ô", ouml: "ö", ugrave: "ù", ucirc: "û", uuml: "ü",
  icirc: "î", iuml: "ï", ccedil: "ç", ntilde: "ñ",
  Eacute: "É", Egrave: "È", Agrave: "À", Ccedil: "Ç",
  laquo: "«", raquo: "»", hellip: "…", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”", ndash: "–", mdash: "—", deg: "°",
  euro: "€", copy: "©", reg: "®", trade: "™", times: "×", middot: "·",
};

/** Decode the HTML entities WordPress editors routinely emit. */
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name] ?? m);
}

/** Strip HTML to readable plain text, keeping paragraph breaks. */
function toText(html) {
  if (!html) return "";
  return decodeEntities(
    html
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/\s*(p|li|div|h[1-6])\s*>/gi, "\n")
      .replace(/<\s*li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

/**
 * Store API prices are integers in minor units, scaled by currency_minor_unit
 * (XOF has none, so the raw value is already whole francs).
 */
function toAmount(prices) {
  if (!prices) return null;
  const raw = prices.price ?? prices.regular_price;
  if (raw == null) return null;
  const minor = Number(prices.currency_minor_unit ?? 0);
  const n = Number(raw) / 10 ** minor;
  return Number.isFinite(n) ? n : null;
}

const slugify = (s) =>
  decodeEntities(String(s))
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

// ── Load every export page ───────────────────────────────────────────────
const raw = [];
for (const f of files) {
  const parsed = JSON.parse(readFileSync(f, "utf8"));
  raw.push(...(Array.isArray(parsed) ? parsed : (parsed.products ?? [parsed])));
}

// ── Map products, deduplicating on handle ────────────────────────────────
const seen = new Set();
const products = [];
const categories = new Map(); // slug → { title, position }

for (const p of raw) {
  const title = decodeEntities((p.name ?? "").trim());
  const price = toAmount(p.prices);
  if (!title || price == null) continue;

  let handle = slugify(p.slug || title);
  if (!handle || seen.has(handle)) handle = `${handle}-${slugify(p.sku || p.id)}`;
  if (seen.has(handle)) continue;
  seen.add(handle);

  // Deepest category wins: it is the most specific label for the product.
  const cats = (p.categories ?? []).filter((c) => c?.name);
  const cat = cats[cats.length - 1];
  const productType = cat?.name?.trim() ?? "Autres produits";
  if (cat) {
    const slug = slugify(cat.slug || cat.name);
    if (!categories.has(slug)) {
      categories.set(slug, { title: cat.name.trim(), position: categories.size + 1 });
    }
  }

  const images =
    keepImages && p.images?.length
      ? p.images
          .slice(0, 4)
          .map((i) => ({ url: i.src, altText: i.alt || title }))
      : [];

  products.push({
    id: `p_${handle}`.slice(0, 60),
    handle,
    title,
    description: toText(p.description || p.short_description),
    price,
    productType,
    tags: cats.map((c) => c.name),
    images,
    available: p.is_in_stock !== false,
  });
}

// ── Emit SQL ─────────────────────────────────────────────────────────────
const out = [];
out.push(`-- ${products.length} produits, ${categories.size} collections`);
out.push("BEGIN;");
if (replace) {
  out.push("DELETE FROM products;");
  out.push("DELETE FROM collections;");
  out.push(
    `INSERT INTO collections (id, handle, title, description, position, product_type_rule)
     VALUES ('col_nouveautes','nouveautes','Nouveautés','Les derniers équipements ajoutés au catalogue GSE.',0,NULL);`,
  );
}

for (const [slug, c] of categories) {
  out.push(
    `INSERT INTO collections (id, handle, title, description, position, product_type_rule) VALUES (${q(
      `col_${slug}`.slice(0, 60),
    )}, ${q(slug)}, ${q(c.title)}, '', ${c.position}, ${q(c.title)})
     ON CONFLICT (tenant_id, handle) DO UPDATE SET title = EXCLUDED.title, product_type_rule = EXCLUDED.product_type_rule;`,
  );
}

for (const p of products) {
  out.push(
    `INSERT INTO products (id, handle, title, description, price, currency, vendor, product_type, tags, images, available, featured) VALUES (${q(
      p.id,
    )}, ${q(p.handle)}, ${q(p.title)}, ${q(p.description)}, ${p.price}, 'XOF', 'GSE', ${q(
      p.productType,
    )}, ${q(JSON.stringify(p.tags))}, ${q(JSON.stringify(p.images))}, ${p.available}, false)
     ON CONFLICT (tenant_id, handle) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price, product_type = EXCLUDED.product_type;`,
  );
}

out.push("COMMIT;");
console.log(out.join("\n"));

console.error(`✓ ${products.length} produits, ${categories.size} collections`);
console.error(
  [...categories.values()].map((c) => `  · ${c.title}`).join("\n"),
);
