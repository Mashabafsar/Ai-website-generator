import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { env } from "@/lib/env";
import { getOwnedProject } from "@/lib/projects/projects";
import { getStripe } from "@/lib/stripe/stripe";
import { buildPackageCheckout } from "@/lib/stripe/packages";
import { generateAndSaveQuote } from "@/lib/quote/quote";
import { PaymentType, PaymentStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await readJson<{ projectId: string }>(req);
  if (!body?.projectId) return jsonError("Missing projectId", 400);

  const project = await getOwnedProject(user.id, body.projectId);
  if (!project) return jsonError("Project not found", 404);
  if (!project.blueprint) return jsonError("Generate your website first", 409, "NOT_GENERATED");

  const stripe = getStripe();
  if (!stripe) {
    return jsonError("Payments are not configured on this environment.", 503, "STRIPE_NOT_CONFIGURED");
  }

  // Recompute the quote server-side so the charged amount is always authoritative.
  const quote = await generateAndSaveQuote(project.id);
  const { mode, lineItems } = buildPackageCheckout(quote);

  // {CHECKOUT_SESSION_ID} lets the delivery page confirm the payment on return,
  // even when the Stripe webhook can't reach the app (e.g. on localhost).
  const successUrl = `${env.appUrl}/app/project/${project.id}/deployment?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${env.appUrl}/app/project/${project.id}/quote?checkout=cancelled`;

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: {
      type: PaymentType.WEBSITE_PACKAGE,
      userId: user.id,
      projectId: project.id,
      packageType: quote.packageType,
    },
  });

  // Record a pending payment keyed by the checkout session for webhook reconciliation.
  await prisma.payment.create({
    data: {
      projectId: project.id,
      type: PaymentType.WEBSITE_PACKAGE,
      packageType: quote.packageType,
      status: PaymentStatus.PENDING,
      amount: quote.oneTimeTotal,
      currency: quote.currency,
      stripeSessionId: session.id,
    },
  });

  return jsonOk({ url: session.url });
}
