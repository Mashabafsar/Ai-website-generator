import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { requireUser, jsonOk, jsonError } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import type { StockImageReference } from "@/lib/blueprint/types";

type Ctx = { params: Promise<{ projectId: string }> };

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("Project not found", 404);

  const form = await req.formData();
  const file = form.get("file");
  const altText = String(form.get("altText") || "Uploaded image");

  if (!(file instanceof File)) return jsonError("Missing image file", 400);
  if (!ALLOWED.has(file.type)) {
    return jsonError("Only JPEG, PNG, WebP, or GIF images are allowed", 400);
  }
  if (file.size > MAX_BYTES) {
    return jsonError("Image must be 2MB or smaller", 400);
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";

  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", projectId);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  const image: StockImageReference = {
    provider: "upload",
    providerImageId: filename,
    url: `/uploads/${projectId}/${filename}`,
    altText: altText.slice(0, 160),
    attributionRequired: false,
    licenseInfo: "User upload",
  };

  return jsonOk({ image });
}
