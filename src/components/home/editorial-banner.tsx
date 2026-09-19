"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const SLIDE_DURATION = 5000;

export function EditorialBanner({ images }: { images: string[] }) {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % images.length),
      SLIDE_DURATION,
    );
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[hsl(var(--accent))] px-8 py-20 text-center text-[hsl(var(--accent-foreground))] sm:py-28">
      {images.length > 0 && (
        <div className="absolute inset-0">
          <AnimatePresence>
            <motion.div
              key={images[active]}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <Image
                src={images[active]!}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                priority={active === 0}
              />
            </motion.div>
          </AnimatePresence>
          {/* Darken the photo so the text stays legible over any image. */}
          <div className="absolute inset-0 bg-[hsl(var(--accent))]/70" />
        </div>
      )}

      <div className="relative">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Protéger. Prévenir.
          <br />
          Sécuriser.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-balance opacity-80">
          Des équipements certifiés, conformes aux normes, et un
          accompagnement expert pour la sécurité de vos équipes et de vos
          locaux.
        </p>
      </div>

      {images.length > 1 && (
        <div className="relative mt-8 flex justify-center gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setActive(i)}
              aria-label={`Aller à l'image ${i + 1}`}
              className={
                i === active
                  ? "h-2 w-6 rounded-full bg-white transition-all"
                  : "h-2 w-2 rounded-full bg-white/40 transition-all hover:bg-white/70"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
