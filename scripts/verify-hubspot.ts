/**
 * Checks that HubSpot is configured and the private-app token can read contacts
 * and leads. Does not create properties. Never prints the API key.
 *
 * Run with `npm run hubspot:verify`.
 */

import { env } from "@/lib/env";
import {
  HubSpotError,
  hubspotRequest,
  isHubSpotConfigured,
  objectPath,
  pipelinesPath,
  redact,
} from "@/lib/crm/hubspot-client";
import { resolveLeadNewPlacement } from "@/lib/crm/hubspot";

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

  try {
    await hubspotRequest(`${objectPath("leads")}?limit=1`, { method: "GET" });
    console.log("Token can read leads.");
  } catch (err) {
    const message = err instanceof HubSpotError ? err.message : String(err);
    console.error(`Could not read leads: ${redact(message)}`);
    console.error(
      "Grant crm.objects.leads.read and crm.objects.leads.write on the private app,"
    );
    console.error("then re-run. Contacts alone are not enough — signups must land on Leads.");
    process.exit(1);
  }

  try {
    await hubspotRequest(pipelinesPath("leads"), { method: "GET" });
    const placement = await resolveLeadNewPlacement();
    console.log(`Lead pipeline: ${placement.pipelineId}`);
    console.log(`Lead New stage: ${placement.newStageId}`);
  } catch (err) {
    const message = err instanceof HubSpotError ? err.message : String(err);
    console.error(`Could not resolve the lead pipeline: ${redact(message)}`);
    process.exit(1);
  }

  if (env.hubspot.leadOwnerId) {
    console.log(`Lead owner id: ${env.hubspot.leadOwnerId}`);
  } else {
    console.log(
      "HUBSPOT_LEAD_OWNER_ID is unset. Leads are still created, but they stay"
    );
    console.log(
      'unassigned — open Sales → Leads → "All leads", or set an owner id so'
    );
    console.log('they appear under "My leads".');
  }

  console.log(
    "HubSpot is reachable. Needed scopes: contacts, leads, deals, and notes read/write."
  );
}

main().catch((err) => {
  console.error(redact(err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
