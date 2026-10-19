import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await readJson<{ name?: string }>(req);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return jsonError("Enter a name.", 400, "NAME_REQUIRED");
  if (name.length > 120) return jsonError("Name is too long.", 400, "NAME_TOO_LONG");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name },
    select: { id: true, name: true, email: true },
  });

  return jsonOk({ user: updated });
}
