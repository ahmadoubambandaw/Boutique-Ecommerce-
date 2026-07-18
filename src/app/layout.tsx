import type { Metadata, Viewport } from "next";
import { Geist_Mono, Open_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { resolveTenant } from "@/lib/tenant/registry";
import { buildBaseMetadata } from "@/lib/seo";
import { TenantThemeStyle } from "@/components/tenant-theme-style";
import { Analytics } from "@/components/analytics";
import { PwaRegister } from "@/components/pwa-register";

const openSans = Open_Sans({ variable: "--font-opensans", subsets: ["latin"] });
const poppins = Poppins({
  variable: "--font-heading",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});
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
      <body
        className={`${openSans.variable} ${poppins.variable} ${geistMono.variable} antialiased`}
        style={{ ["--font-active" as string]: "var(--font-opensans)" }}
      >
        <TenantThemeStyle theme={tenant.theme} />
        <Providers>{children}</Providers>
        <Analytics integrations={tenant.integrations} />
        <PwaRegister />
      </body>
    </html>
  );
}
