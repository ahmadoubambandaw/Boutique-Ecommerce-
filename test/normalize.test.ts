import { describe, it, expect } from "vitest";
import { flatten, normalizeProduct, normalizeCart } from "@/lib/shopify/normalize";

describe("flatten", () => {
  it("maps edges to nodes", () => {
    expect(flatten({ edges: [{ node: 1 }, { node: 2 }] })).toEqual([1, 2]);
  });
  it("handles null/empty", () => {
    expect(flatten(null)).toEqual([]);
    expect(flatten({ edges: [] })).toEqual([]);
  });
});

describe("normalizeProduct", () => {
  it("flattens images and variants", () => {
    const raw = {
      images: { edges: [{ node: { url: "a" } }, { node: { url: "b" } }] },
      variants: { edges: [{ node: { id: "v1" } }] },
    } as never;
    const p = normalizeProduct(raw)!;
    expect(p.images).toHaveLength(2);
    expect(p.variants).toHaveLength(1);
    expect(p.variants[0]!.id).toBe("v1");
  });
  it("returns null for missing input", () => {
    expect(normalizeProduct(null)).toBeNull();
  });
});

describe("normalizeCart", () => {
  it("flattens cart lines", () => {
    const raw = {
      id: "c1",
      lines: { edges: [{ node: { id: "l1" } }, { node: { id: "l2" } }] },
    } as never;
    const cart = normalizeCart(raw)!;
    expect(cart.id).toBe("c1");
    expect(cart.lines).toHaveLength(2);
  });
});
