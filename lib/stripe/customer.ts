import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/stripe";

export type StripeCustomerUser = {
  id: string;
  email: string;
  name?: string | null;
  stripeCustomerId?: string | null;
};

/**
 * Ensure the platform user has a Stripe Customer and return its id.
 * Creates the customer when missing and persists `User.stripeCustomerId`.
 */
export async function ensureStripeCustomer(user: StripeCustomerUser): Promise<string> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  const existingId =
    user.stripeCustomerId ??
    (
      await prisma.user.findUnique({
        where: { id: user.id },
        select: { stripeCustomerId: true },
      })
    )?.stripeCustomerId;

  if (existingId) {
    try {
      const customer = await stripe.customers.retrieve(existingId);
      if (!("deleted" in customer && customer.deleted)) {
        return existingId;
      }
    } catch (err) {
      console.error(
        "[stripe] stored customer missing, recreating:",
        err instanceof Error ? err.message : err
      );
    }
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name?.trim() || undefined,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
