"use client";

import { useEffect } from "react";
import { captureError } from "@/lib/monitoring";

/** Last-resort boundary for errors thrown in the root layout itself. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { digest: error.digest, boundary: "global-error" });
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          Une erreur est survenue
        </h1>
        <p style={{ color: "#666", maxWidth: "28rem" }}>
          Désolé, une erreur inattendue s'est produite.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "9999px",
            background: "#0a0a0c",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
