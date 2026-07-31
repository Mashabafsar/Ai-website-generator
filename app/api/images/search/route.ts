import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { searchImages, type ImageSearchProvider } from "@/lib/images/provider";

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await readJson<{
    query?: string;
    provider?: ImageSearchProvider;
    orientation?: "landscape" | "portrait" | "square";
    perPage?: number;
  }>(req);

  const query = body?.query?.trim();
  if (!query) return jsonError("Search query is required", 400);

  const provider = body?.provider ?? "all";
  const results = await searchImages(
    {
      keywords: query.split(/\s+/).filter(Boolean),
      orientation: body?.orientation ?? "landscape",
      perPage: body?.perPage ?? 18,
      altText: query,
    },
    provider
  );

  return jsonOk({ results, providers: { shutterstock: true, pexels: true, unsplash: true } });
}
