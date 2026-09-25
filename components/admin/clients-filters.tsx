"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  clientListSearchParams,
  type ClientListQuery,
  type ClientSort,
  type ConsentFilter,
} from "@/lib/crm/admin-query";

export function ClientsFilters({ query }: { query: ClientListQuery }) {
  const router = useRouter();

  function apply(form: HTMLFormElement) {
    const data = new FormData(form);
    const next = clientListSearchParams(query, {
      q: String(data.get("q") ?? "").trim(),
      sort: (data.get("sort") as ClientSort) || "leadScore",
      order: data.get("order") === "asc" ? "asc" : "desc",
      consent: (data.get("consent") as ConsentFilter) || "all",
      page: 1,
    });
    const qs = next.toString();
    router.push(qs ? `/app/admin/clients?${qs}` : "/app/admin/clients");
  }

  return (
    <form
      className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
    >
      <label className="grid min-w-[220px] flex-1 gap-1 text-sm">
        <span className="text-muted-foreground">Search</span>
        <Input name="q" defaultValue={query.q} placeholder="Name or email" />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Sort</span>
        <select
          name="sort"
          defaultValue={query.sort}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="leadScore">Lead score</option>
          <option value="createdAt">Registered</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Order</span>
        <select
          name="order"
          defaultValue={query.order}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="desc">High to low</option>
          <option value="asc">Low to high</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Consent</span>
        <select
          name="consent"
          defaultValue={query.consent}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All</option>
          <option value="yes">Opted in</option>
          <option value="no">Not opted in</option>
        </select>
      </label>
      <Button type="submit" variant="outline">
        Apply
      </Button>
    </form>
  );
}
