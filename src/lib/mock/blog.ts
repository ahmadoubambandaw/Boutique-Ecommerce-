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

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1600&h=900&q=80`;

export const MOCK_POSTS: Post[] = [
  {
    slug: "tendances-automne-hiver",
    title: "Les tendances incontournables de l'automne-hiver",
    excerpt:
      "Matières chaudes, coupes structurées et palettes profondes : découvrez ce qui définit la saison.",
    content:
      "Cette saison célèbre le retour des matières nobles et des silhouettes affirmées. La laine se porte structurée, le cachemire se fait généreux, et les tons profonds — encre, camel, bordeaux — dominent les vestiaires. L'accent est mis sur des pièces durables, pensées pour traverser les années plutôt que les saisons.",
    image: img("photo-1483985988355-763728e1935b"),
    author: "L'équipe éditoriale",
    date: "2026-07-08",
    readingTime: "4 min",
    tag: "Tendances",
  },
  {
    slug: "guide-matieres-durables",
    title: "Guide des matières durables",
    excerpt:
      "Comment reconnaître une pièce responsable ? Notre guide pour consommer mieux.",
    content:
      "Choisir une matière durable, c'est privilégier des fibres certifiées, une traçabilité claire et une longévité éprouvée. Coton biologique, laine recyclée, lin européen : chaque choix compte. Nous détaillons ici les labels de confiance et les gestes d'entretien qui prolongent la vie de vos vêtements.",
    image: img("photo-1523381210434-271e8be1f52b"),
    author: "L'équipe éditoriale",
    date: "2026-06-24",
    readingTime: "6 min",
    tag: "Durabilité",
  },
  {
    slug: "art-du-minimalisme",
    title: "L'art du minimalisme vestimentaire",
    excerpt:
      "Moins, mais mieux. Construire une garde-robe capsule intemporelle.",
    content:
      "Le minimalisme n'est pas une privation, mais une exigence. Une garde-robe capsule repose sur des pièces polyvalentes, de qualité, qui se combinent à l'infini. Nous partageons notre méthode pour bâtir un vestiaire cohérent, élégant et libéré du superflu.",
    image: img("photo-1441984904996-e0b6ba687e04"),
    author: "L'équipe éditoriale",
    date: "2026-06-10",
    readingTime: "5 min",
    tag: "Style",
  },
];
