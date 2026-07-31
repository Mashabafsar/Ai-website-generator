import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/stripe";
import { grantPurchase } from "@/lib/credits/credits";
import { prisma } from "@/lib/prisma";
import { PaymentType, PaymentStatus, ProjectStatus } from "@/lib/constants";

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
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const type = session.metadata?.type;
  const userId = session.metadata?.userId ?? session.client_reference_id ?? undefined;

  if (type === PaymentType.CREDIT_PACK) {
    const credits = Number(session.metadata?.credits ?? 0);
    if (userId && credits > 0) {
      await grantPurchase({ userId, credits, stripePaymentId: session.id });
    }
    return;
  }

  if (type === PaymentType.WEBSITE_PACKAGE) {
    const projectId = session.metadata?.projectId;
    if (!projectId) return;

    await prisma.payment.updateMany({
      where: { stripeSessionId: session.id },
      data: {
        status: PaymentStatus.PAID,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        stripeSubscriptionId:
          typeof session.subscription === "string" ? session.subscription : undefined,
      },
    });

    // Unlock delivery. Don't downgrade an already-live/exported project.
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project && ![ProjectStatus.LIVE, ProjectStatus.EXPORTED, ProjectStatus.DEPLOYING].includes(project.status as never)) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.PAID },
      });
    }
  }
}
