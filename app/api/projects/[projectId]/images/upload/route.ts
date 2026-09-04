import { requireUser, jsonOk, jsonError } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import { RASTER_IMAGE_TYPES, saveProjectImage, sniffImageType } from "@/lib/images/storage";
import type { StockImageReference } from "@/lib/blueprint/types";

type Ctx = { params: Promise<{ projectId: string }> };

const MAX_BYTES = 2 * 1024 * 1024; // 2MB

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
  if (file.size > MAX_BYTES) {
    return jsonError("Image must be 2MB or smaller", 400);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  // The browser's declared MIME type is a hint; the bytes decide.
  const contentType = sniffImageType(bytes);
  if (!contentType || !RASTER_IMAGE_TYPES.includes(contentType as (typeof RASTER_IMAGE_TYPES)[number])) {
    return jsonError("Only JPEG, PNG, WebP, or GIF images are allowed", 400);
  }

  const stored = await saveProjectImage({ projectId, bytes, contentType });

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
