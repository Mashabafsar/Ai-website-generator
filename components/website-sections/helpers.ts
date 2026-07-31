import type { StockImageReference } from "@/lib/blueprint/types";

export type SectionProps = Record<string, unknown>;

export function s(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function a(v: unknown): string[] {
  return Array.isArray(v) ? (v.filter((x) => typeof x === "string") as string[]) : [];
}

export function image(props: SectionProps): StockImageReference | null {
  const img = props.image as StockImageReference | null | undefined;
  return img && typeof img.url === "string" ? img : null;
}

export function itemImages(props: SectionProps): (StockImageReference | null)[] {
  const list = props.itemImages;
  if (!Array.isArray(list)) return [];
  return list.map((img) => {
    if (!img || typeof img !== "object") return null;
    const ref = img as StockImageReference;
    return typeof ref.url === "string" ? ref : null;
  });
}
