import type { TenantTheme } from "@/lib/tenant/types";

const RADIUS_MAP: Record<TenantTheme["radius"], string> = {
  sharp: "0.25rem",
  soft: "1rem",
  round: "1.75rem",
};

/**
 * Injects per-tenant CSS variables so each merchant's storefront picks up its
 * own brand colours and radius — without a rebuild. Fonts and deeper theming
 * plug in the same way. Server-rendered so there is no flash.
 */
export function TenantThemeStyle({ theme }: { theme: TenantTheme }) {
  // Ring + radius apply in both modes; the brand accent is set for light only so
  // dark mode keeps its own lighter, higher-contrast accent from globals.css.
  const css =
    `:root{--ring:${theme.primary};--radius-brand:${RADIUS_MAP[theme.radius]};}` +
    `:root:not(.dark):not([data-theme="dark"]){--accent:${theme.accent};}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
