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

/** Acronyms and codes that must keep their capitals when a title is recased. */
const KEEP_CAPS = new Set([
  "ABC", "CO2", "CO₂", "EPI", "E.P.I.", "BAES", "RIA", "DN", "EN", "CE", "SSI",
  "IP", "PVC", "LED", "A4", "A3", "UV", "FFP1", "FFP2", "FFP3", "CPR", "BTP",
  "SNR", "S1P", "S3", "S5", "HT", "TTC", "TVA", "GSE", "INIM", "AFNOR",
]);

/**
 * Clean a supplier title for our shop: the source titles carry boilerplate
 * ("conforme aux normes STANDARD"), internal supplier codes ("(LS)", "(JR)")
 * and shouted words that read badly on a product card.
 */
function cleanTitle(input) {
  let t = decodeEntities(String(input)).trim();

  t = t
    .replace(/\s*conformes?\s+au[x]?\s+normes?\s+(standard|europeenne|européenne|ce)?/gi, " ")
    .replace(/\s*\bnorme\s+(standard|ce)\b/gi, " ")
    .replace(/\s*\bjar\b\s*/gi, " ")
    .replace(/\s*[\(\[]\s*(LS|JR)\s*[\)\]]\s*/gi, " ")
    .replace(/\s*\bstandard\b\s*$/i, " ");

  // "6KG" → "6 kg", "9 litres" → "9 L", "250 ml" untouched.
  t = t
    .replace(/(\d)\s*KG\b/gi, "$1 kg")
    .replace(/(\d)\s*(?:litres?|l)\b/gi, "$1 L")
    .replace(/\bco\s?2\b/gi, "CO2")

    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,;:])/g, "$1")
    .replace(/[\s\-–—]+$/, "")
    .trim();

  // Un-shout words that are pure capitals but not known acronyms. Two-letter
  // French joining words are lowercased explicitly ("EN" is left alone — it
  // prefixes standard numbers such as EN 397).
  const SMALL_WORDS = new Set(["DE", "DU", "LA", "LE", "LES", "ET", "AU", "AUX", "POUR", "SUR"]);
  t = t
    .split(" ")
    .map((w) => {
      const bare = w.replace(/[^A-Za-zÀ-ÿ0-9.]/g, "");
      if (!bare || KEEP_CAPS.has(bare.toUpperCase())) return w;
      if (SMALL_WORDS.has(bare.toUpperCase())) return w.toLowerCase();
      if (bare.length > 2 && bare === bare.toUpperCase() && /[A-ZÀ-Ý]/.test(bare)) {
        return w.charAt(0) + w.slice(1).toLowerCase();
      }
      return w;
    })
    .join(" ");

  // Slug-style names ("Registre-de-securite-A4") read as one word; turn their
  // hyphens into spaces. Initialisms such as "E-P-I" keep theirs.
  const segments = t.split("-");
  if (segments.length > 2 && segments.every((x) => x.trim().length > 1)) {
    t = segments.join(" ").replace(/\s{2,}/g, " ").trim();
  }

  t = t.charAt(0).toUpperCase() + t.slice(1);
  return LABEL_OVERRIDES[t] ?? t;
}

/** Customer-facing names for categories whose source label is unusable. */
const LABEL_OVERRIDES = {
  "E-P-I": "Équipements de protection individuelle",
  "Nos packs promos": "Packs promo",
  "Sécurité Electronique & Contrôle d’accès": "Sécurité électronique",
  "Extincteur et moyens de secours": "Extincteurs & moyens de secours",
};

/**
 * Keep the factual sentences of a supplier description (dimensions, norms,
 * materials, ratings) and drop the marketing prose, which is the vendor's own
 * writing — copying it verbatim is both a copyright risk and duplicate content
 * that search engines penalise.
 */
function factualSpecs(text) {
  if (!text) return [];
  return text
    .split(/\n|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3 && s.length < 200)
    .filter((s) =>
      /\d\s*(mm|cm|m\b|kg|g\b|l\b|ml|w\b|v\b|ohms?|db|%|°|bar)|\bEN\s?\d|\bCPR\b|\bCE\b|\bIP\s?\d|\bclasse\s|\bnorme/.test(
        s,
      ),
    )
    .slice(0, 6);
}

/** Opening line per product family — GSE's voice, not the source's. */
const LEADS = [
  [/extincteur/i, "Extincteur conforme aux normes en vigueur, livré prêt à poser."],
  [/couverture anti-?feu/i, "Couverture anti-feu pour étouffer un départ de flamme sans eau ni poudre."],
  [/d[ée]clencheur/i, "Déclencheur manuel d'alarme, à installer sur les cheminements d'évacuation."],
  [/d[ée]tecteur/i, "Détecteur d'incendie pour une alerte précoce, avant que le feu ne se propage."],
  [/centrale|\bSSI\b/i, "Équipement de centrale incendie, à intégrer à votre système de sécurité."],
  [/sir[èe]ne|flash/i, "Dispositif d'alerte sonore et visuelle pour signaler l'évacuation."],
  [/\bRIA\b|robinet/i, "Robinet d'incendie armé, pour une première intervention efficace."],
  [/casque/i, "Protection de la tête conforme aux normes de chantier."],
  [/gants?/i, "Protection des mains adaptée à un usage professionnel quotidien."],
  [/lunettes|[ée]cran facial|masque/i, "Protection du visage et des voies respiratoires sur poste de travail."],
  [/chaussures?|bottes?/i, "Chaussure de sécurité pour un port prolongé en environnement exigeant."],
  [/harnais|longe|antichute/i, "Équipement antichute pour le travail en hauteur."],
  [/gilet|combinaison|tenue|pack|v[êe]tement/i, "Tenue professionnelle résistante, pensée pour le terrain."],
  [/panneau|signal|registre/i, "Signalisation de sécurité, obligatoire dans les locaux professionnels."],
  [/cam[ée]ra|contr[ôo]le d.acc[èe]s|badge|lecteur/i, "Équipement de sécurité électronique pour contrôler et surveiller vos accès."],
  [/trousse|secours|pharmacie/i, "Matériel de premiers secours à garder accessible en permanence."],
];

/**
 * Compose our own product copy: a GSE opening line for the family, then the
 * factual specifications taken from the supplier sheet, then a closing line.
 * The vendor's marketing prose is deliberately not reused.
 */
function describe(title, productType, sourceText) {
  const lead =
    LEADS.find(([re]) => re.test(title))?.[1] ??
    `${productType} — équipement professionnel distribué par GSE.`;

  const specs = factualSpecs(sourceText);
  const parts = [lead];
  if (specs.length) {
    parts.push(specs.map((s) => (s.startsWith("•") ? s : `• ${s}`)).join("\n"));
  }
  parts.push(
    "Conseil, devis et installation assurés par GSE — Zac Mbao, Dakar. Livraison dans tout le Sénégal.",
  );
  return parts.join("\n");
}

/**
 * Photographs we host ourselves, matched by keyword. Everything else falls back
 * to the GSE mark: a neutral placeholder is honest, whereas an unrelated stock
 * photo misrepresents the article.
 */
const IMAGE_RULES = [
  [/antibruit|bouchon|auditi|casque anti/i, "/products/casque-antibruit.png"],
  [/casque/i, "/products/casque-chantier.png"],
  [/chaussures? hautes?|chaussures? de s[ée]curit[ée]|brodequin/i, "/products/chaussures-s3-photo.jpg"],
  [/chaussure|bottes?|sandale/i, "/products/chaussure-s3-alt.png"],
  [/gants?|mitaine/i, "/products/gants-protection.png"],
  [/gilet.*(visibilit|fluo)|haute visibilit/i, "/products/gilet-haute-visibilite.png"],
  [/gilet|tenue|pack|combinaison|veste|pantalon|harnais/i, "/products/gilet-personnalisable.jpg"],
];

const FALLBACK_IMAGE = "/gse-logo.jpg";

function imageFor(title) {
  const url = IMAGE_RULES.find(([re]) => re.test(title))?.[1] ?? FALLBACK_IMAGE;
  return [{ url, altText: title }];
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
const dupes = new Set();
const duplicates = [];
const skipped = [];
const products = [];
const categories = new Map(); // slug → { title, position }

for (const p of raw) {
  const title = cleanTitle(p.name ?? "");
  const price = toAmount(p.prices);
  if (!title) continue;
  // A zero price means "on request" on these catalogues, never free. Importing
  // it as 0 would put an orderable free item in the shop.
  if (price == null || price <= 0) {
    skipped.push(title);
    continue;
  }

  // The source catalogue lists a few products twice; same name at the same
  // price is the same article, so keep the first and drop the rest.
  const identity = `${title.toLowerCase()}|${price}`;
  if (dupes.has(identity)) {
    duplicates.push(title);
    continue;
  }
  dupes.add(identity);

  let handle = slugify(title) || slugify(p.slug);
  if (!handle || seen.has(handle)) handle = `${handle}-${slugify(p.sku || p.id)}`;
  if (seen.has(handle)) continue;
  seen.add(handle);

  // Deepest category wins: it is the most specific label for the product.
  // The API does not order them, so measure depth from each category's link
  // (…/categorie-produit/parent/child/) rather than trusting array position.
  const cats = (p.categories ?? []).filter((c) => c?.name);
  const depth = (c) =>
    (c.link ?? "").replace(/\/+$/, "").split("/").filter(Boolean).length;
  const cat = cats.reduce(
    (best, c) => (best == null || depth(c) > depth(best) ? c : best),
    null,
  );
  const productType = cat ? cleanTitle(cat.name) : "Autres produits";
  if (cat) {
    // Derive the public slug from our cleaned label, not the source slug:
    // theirs carries typos and boilerplate that would end up in our URLs.
    const slug = slugify(productType) || slugify(cat.slug);
    if (!categories.has(slug)) {
      categories.set(slug, { title: productType, position: categories.size + 1 });
    }
  }

  const images =
    keepImages && p.images?.length
      ? p.images.slice(0, 4).map((i) => ({ url: i.src, altText: i.alt || title }))
      : imageFor(title);

  products.push({
    id: `p_${handle}`.slice(0, 60),
    handle,
    title,
    description: describe(title, productType, toText(p.description || p.short_description)),
    price,
    productType,
    tags: cats.map((c) => decodeEntities(c.name)),
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
if (duplicates.length) {
  console.error(`⚠ ${duplicates.length} doublon(s) écarté(s) : ${duplicates.join(", ")}`);
}
if (skipped.length) {
  console.error(`⚠ ${skipped.length} ignoré(s) — prix sur demande :`);
  skipped.forEach((t) => console.error(`  · ${t}`));
}
console.error(
  [...categories.values()].map((c) => `  · ${c.title}`).join("\n"),
);
