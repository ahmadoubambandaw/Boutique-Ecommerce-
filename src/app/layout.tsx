import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { resolveTenant } from "@/lib/tenant/registry";
import { buildBaseMetadata } from "@/lib/seo";
import { TenantThemeStyle } from "@/components/tenant-theme-style";
import { Analytics } from "@/components/analytics";
import { PwaRegister } from "@/components/pwa-register";
import type { TenantTheme } from "@/lib/tenant/types";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });

/** Map a tenant's chosen font to its CSS variable (Satoshi → Geist fallback). */
function activeFontVar(font: TenantTheme["fontFamily"]): string {
  switch (font) {
    case "inter":
      return "var(--font-inter)";
    case "playfair":
      return "var(--font-playfair)";
    default:
      return "var(--font-geist-sans)";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildBaseMetadata();
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await resolveTenant();

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} antialiased`}
        style={{ ["--font-active" as string]: activeFontVar(tenant.theme.fontFamily) }}
      >
        <TenantThemeStyle theme={tenant.theme} />
        <Providers>{children}</Providers>
        <Analytics integrations={tenant.integrations} />
        <PwaRegister />
      </body>
    </html>
  );
}
