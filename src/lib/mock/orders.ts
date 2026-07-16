/** Demo order data — replaced by Shopify Customer Account API in production. */
export type OrderStatus = "processing" | "shipped" | "delivered" | "canceled";

export type Order = {
  id: string;
  number: string;
  date: string;
  status: OrderStatus;
  total: string;
  currencyCode: string;
  items: { title: string; quantity: number; image: string | null }[];
  tracking: { carrier: string; number: string; steps: { label: string; done: boolean }[] } | null;
};

export const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    number: "#1042",
    date: "2026-07-02",
    status: "shipped",
    total: "448",
    currencyCode: "EUR",
    items: [
      { title: "Manteau en laine structuré", quantity: 1, image: null },
      { title: "Pull en cachemire", quantity: 1, image: null },
    ],
    tracking: {
      carrier: "Colissimo",
      number: "6A12345678901",
      steps: [
        { label: "Commande confirmée", done: true },
        { label: "En préparation", done: true },
        { label: "Expédiée", done: true },
        { label: "En cours de livraison", done: false },
        { label: "Livrée", done: false },
      ],
    },
  },
  {
    id: "2",
    number: "#1021",
    date: "2026-06-18",
    status: "delivered",
    total: "159",
    currencyCode: "EUR",
    items: [{ title: "Sneakers minimalistes", quantity: 1, image: null }],
    tracking: {
      carrier: "Chronopost",
      number: "XY98765432100",
      steps: [
        { label: "Commande confirmée", done: true },
        { label: "En préparation", done: true },
        { label: "Expédiée", done: true },
        { label: "En cours de livraison", done: true },
        { label: "Livrée", done: true },
      ],
    },
  },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  processing: "En traitement",
  shipped: "Expédiée",
  delivered: "Livrée",
  canceled: "Annulée",
};
