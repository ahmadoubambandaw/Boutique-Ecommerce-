"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero({ tagline }: { tagline: string }) {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      {/* Ambient gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-700/20 to-blue-500/10 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-red-600/20 to-rose-500/10 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          <motion.span
            variants={item}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            EPI & sécurité incendie · Livraison à Dakar
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl"
          >
            La sécurité, <br />
            <span className="text-[hsl(var(--muted-foreground))]">
              sans compromis.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-balance text-lg text-[hsl(var(--muted-foreground))]"
          >
            {tagline} Équipements de protection individuelle et solutions de
            sécurité incendie certifiés, pour les professionnels et les
            entreprises.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="group inline-flex h-14 items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-8 text-base font-medium text-[hsl(var(--accent-foreground))] transition-all hover:gap-3"
            >
              Découvrir la boutique
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/collections"
              className="inline-flex h-14 items-center rounded-full border border-[hsl(var(--border))] px-8 text-base font-medium transition-colors hover:bg-[hsl(var(--muted))]"
            >
              Voir les collections
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
