import { requireUser, jsonOk, jsonError } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import type { StockImageReference } from "@/lib/blueprint/types";
import { saveProjectImage, type StoredImageType } from "@/lib/images/storage";

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

  const buffer = Buffer.from(await file.arrayBuffer());
  let stored;
  try {
    stored = await saveProjectImage({
      projectId,
      bytes: buffer,
      contentType: file.type as StoredImageType,
    });
  } catch (err) {
    console.error("[images/upload] failed to store uploaded image:", err);
    return jsonError("Image upload failed. Please try again.", 502, "UPLOAD_FAILED");
  }

  const image: StockImageReference = {
    provider: "upload",
    providerImageId: stored.filename,
    url: stored.url,
    altText: altText.slice(0, 160),
    attributionRequired: false,
    licenseInfo: "User upload",
  };

  return jsonOk({ image });
}
