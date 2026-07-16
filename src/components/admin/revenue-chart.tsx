"use client";

import * as React from "react";
import { motion } from "framer-motion";

/** Minimal, dependency-free area chart for the revenue trend. */
export function RevenueChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const width = 640;
  const height = 220;
  const pad = 24;

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((d.value - min) / range) * (height - pad * 2);
    return { x, y };
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${points[points.length - 1]!.x},${height - pad} L${points[0]!.x},${height - pad} Z`;

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] p-5">
      <h3 className="mb-4 font-semibold">Chiffre d'affaires · 12 semaines</h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Évolution du chiffre d'affaires"
      >
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#rev-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="hsl(var(--accent))" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
        {data.filter((_, i) => i % 3 === 0).map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
