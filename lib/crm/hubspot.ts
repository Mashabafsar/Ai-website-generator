import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { parseQuestionnaireAnswers } from "@/lib/questionnaire/schema";
import { publicSiteUrl } from "@/lib/deployment/url";

const HUBSPOT_API = "https://api.hubapi.com";

export type HubSpotCustomer = {
  email: string;
  name: string;
  company: string;
  phone?: string;
  website?: string;
  packageType?: string;
  projectId: string;
};

/**
 * Best-effort HubSpot contact upsert for a paying platform customer.
 * Missing token or API errors are logged and never thrown to the caller.
 */
export async function syncPaidCustomerToHubSpot(projectId: string): Promise<void> {
  try {
    const customer = await loadCustomer(projectId);
    if (!customer) return;
    await upsertHubSpotContact(customer);
  } catch (err) {
    console.error("HubSpot sync failed:", err);
  }
}

async function loadCustomer(projectId: string): Promise<HubSpotCustomer | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      user: { select: { email: true, name: true } },
      questionnaire: true,
      quote: { select: { packageType: true } },
      deployment: { select: { liveUrl: true, subdomain: true } },
    },
  });
  if (!project?.user?.email) return null;

  let phone: string | undefined;
  let packageType = project.quote?.packageType;
  if (project.questionnaire) {
    try {
      const answers = parseQuestionnaireAnswers(project.questionnaire.answers);
      phone = answers.contactPhone?.trim() || undefined;
      packageType = packageType || answers.packageType;
    } catch {
      // Stored answers are optional context for the CRM row.
    }
  }

  const website =
    publicSiteUrl(project.deployment) ||
    `${env.appUrl.replace(/\/$/, "")}/app/project/${projectId}/preview`;

  return {
    email: project.user.email,
    name: project.user.name?.trim() || project.businessName,
    company: project.businessName,
    phone,
    website,
    packageType,
    projectId,
  };
}

async function upsertHubSpotContact(customer: HubSpotCustomer): Promise<void> {
  if (!env.hubspot.enabled) {
    console.info("HubSpot not configured — skipping customer sync.");
    return;
  }

  const firstname = customer.name.split(/\s+/)[0] || customer.name;
  const properties: Record<string, string> = {
    email: customer.email,
    firstname,
    company: customer.company,
    website: customer.website ?? "",
  };
  if (customer.phone) properties.phone = customer.phone;

  const existingId = await findContactIdByEmail(customer.email);
  const contactId = existingId
    ? await patchContact(existingId, properties)
    : await createContact(properties);

  if (contactId) {
    await addContactNote(
      contactId,
      `Website package paid. Project ${customer.projectId}${
        customer.packageType ? ` · ${customer.packageType}` : ""
      }.`
    );
  }
}

async function hubspot<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.hubspot.accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HubSpot ${res.status} ${path}: ${body.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function findContactIdByEmail(email: string): Promise<string | null> {
  const data = await hubspot<{ results?: { id: string }[] }>("/crm/v3/objects/contacts/search", {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [{ propertyName: "email", operator: "EQ", value: email }],
        },
      ],
      limit: 1,
    }),
  });
  return data.results?.[0]?.id ?? null;
}

async function createContact(properties: Record<string, string>): Promise<string | null> {
  const data = await hubspot<{ id?: string }>("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
  return data.id ?? null;
}

async function patchContact(
  id: string,
  properties: Record<string, string>
): Promise<string> {
  await hubspot(`/crm/v3/objects/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
  return id;
}

async function addContactNote(contactId: string, body: string): Promise<void> {
  try {
    const note = await hubspot<{ id?: string }>("/crm/v3/objects/notes", {
      method: "POST",
      body: JSON.stringify({
        properties: {
          hs_note_body: body,
          hs_timestamp: new Date().toISOString(),
        },
        associations: [
          {
            to: { id: contactId },
            types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
          },
        ],
      }),
    });
    if (!note.id) return;
  } catch (err) {
    console.error("HubSpot note failed:", err);
  }
}
