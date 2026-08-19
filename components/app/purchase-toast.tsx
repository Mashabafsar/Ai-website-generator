"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Shows a toast after returning from Stripe checkout, then cleans the URL.
 * The success message is driven by the server-reconciled payment result, so a
 * "credits added" confirmation only appears once Stripe has confirmed payment —
 * never merely because the browser landed on the success URL.
 */
export function PurchaseToast({
  purchase,
  confirmed,
  credited,
}: {
  purchase?: string;
  confirmed?: boolean;
  credited?: number;
}) {
  const router = useRouter();
  const shown = useRef(false);

  useEffect(() => {
    if (!purchase || shown.current) return;
    shown.current = true;

    if (purchase === "cancelled") {
      toast.info("Checkout cancelled — no charge was made.");
    } else if (purchase === "success") {
      if (confirmed) {
        toast.success(
          credited && credited > 0
            ? `Payment confirmed — ${credited} credits added.`
            : "Payment confirmed — your credits are available."
        );
      } else {
        // Paid at Stripe but not yet confirmed to us: don't imply credits landed.
        toast.info("Payment is processing. Your credits will appear once it's confirmed.");
      }
    }

    router.replace("/app/credits");
  }, [purchase, confirmed, credited, router]);

  return null;
}
