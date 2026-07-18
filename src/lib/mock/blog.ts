/** Demo editorial content. In production, source from Shopify Blogs (Storefront API) or a CMS. */
export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  readingTime: string;
  tag: string;
};

export const MOCK_POSTS: Post[] = [
  {
    slug: "choisir-chaussures-securite",
    title: "Comment choisir ses chaussures de sécurité",
    excerpt:
      "Norme S1, S3, embout de protection, semelle anti-perforation : le guide pour ne pas se tromper.",
    content:
      "Les chaussures de sécurité protègent vos pieds contre les chocs, les écrasements, les perforations et les glissades. Sur un chantier ou en atelier, elles sont souvent obligatoires — encore faut-il choisir le bon modèle.\n\nLe premier repère, c'est la norme EN ISO 20345. Elle définit des catégories : SB (embout de protection de base), S1 (antistatique et absorption d'énergie au talon), S1P (S1 + semelle anti-perforation), S3 (S1P + résistance à l'eau et semelle à crampons). Pour la plupart des travaux extérieurs et humides, le S3 est le meilleur compromis.\n\nVérifiez aussi le confort : une chaussure portée toute la journée doit être bien ajustée, respirante et légère. Un mauvais choix entraîne fatigue et blessures. En cas de doute, notre équipe GSE vous conseille selon votre métier et votre environnement de travail.",
    image: "/gse-logo.jpg",
    author: "L'équipe GSE",
    date: "2026-07-15",
    readingTime: "4 min",
    tag: "EPI",
  },
  {
    slug: "epi-indispensables-chantier",
    title: "Les 6 EPI indispensables sur un chantier",
    excerpt:
      "Casque, chaussures, gants, lunettes, protection auditive, haute visibilité : le kit de base.",
    content:
      "La prévention des risques commence par un équipement de protection individuelle (EPI) adapté. Sur un chantier, six catégories forment la base indispensable de tout intervenant.\n\n1. Le casque de sécurité (EN 397) protège contre les chutes d'objets. 2. Les chaussures de sécurité (EN ISO 20345) protègent les pieds. 3. Les gants de protection (EN 388) sont adaptés au risque : coupure, produits chimiques, chaleur. 4. Les lunettes de sécurité (EN 166) protègent les yeux des projections. 5. La protection auditive (EN 352) est indispensable dès que le bruit dépasse 85 dB. 6. Le vêtement haute visibilité (EN ISO 20471) rend l'intervenant visible.\n\nUn EPI n'est efficace que s'il est certifié, en bon état et porté correctement. GSE fournit des équipements conformes aux normes et vous accompagne dans le choix du bon niveau de protection.",
    image: "/gse-logo-icons.jpg",
    author: "L'équipe GSE",
    date: "2026-07-05",
    readingTime: "5 min",
    tag: "Prévention",
  },
  {
    slug: "extincteur-type-de-feu",
    title: "Extincteurs : quel type pour quel feu ?",
    excerpt:
      "Poudre, CO₂, eau : choisir le bon extincteur selon la classe de feu peut tout changer.",
    content:
      "Utiliser le mauvais extincteur peut aggraver un incendie. Le bon choix dépend de la classe de feu à combattre.\n\nLes feux se classent ainsi : classe A (solides : bois, papier, tissu), classe B (liquides inflammables : essence, huile), classe C (gaz), et les feux d'origine électrique. L'extincteur à poudre ABC est polyvalent (A, B et C) et convient à la plupart des situations. L'extincteur au CO₂ est idéal pour les feux électriques et les liquides, car il ne laisse aucun résidu. L'extincteur à eau pulvérisée est réservé aux feux de classe A.\n\nUn extincteur doit être visible, accessible, signalé et vérifié périodiquement. GSE propose des extincteurs adaptés à vos locaux, ainsi que la signalisation et l'accompagnement nécessaires à leur mise en place.",
    image: "/gse-logo.jpg",
    author: "L'équipe GSE",
    date: "2026-06-28",
    readingTime: "4 min",
    tag: "Sécurité incendie",
  },
];
