import { Prisma, PrismaClient } from "@prisma/client";
import { isStalePreparedStatement, poolerSafeUrl } from "./prisma-url";

export { poolerSafeUrl };

const RETRYABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);
const RETRYABLE_MESSAGE =
  /(connectionreset|econnreset|forcibly closed by the remote host|server closed the connection unexpectedly|error in postgresql connection|can't reach database server|timeout|timed out)/i;

function isTransientDbError(error: unknown): boolean {
  if (isStalePreparedStatement(error)) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_CODES.has(error.code);
  }
  if (error instanceof Error) {
    return RETRYABLE_MESSAGE.test(error.message);
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createPrismaClient() {
  const datasourceUrl = poolerSafeUrl(process.env.DATABASE_URL);

  const base = new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const retries = process.env.NODE_ENV === "development" ? 2 : 1;
          for (let attempt = 0; ; attempt += 1) {
            try {
              return await query(args);
            } catch (error) {
              if (attempt >= retries || !isTransientDbError(error)) throw error;
              const delayMs = 120 * (attempt + 1);
              console.warn(
                `[prisma] transient DB error on ${String(model)}.${operation}; retrying in ${delayMs}ms`
              );
              await sleep(delayMs);
            }
          }
        },
      },
    },
  });
}

type PrismaSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaSingleton | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
