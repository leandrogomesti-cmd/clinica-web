import { z } from "zod";

export const assistantConfigSchema = z.object({
  system_preamble: z.string().min(10).max(4000),
  tone: z.enum(["humano-curto","profissional","acolhedor"]).default("humano-curto"),
  faq: z.object({
    address: z.string().default(""),
    price: z.string().default(""),
    plans: z.string().default(""),
    customQA: z.array(z.object({ q: z.string(), a: z.string() })).default([])
  }),
  booking_policies: z.object({
    business_hours: z.array(z.string()).default(["seg-sex 08:00-18:00"]),
    min_notice_minutes: z.number().int().min(0).default(60),
    auto_confirm: z.boolean().default(true)
  }),
  doctors_aliases: z.record(z.string(), z.string()).default({}),
  stop_phrases: z.array(z.string()).default(["Isso é orientação geral; não substitui consulta médica."])
});
export type AssistantConfig = z.infer<typeof assistantConfigSchema>;

export const defaultAssistantConfig: AssistantConfig = {
  system_preamble:
    "Você é a secretária da clínica. Responda curto, claro e gentil. Nunca faça diagnóstico. " +
    "Para perguntas clínicas, dê orientação geral + convide para consulta. " +
    "Use ferramentas para horários/agenda. Não invente preços/convênios.",
  tone: "humano-curto",
  faq: { address: "", price: "", plans: "", customQA: [] },
  booking_policies: { business_hours:["seg-sex 08:00-18:00"], min_notice_minutes:60, auto_confirm:true },
  doctors_aliases: {},
  stop_phrases: ["Isso é orientação geral; não substitui consulta médica."]
};