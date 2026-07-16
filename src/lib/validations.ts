import { z } from "zod";

/** Shared Zod schemas — validated on both client (RHF) and server. */

export const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(8, "Au moins 8 caractères"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "Prénom requis"),
    lastName: z.string().min(1, "Nom requis"),
    email: z.string().email("Adresse e-mail invalide"),
    password: z.string().min(8, "Au moins 8 caractères"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter les conditions" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const contactSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Adresse e-mail invalide"),
  subject: z.string().min(1, "Sujet requis"),
  message: z.string().min(10, "Message trop court (10 caractères min.)"),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

/** HSL triplet like "240 6% 10%" used by the theme tokens. */
const hslTriplet = z
  .string()
  .regex(/^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/, "Format HSL attendu : « 240 6% 10% »");

export const tenantSettingsSchema = z.object({
  storeName: z.string().min(1, "Nom requis").max(60),
  tagline: z.string().max(120).optional().or(z.literal("")),
  logoUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  faviconUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  accent: hslTriplet,
  primary: hslTriplet,
  radius: z.enum(["sharp", "soft", "round"]),
  fontFamily: z.enum(["geist", "inter", "playfair", "satoshi"]),
  defaultMode: z.enum(["light", "dark", "system"]),
  metaTitle: z.string().max(70).optional().or(z.literal("")),
  metaDescription: z.string().max(180).optional().or(z.literal("")),
  metaPixelId: z.string().max(40).optional().or(z.literal("")),
  googleAnalyticsId: z.string().max(40).optional().or(z.literal("")),
  bannerMessage: z.string().max(140).optional().or(z.literal("")),
  bannerHref: z.string().optional().or(z.literal("")),
  bannerActive: z.boolean().optional(),
});
export type TenantSettingsInput = z.infer<typeof tenantSettingsSchema>;

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, "Numéro de commande requis"),
  email: z.string().email("Adresse e-mail invalide"),
});
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
