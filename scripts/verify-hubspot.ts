/**
 * Checks that HubSpot is configured and the private-app token can read contacts.
 * Does not create properties. Never prints the API key.
 *
 * Run with `npm run hubspot:verify`.
 */

import { env } from "@/lib/env";
import { HubSpotError, hubspotRequest, isHubSpotConfigured, objectPath, redact } from "@/lib/crm/hubspot-client";

async function main() {
  if (!isHubSpotConfigured()) {
    console.error("HUBSPOT_API_KEY is unset. The CRM integration will no-op until it is set.");
    process.exit(1);
  }

  console.log(`Base URL: ${env.hubspot.baseUrl}`);
  console.log(`Objects version: ${env.hubspot.apiVersion}`);
  console.log(`Associations version: ${env.hubspot.associationsApiVersion}`);
  console.log("API key: [redacted]");

  try {
    await hubspotRequest(`${objectPath("contacts")}?limit=1`, { method: "GET" });
    console.log("Token can read contacts.");
  } catch (err) {
    const message = err instanceof HubSpotError ? err.message : String(err);
    console.error(`Could not read contacts: ${redact(message)}`);
    process.exit(1);
  }

  console.log("HubSpot is reachable. Needed scopes: contacts read/write, deals read/write, notes write.");
}

main().catch((err) => {
  console.error(redact(err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
