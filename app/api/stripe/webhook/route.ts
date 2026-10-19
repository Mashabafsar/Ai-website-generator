import type Stripe from "stripe";
import { after, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/stripe";
import {
  fulfillCreditPackCheckout,
  fulfillWebsiteCheckout,
} from "@/lib/stripe/fulfillment";
import { scheduleCrmDrain } from "@/lib/crm/sync";
import { trySyncProjectToGitHub } from "@/lib/github/github";
import { publishManagedSiteIfDue } from "@/lib/deployment/deploy";

// Stripe requires the raw request body to verify the signature.
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    if (env.stripe.webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(payload, sig, env.stripe.webhookSecret);
    } else {
      // Dev fallback when no webhook secret is set — never used in production.
      if (process.env.NODE_ENV === "production") throw new Error("Missing webhook secret");
      event = JSON.parse(payload) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // `async_payment_succeeded` is the settlement event for delayed methods.
    // Their `completed` event arrives unpaid and is intentionally ignored by
    // the fulfillment guard, so without this the purchase would never land.
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const credit = await fulfillCreditPackCheckout(session);
  if (credit) {
    scheduleCrmDrain();
    return;
  }

  const website = await fulfillWebsiteCheckout(session);
  if (!website) return;

  await trySyncProjectToGitHub(website.projectId);
  // The HubSpot deal is already queued; this just pushes it promptly.
  scheduleCrmDrain();
  after(() =>
    publishManagedSiteIfDue(website.projectId).catch((err) => {
      console.error("[deploy] auto-publish after payment failed:", err);
    })
  );
}
