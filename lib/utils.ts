import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    // Runs are collapsed above, so at most one dash can sit on each end.
    .replace(/^-/, "")
    .replace(/-$/, "")
    .slice(0, 48)
    || "site";
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Small stable id generator for section ids etc. (not cryptographic). */
export function shortId(prefix = "id"): string {
  const [rand] = crypto.getRandomValues(new Uint32Array(1));
  return `${prefix}_${rand.toString(36).slice(0, 6)}${Date.now().toString(36).slice(-4)}`;
}
