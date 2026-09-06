import { formatPrice } from "@/lib/utils";

/**
 * Renders a price in the currency it is stored in.
 *
 * This store sells in XOF only. A currency picker used to sit here, offering
 * EUR/USD/GBP with static conversion rates — meaningless for a Senegalese shop
 * and a mispricing risk, so prices are now shown exactly as recorded.
 */
export function Price({
  amount,
  baseCurrency = "XOF",
  className,
}: {
  amount: string | number;
  baseCurrency?: string;
  className?: string;
}) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return <span className={className}>{formatPrice(value, baseCurrency)}</span>;
}
