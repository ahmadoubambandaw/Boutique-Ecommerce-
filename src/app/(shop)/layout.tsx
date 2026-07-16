import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CompareBar } from "@/components/product/compare-bar";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Toaster } from "@/components/ui/toaster";
import { LiveChat } from "@/components/chat/live-chat";
import { resolveTenant } from "@/lib/tenant/registry";

/** Storefront shell — the customer-facing chrome (header, footer, cart, …). */
export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await resolveTenant();

  return (
    <>
      <AnnouncementBar banners={tenant.banners} />
      <Header storeName={tenant.branding.storeName} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer storeName={tenant.branding.storeName} />
      <CartDrawer />
      <CompareBar />
      <Toaster />
      <LiveChat />
    </>
  );
}
