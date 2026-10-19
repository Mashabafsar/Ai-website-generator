"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "@/components/settings/account-tab";
import { BillingTab } from "@/components/settings/billing-tab";
import { BusinessDetailsTab } from "@/components/settings/business-details-tab";
import {
  OPEN_ACCOUNT_SETTINGS,
  isSettingsTab,
  type BusinessDetailsSeed,
  type SettingsTab,
} from "@/components/settings/types";

export function SettingsPageClient({
  initialTab,
  user,
  canUpdatePaymentMethod,
  generateCost,
  creditBalance,
  business,
}: {
  initialTab: SettingsTab;
  user: { name: string; email: string };
  canUpdatePaymentMethod: boolean;
  generateCost: number;
  creditBalance: number;
  business: BusinessDetailsSeed;
}) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    function openAccount() {
      setTab("account");
    }
    window.addEventListener(OPEN_ACCOUNT_SETTINGS, openAccount);
    return () => window.removeEventListener(OPEN_ACCOUNT_SETTINGS, openAccount);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account, billing, and business details.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (isSettingsTab(value)) setTab(value);
        }}
        className="w-full"
      >
        <TabsList className="h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="business">Business details</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <AccountTab user={user} />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingTab canUpdatePaymentMethod={canUpdatePaymentMethod} />
        </TabsContent>

        <TabsContent value="business" className="mt-6">
          <BusinessDetailsTab
            business={business}
            generateCost={generateCost}
            creditBalance={creditBalance}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
