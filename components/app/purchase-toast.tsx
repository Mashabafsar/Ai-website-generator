"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/** Shows a toast after returning from Stripe checkout, then cleans the URL. */
export function PurchaseToast() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = params.get("purchase");
    if (!status) return;
    if (status === "success") {
      toast.success("Payment received — credits will appear shortly.");
    } else if (status === "cancelled") {
      toast.info("Checkout cancelled.");
    }
    router.replace("/app/credits");
  }, [params, router]);

  return null;
}
