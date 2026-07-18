"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/store/toast";
import { pendingOrdersCountAction } from "@/lib/actions/admin-commerce";

/**
 * In-app order notifications: while the admin is open, poll the pending-orders
 * count. When it increases, show a toast, play a short chime and refresh the
 * route so the "Commandes" badge updates — no email required.
 */
export function OrdersWatcher({ initialCount }: { initialCount: number }) {
  const router = useRouter();
  const prev = React.useRef(initialCount);

  React.useEffect(() => {
    let active = true;

    function chime() {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch {
        /* audio not available — ignore */
      }
    }

    async function poll() {
      try {
        const count = await pendingOrdersCountAction();
        if (!active) return;
        if (count > prev.current) {
          const diff = count - prev.current;
          toast.success(
            diff > 1
              ? `${diff} nouvelles commandes reçues !`
              : "Nouvelle commande reçue !",
            "/admin/orders",
          );
          chime();
          router.refresh();
        }
        prev.current = count;
      } catch {
        /* network hiccup — retry next tick */
      }
    }

    const id = setInterval(poll, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [router]);

  return null;
}
