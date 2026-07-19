"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, ShieldCheck } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  "Embout de protection acier",
  "Semelle anti-perforation",
  "Semelle antidérapante",
];

export function Hero({ tagline }: { tagline: string }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto grid min-h-[88vh] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1fr_1.15fr_1fr] lg:gap-6 lg:px-8">
        {/* ── Left : headline + CTA ── */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.05 }}
          className="order-1 text-center md:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(214_30%_88%)] bg-[hsl(214_40%_97%)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(214_60%_24%)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--brand-red))]" />
            Protection professionnelle
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-[hsl(214_60%_14%)] sm:text-5xl lg:text-6xl">
            La sécurité,
            <br />
            <span className="text-[hsl(var(--brand-red))]">sans compromis.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-balance text-[hsl(214_18%_40%)] md:mx-0">
            {tagline} Équipements de protection individuelle et sécurité incendie
            certifiés, livrés à Dakar.
          </p>
          <Link
            href="/products"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-7 py-4 text-sm font-semibold text-[hsl(var(--accent-foreground))] shadow-xl shadow-[hsl(214_60%_20%)]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[hsl(214_60%_20%)]/35"
          >
            Découvrir le catalogue
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* ── Center : floating product ── */}
        <div className="relative order-2 flex items-center justify-center py-6 [perspective:1200px]">
          {/* Giant faint "G" for depth */}
          <span
            aria-hidden
            className="pointer-events-none absolute select-none text-[46vw] font-black leading-none tracking-tighter text-[hsl(214_60%_20%)] opacity-[0.05] md:text-[34vw] lg:text-[26vw]"
          >
            G
          </span>

          <motion.div
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.1 }}
            className="relative"
          >
            {/* float loop */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* 3D tilt on hover */}
              <motion.div
                whileHover={{ rotateY: 12, rotateX: -6, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                style={{ transformPerspective: 1000 }}
              >
                <Image
                  src="/hero-shoe.png"
                  alt="Chaussures de sécurité S3 — GSE"
                  width={681}
                  height={936}
                  priority
                  className="w-[74vw] max-w-[330px] drop-shadow-2xl lg:max-w-[420px]"
                />
              </motion.div>
            </motion.div>

            {/* reflection */}
            <div
              aria-hidden
              className="pointer-events-none mx-auto -mt-2 w-[74vw] max-w-[330px] scale-y-[-1] opacity-20 lg:max-w-[420px] [mask-image:linear-gradient(to_bottom,black,transparent_55%)]"
            >
              <Image
                src="/hero-shoe.png"
                alt=""
                width={681}
                height={936}
                className="w-full"
              />
            </div>

            {/* ground shadow */}
            <div className="mx-auto -mt-6 h-5 w-2/3 rounded-[100%] bg-[hsl(214_60%_20%)]/25 blur-2xl" />
          </motion.div>
        </div>

        {/* ── Right : product details ── */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.15 }}
          className="order-3 text-center md:col-span-2 md:text-left lg:col-span-1"
        >
          <div className="mx-auto max-w-sm md:mx-0">
            <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--brand-red))]">
              À la une
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[hsl(214_60%_14%)]">
              Chaussures de sécurité S3
            </h2>
            <p className="mt-1 text-sm font-medium text-[hsl(214_18%_45%)]">
              Norme EN ISO 20345
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[hsl(214_20%_35%)]">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center justify-center gap-2 md:justify-start">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(214_40%_95%)] text-[hsl(var(--accent))]">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs uppercase tracking-wider text-[hsl(214_18%_45%)]">
              À partir de
            </p>
            <p className="text-2xl font-bold text-[hsl(214_60%_14%)]">
              30 000 FCFA
            </p>
            <Link
              href="/products/chaussures-securite-s3"
              className="group mt-5 inline-flex items-center gap-2 rounded-full border border-[hsl(214_30%_80%)] px-6 py-3 text-sm font-semibold text-[hsl(214_60%_14%)] transition-colors hover:border-[hsl(var(--accent))] hover:bg-[hsl(214_40%_97%)]"
            >
              Voir le produit
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
