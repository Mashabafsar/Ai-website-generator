"use client";

import type { SiteContact } from "@/lib/blueprint/types";
import { SOCIAL_NETWORKS, type SocialNetworkKey } from "@/lib/contact/links";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  contact: SiteContact;
  onChange: (next: SiteContact) => void;
};

export function ContactLinksEditor({ contact, onChange }: Props) {
  function setField(key: "email" | "phone" | "address", value: string) {
    onChange({ ...contact, [key]: value });
  }

  function setSocial(key: SocialNetworkKey, value: string) {
    onChange({
      ...contact,
      social: { ...(contact.social ?? {}), [key]: value },
    });
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div>
        <div className="text-sm font-semibold">Contact &amp; social links</div>
        <p className="mt-1 text-xs text-muted-foreground">
          These power email buttons, phone links, and Instagram / LinkedIn icons on your site.
          Paste full profile URLs so visitors can open them.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="site-email">Email</Label>
          <Input
            id="site-email"
            type="email"
            placeholder="hello@business.com"
            value={contact.email ?? ""}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="site-phone">Phone</Label>
          <Input
            id="site-phone"
            placeholder="(555) 123-4567"
            value={contact.phone ?? ""}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="site-address">Location</Label>
          <Input
            id="site-address"
            placeholder="City, Country"
            value={contact.address ?? ""}
            onChange={(e) => setField("address", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3 border-t pt-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Social profiles
        </div>
        {SOCIAL_NETWORKS.map((network) => (
          <div key={network.key} className="space-y-1.5">
            <Label htmlFor={`social-${network.key}`}>{network.label}</Label>
            <Input
              id={`social-${network.key}`}
              type="url"
              inputMode="url"
              placeholder={network.placeholder}
              value={contact.social?.[network.key] ?? ""}
              onChange={(e) => setSocial(network.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
