"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/store/cart";

/** Empties the client cart once an order has been confirmed. */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
