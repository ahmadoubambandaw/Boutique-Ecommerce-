export type Locale = "fr" | "en";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

/**
 * UI string dictionary for the shared chrome (header, footer, common actions).
 * Page body copy stays authored in French; extend these dictionaries to
 * localize further. Keys are stable identifiers.
 */
export const dictionary = {
  fr: {
    "nav.catalog": "Catalogue",
    "nav.collections": "Collections",
    "nav.new": "Nouveautés",
    "nav.blog": "Blog",
    "nav.about": "À propos",
    "nav.account": "Mon compte",
    "action.search": "Rechercher",
    "action.searchPlaceholder": "Rechercher un produit, une marque…",
    "action.addToCart": "Ajouter au panier",
    "action.buyNow": "Acheter maintenant",
    "cart.title": "Panier",
    "cart.empty": "Votre panier est vide.",
    "cart.checkout": "Passer au paiement",
    "cart.subtotal": "Sous-total",
    "footer.help": "Aide",
    "footer.company": "Entreprise",
    "footer.newsletter": "Recevez nos nouveautés et offres exclusives.",
    "toast.addedToCart": "Ajouté au panier",
    "toast.addedToWishlist": "Ajouté aux favoris",
    "toast.removedFromWishlist": "Retiré des favoris",
  },
  en: {
    "nav.catalog": "Shop",
    "nav.collections": "Collections",
    "nav.new": "New in",
    "nav.blog": "Journal",
    "nav.about": "About",
    "nav.account": "My account",
    "action.search": "Search",
    "action.searchPlaceholder": "Search for a product, a brand…",
    "action.addToCart": "Add to cart",
    "action.buyNow": "Buy now",
    "cart.title": "Cart",
    "cart.empty": "Your cart is empty.",
    "cart.checkout": "Checkout",
    "cart.subtotal": "Subtotal",
    "footer.help": "Help",
    "footer.company": "Company",
    "footer.newsletter": "Get our latest drops and exclusive offers.",
    "toast.addedToCart": "Added to cart",
    "toast.addedToWishlist": "Added to wishlist",
    "toast.removedFromWishlist": "Removed from wishlist",
  },
} as const;

export type TranslationKey = keyof (typeof dictionary)["fr"];
