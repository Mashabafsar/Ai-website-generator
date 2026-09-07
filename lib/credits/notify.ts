export const CREDITS_CHANGED_EVENT = "credits:changed";

/** Tell the topbar to re-read the server balance after a spend or refund. */
export function notifyCreditsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CREDITS_CHANGED_EVENT));
}