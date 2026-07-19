"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { adminLoginAction, type AdminAuthState } from "@/lib/auth/admin-actions";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] text-sm font-semibold text-[hsl(var(--accent-foreground))] shadow-lg shadow-[hsl(214_60%_20%)]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
    >
      {pending ? "Connexion…" : "Se connecter"}
      {!pending && (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState<AdminAuthState, FormData>(
    adminLoginAction,
    {},
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Ambient brand gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[hsl(214_81%_30%)]/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 bottom-0 h-[360px] w-[360px] rounded-full bg-[hsl(358_79%_47%)]/15 blur-3xl"
          animate={{ x: [0, -24, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong w-full max-w-sm rounded-3xl border border-[hsl(var(--border))] p-8 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
            className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5"
          >
            <Image
              src="/gse-logo.jpg"
              alt="GSE"
              width={64}
              height={64}
              priority
              className="h-full w-full object-contain p-1.5"
            />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight">
            GSE<span className="text-[hsl(var(--muted-foreground))]">.admin</span>
          </h1>
          <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Espace de gestion réservé
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">E-mail</label>
            <Input name="email" type="email" required placeholder="vous@exemple.com" autoComplete="username" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Mot de passe</label>
            <Input name="password" type="password" required autoComplete="current-password" />
          </div>
          {state.error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-500"
            >
              {state.error}
            </motion.p>
          )}
          <SubmitButton />
        </form>
      </motion.div>
    </div>
  );
}
