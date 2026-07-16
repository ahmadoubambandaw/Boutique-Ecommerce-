import { describe, it, expect } from "vitest";
import {
  cn,
  discountPercent,
  formatPrice,
  parseGid,
  truncate,
} from "@/lib/utils";

describe("formatPrice", () => {
  it("formats integers without decimals", () => {
    expect(formatPrice(289, "EUR", "fr-FR")).toMatch(/289/);
    expect(formatPrice(289, "EUR", "fr-FR")).not.toMatch(/,00/);
  });
  it("keeps decimals for non-round amounts", () => {
    expect(formatPrice(4.9, "EUR", "fr-FR")).toMatch(/4,90/);
  });
  it("accepts string amounts", () => {
    expect(formatPrice("19.99", "EUR", "fr-FR")).toMatch(/19,99/);
  });
});

describe("discountPercent", () => {
  it("computes the discount", () => {
    expect(discountPercent("100", "80")).toBe(20);
    expect(discountPercent("349", "289")).toBe(17);
  });
  it("returns null when there is no discount", () => {
    expect(discountPercent("80", "80")).toBeNull();
    expect(discountPercent("50", "80")).toBeNull();
    expect(discountPercent(null, "80")).toBeNull();
    expect(discountPercent("0", "80")).toBeNull();
  });
});

describe("parseGid", () => {
  it("extracts the numeric id", () => {
    expect(parseGid("gid://shopify/Product/123")).toBe("123");
  });
  it("returns the input when not a gid", () => {
    expect(parseGid("abc")).toBe("abc");
  });
});

describe("truncate", () => {
  it("leaves short strings intact", () => {
    expect(truncate("hello", 20)).toBe("hello");
  });
  it("truncates on a word boundary with an ellipsis", () => {
    const out = truncate("the quick brown fox jumps", 12);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(13);
  });
});

describe("cn", () => {
  it("merges and dedupes tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-medium")).toBe(
      "text-sm font-medium",
    );
  });
});
