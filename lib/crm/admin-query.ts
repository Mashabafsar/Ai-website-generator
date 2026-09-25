// Client-safe list query helpers. Keep Prisma out of this file so the admin
// filter form can import it from a client component.

export const CLIENT_SORTS = ["leadScore", "createdAt", "name", "email"] as const;
export type ClientSort = (typeof CLIENT_SORTS)[number];

export const CONSENT_FILTERS = ["all", "yes", "no"] as const;
export type ConsentFilter = (typeof CONSENT_FILTERS)[number];

export type ClientListQuery = {
  q: string;
  sort: ClientSort;
  order: "asc" | "desc";
  consent: ConsentFilter;
  page: number;
  pageSize: number;
};

function isClientSort(value: string | null): value is ClientSort {
  return CLIENT_SORTS.includes(value as ClientSort);
}

function isConsentFilter(value: string | null): value is ConsentFilter {
  return CONSENT_FILTERS.includes(value as ConsentFilter);
}

export function parseClientListQuery(params: URLSearchParams): ClientListQuery {
  const sortRaw = params.get("sort");
  const orderRaw = params.get("order");
  const consentRaw = params.get("consent");
  const page = Math.max(1, Number(params.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize")) || 25));

  return {
    q: (params.get("q") ?? "").trim(),
    sort: isClientSort(sortRaw) ? sortRaw : "leadScore",
    order: orderRaw === "asc" ? "asc" : "desc",
    consent: isConsentFilter(consentRaw) ? consentRaw : "all",
    page,
    pageSize,
  };
}

export function clientListSearchParams(
  query: ClientListQuery,
  overrides: Partial<ClientListQuery> = {}
) {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.sort !== "leadScore") params.set("sort", next.sort);
  if (next.order !== "desc") params.set("order", next.order);
  if (next.consent !== "all") params.set("consent", next.consent);
  if (next.page > 1) params.set("page", String(next.page));
  if (next.pageSize !== 25) params.set("pageSize", String(next.pageSize));
  return params;
}
