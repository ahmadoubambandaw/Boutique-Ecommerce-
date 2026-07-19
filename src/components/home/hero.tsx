"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Layered 3D extrusion for the giant background word. */
const EXTRUDE = {
  textShadow: [
    "1px 1px 0 #cbd5e6",
    "2px 2px 0 #c0cbe0",
    "3px 3px 0 #b5c1d9",
    "4px 4px 0 #aab8d2",
    "5px 5px 0 #9fafcb",
    "6px 6px 0 #94a6c4",
    "8px 10px 22px rgba(10,46,93,0.25)",
  ].join(","),
};

export function Hero({ tagline }: { tagline: string }) {
  return (
    <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-gradient-to-b from-white via-[hsl(214_36%_97%)] to-[hsl(214_30%_92%)]">
      {/* Giant 3D background word */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <motion.span
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="select-none whitespace-nowrap text-[30vw] font-black leading-none tracking-tighter text-[hsl(214_38%_91%)] lg:text-[24vw]"
          style={EXTRUDE}
        >
          SÉCURITÉ
        </motion.span>
      </div>

      {/* Foreground content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-16 text-center sm:px-6"
      >
        <motion.span
          variants={item}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-red))]" />
          EPI &amp; sécurité incendie · Livraison à Dakar
        </motion.span>

        <motion.h1
          variants={item}
          className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-[hsl(214_60%_14%)] sm:text-6xl lg:text-7xl"
        >
          Votre sécurité,
          <br />
          <span className="text-[hsl(var(--brand-red))]">notre engagement.</span>
        </motion.h1>

        {/* Floating GSE medallion */}
        <motion.div variants={item} className="my-9">
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="rounded-[2rem] bg-white p-4 shadow-2xl ring-1 ring-black/5 sm:p-6">
              <Image
                src="/gse-logo.jpg"
                alt="GSE — Global Safety Équipement"
                width={224}
                height={224}
                priority
                className="h-32 w-32 object-contain sm:h-40 sm:w-40 lg:h-48 lg:w-48"
              />
            </div>
            <div className="mx-auto mt-4 h-3 w-2/3 rounded-[100%] bg-[hsl(214_50%_20%)]/20 blur-xl" />
          </motion.div>
        </motion.div>

        <motion.p
          variants={item}
          className="max-w-xl text-balance text-base text-[hsl(214_20%_35%)] sm:text-lg"
        >
          {tagline} Équipements de protection individuelle et solutions de
          sécurité incendie certifiés, pour les professionnels.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/products"
            className="group inline-flex h-14 items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-8 text-base font-medium text-[hsl(var(--accent-foreground))] shadow-lg shadow-[hsl(214_50%_20%)]/25 transition-all hover:gap-3"
          >
            Découvrir le catalogue
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/collections"
            className="inline-flex h-14 items-center rounded-full border border-[hsl(214_30%_80%)] bg-white/60 px-8 text-base font-medium text-[hsl(214_60%_14%)] backdrop-blur transition-colors hover:bg-white"
          >
            Voir les catégories
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
