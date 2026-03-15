import { z } from "zod";
import rawContent from "../data/content.json";

export const locales = ["pl", "en"] as const;
export type Locale = (typeof locales)[number];

const localizedStringSchema = z.object({
  pl: z.string(),
  en: z.string(),
});

const contentSchema = z.object({
  meta: z.object({
    siteName: z.string(),
    siteUrl: z.url(),
    title: localizedStringSchema,
    description: localizedStringSchema,
    ogImage: z.url(),
  }),
  brand: z.object({
    name: z.string(),
    tagline: localizedStringSchema,
    addressLabel: localizedStringSchema,
    addressLine: localizedStringSchema,
    hours: z.array(
      z.object({
        label: localizedStringSchema,
        value: z.string(),
      }),
    ),
    contact: z.object({
      phone: z.string(),
      bookingEmail: z.email(),
      whatsApp: z.string(),
      telegram: z.string(),
      instagram: z.url(),
    }),
  }),
  navigation: z.array(
    z.object({
      id: z.string(),
      label: localizedStringSchema,
    }),
  ),
  hero: z.object({
    eyebrow: localizedStringSchema,
    title: localizedStringSchema,
    description: localizedStringSchema,
    primaryCta: localizedStringSchema,
    secondaryCta: localizedStringSchema,
    badges: z.array(localizedStringSchema),
    metrics: z.array(
      z.object({
        value: z.string(),
        label: localizedStringSchema,
      }),
    ),
    mediaId: z.string(),
  }),
  servicesIntro: z.object({
    eyebrow: localizedStringSchema,
    title: localizedStringSchema,
    description: localizedStringSchema,
  }),
  services: z.array(
    z.object({
      id: z.string(),
      category: localizedStringSchema,
      featured: z.boolean(),
      price: z.number(),
      currency: z.string(),
      durationMin: z.number(),
      name: localizedStringSchema,
      shortDescription: localizedStringSchema,
      experienceNote: localizedStringSchema,
      ctaLabel: localizedStringSchema,
      mediaId: z.string(),
    }),
  ),
  experience: z.object({
    eyebrow: localizedStringSchema,
    title: localizedStringSchema,
    description: localizedStringSchema,
    pillars: z.array(
      z.object({
        title: localizedStringSchema,
        copy: localizedStringSchema,
      }),
    ),
    highlights: z.array(localizedStringSchema),
    mediaIds: z.array(z.string()),
  }),
  trust: z.object({
    eyebrow: localizedStringSchema,
    title: localizedStringSchema,
    description: localizedStringSchema,
    platforms: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        rating: z.string(),
        reviewCount: z.string(),
        sourceLabel: localizedStringSchema,
        ctaLabel: localizedStringSchema,
        link: z.url(),
        notes: z.array(localizedStringSchema),
      }),
    ),
  }),
  instagram: z.object({
    eyebrow: localizedStringSchema,
    title: localizedStringSchema,
    description: localizedStringSchema,
    ctaLabel: localizedStringSchema,
    posts: z.array(
      z.object({
        id: z.string(),
        title: localizedStringSchema,
        imageId: z.string(),
        link: z.url(),
      }),
    ),
  }),
  booking: z.object({
    eyebrow: localizedStringSchema,
    title: localizedStringSchema,
    description: localizedStringSchema,
    helper: localizedStringSchema,
    assurances: z.array(localizedStringSchema),
    channelLabel: localizedStringSchema,
    submitLabel: localizedStringSchema,
    submittingLabel: localizedStringSchema,
    successMessage: localizedStringSchema,
    errorMessage: localizedStringSchema,
    messageIntro: localizedStringSchema,
    emailSubject: localizedStringSchema,
    fieldLabels: z.object({
      name: localizedStringSchema,
      email: localizedStringSchema,
      phone: localizedStringSchema,
      date: localizedStringSchema,
      time: localizedStringSchema,
      notes: localizedStringSchema,
      service: localizedStringSchema,
    }),
    notesPlaceholder: localizedStringSchema,
    channels: z.array(
      z.object({
        id: z.enum(["whatsapp", "telegram", "email"]),
        label: localizedStringSchema,
        description: localizedStringSchema,
      }),
    ),
  }),
  faq: z.object({
    eyebrow: localizedStringSchema,
    title: localizedStringSchema,
    items: z.array(
      z.object({
        question: localizedStringSchema,
        answer: localizedStringSchema,
      }),
    ),
  }),
  legal: z.object({
    privacyLinkLabel: localizedStringSchema,
    consents: z.object({
      processing: localizedStringSchema,
      contact: localizedStringSchema,
    }),
    policyIntro: localizedStringSchema,
    policySections: z.array(
      z.object({
        title: localizedStringSchema,
        copy: localizedStringSchema,
      }),
    ),
  }),
  footer: z.object({
    copy: localizedStringSchema,
    cta: localizedStringSchema,
  }),
  media: z.array(
    z.object({
      id: z.string(),
      src: z.url(),
      alt: localizedStringSchema,
      width: z.number(),
      height: z.number(),
      priority: z.boolean(),
      mood: z.string(),
      overlay: z.string(),
    }),
  ),
  settings: z.object({
    defaultLocale: z.enum(locales),
    stickyCtaAfterScroll: z.number(),
    demoMode: z.boolean(),
  }),
});

export const content = contentSchema.parse(rawContent);

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function t(value: { pl: string; en: string }, locale: Locale) {
  return value[locale];
}

export function getMediaById(id: string) {
  return content.media.find((item) => item.id === id);
}

export function formatPrice(price: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDuration(minutes: number) {
  return `${minutes} min`;
}
