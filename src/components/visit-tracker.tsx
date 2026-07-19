"use client";

import * as React from "react";

/**
 * Counts one visit per browser session (deduped via sessionStorage) by pinging
 * the /api/track beacon. Renders nothing.
 */
export function VisitTracker() {
  React.useEffect(() => {
    try {
      if (sessionStorage.getItem("gse_visit")) return;
      sessionStorage.setItem("gse_visit", "1");
    } catch {
      /* private mode — still ping once */
    }
    fetch("/api/track", { method: "POST", keepalive: true }).catch(() => {});
  }, []);

  return null;
}
