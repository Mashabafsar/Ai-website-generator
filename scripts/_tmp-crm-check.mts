import { prisma as p } from "../lib/prisma";
const users = await p.user.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id:true, email:true, createdAt:true } });
for (const u of users) {
  const prof = await p.crmProfile.findUnique({ where: { userId: u.id }, select: { hubspotContactId:true, leadScore:true } });
  const jobs = await p.crmOutbox.count({ where: { userId: u.id } });
  const events = await p.crmScoreEvent.findMany({ where: { userId: u.id }, select: { action:true, hubspotNoteId:true, createdAt:true } });
  console.log(u.createdAt.toISOString(), u.email.replace(/^(.{3}).*@/, "$1***@"), "contact:", prof?.hubspotContactId ?? "-", "jobs:", jobs, "events:", events.map(e => `${e.action}${e.hubspotNoteId ? "(note)" : "(no note)"}@${e.createdAt.toISOString().slice(11,19)}`).join(","));
}
await p.$disconnect();

