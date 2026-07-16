"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

type Msg = { from: "bot" | "user"; text: string };

const QUICK = [
  "Où en est ma commande ?",
  "Quels sont les délais de livraison ?",
  "Comment retourner un article ?",
];

/** Simple FAQ auto-responder for the demo. */
function reply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("command") || q.includes("suivi") || q.includes("livr"))
    return "Vous pouvez suivre votre commande sur la page « Suivi de commande » avec votre numéro et votre e-mail. Livraison en 2–4 jours ouvrés, offerte dès 50€.";
  if (q.includes("retour") || q.includes("rembours"))
    return "Retours gratuits sous 30 jours depuis votre espace client — une étiquette prépayée est générée automatiquement.";
  if (q.includes("taille") || q.includes("size"))
    return "Consultez le guide des tailles sur chaque fiche produit. Nos coupes sont conformes aux tailles standard.";
  if (q.includes("paiement") || q.includes("carte"))
    return "Paiement 100% sécurisé via Shopify : CB, Apple Pay, Google Pay, PayPal et Shop Pay.";
  return "Merci pour votre message ! Un conseiller vous répondra sous peu. En attendant, la FAQ répond aux questions les plus fréquentes.";
}

/**
 * Live chat widget. Self-contained demo assistant. To use a real provider,
 * set NEXT_PUBLIC_CRISP_WEBSITE_ID (or wire Intercom) and load its script
 * instead — this component then becomes the fallback.
 */
export function LiveChat() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Msg[]>([
    { from: "bot", text: "Bonjour 👋 Comment pouvons-nous vous aider ?" },
  ]);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: reply(text) }]);
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[85] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-xl transition-transform hover:scale-105"
        aria-label="Chat en direct"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
            className="glass-strong fixed bottom-24 right-6 z-[85] flex h-[28rem] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-[hsl(var(--border))] shadow-2xl"
          >
            <div className="border-b border-[hsl(var(--border))] p-4">
              <p className="font-semibold">Assistance</p>
              <p className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="h-2 w-2 rounded-full bg-green-500" /> En ligne · répond en quelques minutes
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.from === "user"
                        ? "max-w-[80%] rounded-2xl rounded-br-sm bg-[hsl(var(--accent))] px-3 py-2 text-sm text-[hsl(var(--accent-foreground))]"
                        : "max-w-[80%] rounded-2xl rounded-bl-sm bg-[hsl(var(--muted))] px-3 py-2 text-sm"
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {QUICK.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-xs hover:bg-[hsl(var(--muted))]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-[hsl(var(--border))] p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Votre message…"
                className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]"
              />
              <button
                type="submit"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                aria-label="Envoyer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
