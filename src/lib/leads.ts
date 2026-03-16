import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ZodError, z } from "zod";
import { content, locales, type Locale, t } from "./content";

export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "awaiting_confirmation",
  "confirmed",
  "redirected_to_booksy",
  "cancelled",
  "no_response",
]);

export const preferredContactChannelSchema = z.enum(["whatsapp", "telegram", "email"]);

export const leadStatuses = [...leadStatusSchema.options];

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format.");
const hhmmTimeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format.");

const leadSubmissionSchema = z
  .object({
    serviceId: z.string().trim().min(1).optional(),
    serviceName: z.string().trim().min(1).max(160).optional(),
    customerName: z.string().trim().min(2).max(120),
    email: z.email().max(160),
    phone: z.string().trim().min(6).max(40),
    preferredDate: isoDateSchema,
    preferredTime: hhmmTimeSchema,
    notes: z.string().trim().max(1200).optional().default(""),
    preferredContactChannel: preferredContactChannelSchema,
    locale: z.enum(locales),
    processingConsent: z.literal(true),
    contactConsent: z.literal(true),
  })
  .superRefine((value, ctx) => {
    if (!value.serviceId && !value.serviceName) {
      ctx.addIssue({
        code: "custom",
        message: "Service information is required.",
        path: ["serviceId"],
      });
    }
  });

const leadSchema = z.object({
  id: z.string(),
  serviceId: z.string().nullable(),
  serviceName: z.string(),
  customerName: z.string(),
  email: z.email(),
  phone: z.string(),
  preferredDate: isoDateSchema,
  preferredTime: hhmmTimeSchema,
  notes: z.string(),
  preferredContactChannel: preferredContactChannelSchema,
  locale: z.enum(locales),
  status: leadStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

const leadStoreSchema = z.object({
  lastUpdatedAt: z.string().nullable(),
  leads: z.array(leadSchema),
});

const leadStatusUpdateSchema = z.object({
  status: leadStatusSchema,
});

export type LeadStatus = z.infer<typeof leadStatusSchema>;
export type PreferredContactChannel = z.infer<typeof preferredContactChannelSchema>;
export type Lead = z.infer<typeof leadSchema>;

type LeadStore = z.infer<typeof leadStoreSchema>;
type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

const defaultLeadStore: LeadStore = {
  lastUpdatedAt: null,
  leads: [],
};

function resolveLeadStoragePath() {
  if (process.env.LEADS_STORAGE_PATH) {
    return process.env.LEADS_STORAGE_PATH;
  }

  if (process.env.VERCEL) {
    // Vercel functions do not provide a persistent writable project filesystem.
    // For demo deploys, keep temporary lead storage in /tmp and prefer a real DB in production.
    return path.join("/tmp", "teal-and-tale-leads.json");
  }

  return path.join(process.cwd(), "storage", "leads.json");
}

async function ensureLeadStorageFile() {
  const storagePath = resolveLeadStoragePath();
  const directoryPath = path.dirname(storagePath);

  await mkdir(directoryPath, { recursive: true });

  try {
    await readFile(storagePath, "utf-8");
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code !== "ENOENT") {
      throw error;
    }

    await writeFile(storagePath, JSON.stringify(defaultLeadStore, null, 2), "utf-8");
  }

  return storagePath;
}

async function readLeadStore() {
  const storagePath = await ensureLeadStorageFile();
  const raw = await readFile(storagePath, "utf-8");

  if (!raw.trim()) {
    return defaultLeadStore;
  }

  return leadStoreSchema.parse(JSON.parse(raw));
}

async function writeLeadStore(store: LeadStore) {
  const storagePath = await ensureLeadStorageFile();
  const normalizedStore: LeadStore = {
    lastUpdatedAt: store.lastUpdatedAt,
    leads: store.leads.sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
  };

  await writeFile(storagePath, JSON.stringify(normalizedStore, null, 2), "utf-8");
}

function resolveService(payload: LeadSubmission) {
  const service = payload.serviceId
    ? content.services.find((item) => item.id === payload.serviceId)
    : undefined;

  if (payload.serviceId && !service && !payload.serviceName) {
    throw new ZodError([
      {
        code: "custom",
        message: "Selected service does not exist.",
        path: ["serviceId"],
      },
    ]);
  }

  return {
    serviceId: service?.id ?? null,
    serviceName: service ? t(service.name, payload.locale as Locale) : payload.serviceName ?? "",
  };
}

export function parseLeadSubmission(payload: unknown) {
  return leadSubmissionSchema.parse(payload);
}

export function parseLeadStatusUpdate(payload: unknown) {
  return leadStatusUpdateSchema.parse(payload);
}

export async function listLeads() {
  const store = await readLeadStore();

  return store.leads.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function createLead(payload: unknown) {
  const parsedPayload = parseLeadSubmission(payload);
  const service = resolveService(parsedPayload);
  const timestamp = new Date().toISOString();

  const lead: Lead = {
    id: randomUUID(),
    serviceId: service.serviceId,
    serviceName: service.serviceName,
    customerName: parsedPayload.customerName,
    email: parsedPayload.email,
    phone: parsedPayload.phone,
    preferredDate: parsedPayload.preferredDate,
    preferredTime: parsedPayload.preferredTime,
    notes: parsedPayload.notes,
    preferredContactChannel: parsedPayload.preferredContactChannel,
    locale: parsedPayload.locale,
    status: "new",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const store = await readLeadStore();
  store.leads.unshift(lead);
  store.lastUpdatedAt = timestamp;

  await writeLeadStore(store);

  return lead;
}

export async function updateLeadStatus(id: string, payload: unknown) {
  const parsedPayload = parseLeadStatusUpdate(payload);
  const store = await readLeadStore();
  const leadIndex = store.leads.findIndex((lead) => lead.id === id);

  if (leadIndex === -1) {
    return null;
  }

  const updatedLead: Lead = {
    ...store.leads[leadIndex],
    status: parsedPayload.status,
    updatedAt: new Date().toISOString(),
  };

  store.leads[leadIndex] = updatedLead;
  store.lastUpdatedAt = updatedLead.updatedAt;

  await writeLeadStore(store);

  return updatedLead;
}
