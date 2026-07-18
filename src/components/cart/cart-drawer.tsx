"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { Price } from "@/components/ui/price";
import { Button } from "@/components/ui/button";
import { FREE_DELIVERY_ABOVE } from "@/lib/commerce/shipping";

export function CartDrawer() {
  const router = useRouter();
  const { lines, isOpen, setOpen, updateQuantity, remove } = useCart();

  const subtotal = lines.reduce(
    (n, l) => n + parseFloat(l.price) * l.quantity,
    0,
  );
  const currency = lines[0]?.currencyCode ?? "XOF";
  const remaining = Math.max(0, FREE_DELIVERY_ABOVE - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_ABOVE) * 100);

  function checkout() {
    setOpen(false);
    router.push("/checkout");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="glass-strong absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[hsl(var(--border))]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ShoppingBag className="h-5 w-5" />
                Panier
                <span className="text-[hsl(var(--muted-foreground))]">
                  ({lines.reduce((n, l) => n + l.quantity, 0)})
                </span>
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                aria-label="Fermer le panier"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <ShoppingBag className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
                <p className="text-[hsl(var(--muted-foreground))]">
                  Votre panier est vide.
                </p>
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))] transition-opacity hover:opacity-90"
                >
                  Découvrir la collection
                </Link>
              </div>
            ) : (
              <>
                {/* Free shipping progress */}
                <div className="border-b border-[hsl(var(--border))] px-5 py-4">
                  <p className="mb-2 text-sm">
                    {remaining > 0 ? (
                      <>
                        Plus que{" "}
                        <strong>{formatPrice(remaining, currency)}</strong> pour
                        la livraison offerte 🚚
                      </>
                    ) : (
                      <strong>Livraison offerte débloquée 🎉</strong>
                    )}
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <motion.div
                      className="h-full rounded-full bg-[hsl(var(--accent))]"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
                    />
                  </div>
                </div>

                <ul className="flex-1 space-y-4 overflow-y-auto p-5">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.variantId}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-4"
                      >
                        <Link
                          href={`/products/${line.handle}`}
                          onClick={() => setOpen(false)}
                          className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--muted))]"
                        >
                          {line.image && (
                            <Image
                              src={line.image}
                              alt={line.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          )}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <p className="truncate font-medium">{line.title}</p>
                            <button
                              onClick={() => remove(line.variantId)}
                              className="text-[hsl(var(--muted-foreground))] hover:text-red-500"
                              aria-label="Retirer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {line.variantTitle}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-full border border-[hsl(var(--border))]">
                              <button
                                onClick={() =>
                                  updateQuantity(line.variantId, line.quantity - 1)
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                                aria-label="Diminuer"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm tabular-nums">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(line.variantId, line.quantity + 1)
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                                aria-label="Augmenter"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <Price
                              amount={parseFloat(line.price) * line.quantity}
                              baseCurrency={line.currencyCode}
                              className="font-medium tabular-nums"
                            />
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="border-t border-[hsl(var(--border))] p-5">
                  <div className="mb-1 flex justify-between text-sm text-[hsl(var(--muted-foreground))]">
                    <span>Sous-total</span>
                    <Price amount={subtotal} baseCurrency={currency} className="tabular-nums" />
                  </div>
                  <p className="mb-4 text-xs text-[hsl(var(--muted-foreground))]">
                    Livraison calculée à la commande — paiement à la livraison ou
                    par mobile money.
                  </p>
                  <Button className="w-full" size="lg" onClick={checkout}>
                    Passer au paiement
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
