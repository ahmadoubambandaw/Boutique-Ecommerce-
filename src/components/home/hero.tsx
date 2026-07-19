"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ tagline }: { tagline: string }) {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-b from-white via-[hsl(214_30%_96%)] to-[hsl(214_24%_90%)]">
      {/* Giant brand word behind the product */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <motion.span
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease }}
          className="select-none text-[34vw] font-black leading-none tracking-tighter text-[hsl(214_22%_84%)] lg:text-[22vw]"
          style={{
            textShadow:
              "2px 2px 0 #c3ccdb, 4px 4px 0 #b4bfd2, 6px 6px 0 #a6b3ca, 10px 14px 26px rgba(10,46,93,0.20)",
          }}
        >
          GSE
        </motion.span>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.25fr_1fr] lg:gap-4 lg:px-8">
        {/* Left — headline + primary CTA */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="text-center lg:text-left"
        >
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-red))]" />
            EPI &amp; sécurité incendie
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-[hsl(214_60%_14%)] sm:text-5xl lg:text-6xl">
            La sécurité,
            <br />
            <span className="text-[hsl(var(--brand-red))]">sans compromis.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xs text-sm text-[hsl(214_20%_38%)] lg:mx-0">
            {tagline}
          </p>
          <Link
            href="/products"
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-7 py-3.5 text-sm font-medium text-[hsl(var(--accent-foreground))] shadow-lg shadow-[hsl(214_50%_20%)]/25 transition-all hover:gap-3"
          >
            Découvrir le catalogue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Center — floating product */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.15 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <Image
              src="/hero-shoe.jpg"
              alt="Chaussures de sécurité S3"
              width={735}
              height={956}
              priority
              className="w-[68vw] max-w-[340px] mix-blend-multiply lg:max-w-[440px]"
            />
          </motion.div>
          <div className="-mt-2 h-4 w-2/3 rounded-[100%] bg-[hsl(214_50%_20%)]/25 blur-xl" />
        </motion.div>

        {/* Right — featured product */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
          className="text-center lg:text-right"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--brand-red))]">
            À la une
          </p>
          <p className="mt-2 text-xl font-semibold text-[hsl(214_60%_14%)]">
            Chaussures de sécurité S3
          </p>
          <p className="mt-1 text-sm text-[hsl(214_20%_38%)]">
            Norme EN ISO 20345 · embout &amp; semelle anti-perforation
          </p>
          <p className="mt-3 text-lg font-bold text-[hsl(214_60%_14%)]">
            à partir de 30 000 F CFA
          </p>
          <Link
            href="/products/chaussures-securite-s3"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--accent))] hover:underline"
          >
            Voir le produit
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
