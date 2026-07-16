import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { resolveTenant } from "@/lib/tenant/registry";
import { buildBaseMetadata } from "@/lib/seo";
import { TenantThemeStyle } from "@/components/tenant-theme-style";
import { Analytics } from "@/components/analytics";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TenantThemeStyle theme={tenant.theme} />
        <Providers>{children}</Providers>
        <Analytics integrations={tenant.integrations} />
      </body>
    </html>
  );
}
