import { z } from "zod";

export const partsOfSpeech = [
  "n.",
  "v.",
  "adj.",
  "adv.",
  "pron.",
  "prep.",
  "conj.",
  "interj.",
  "phr.",
] as const;
export function normalizeWord(word: string) {
  return word.trim().replace(/\s+/g, " ").toLowerCase();
}
const vocabularyContentSchema = z
  .object({
    word: z
      .string()
      .trim()
      .min(1, "Hãy nhập từ tiếng Anh.")
      .max(100)
      .regex(/^[a-zA-Z][a-zA-Z '’.-]*$/, "Chỉ nhập từ hoặc cụm từ tiếng Anh."),
    part_of_speech: z.enum(partsOfSpeech),
    ipa: z.string().trim().max(200),
    definition_vi: z.string().trim().min(1, "Hãy nhập nghĩa tiếng Việt.").max(2000),
    example_en: z.string().trim().max(2000),
    synonyms_en: z.array(z.string().trim().min(1).max(100)).max(20),
    etymology_en: z.string().trim().max(2000),
  })
  .strict();
export const vocabularySchema = vocabularyContentSchema.extend({
  ipa: vocabularyContentSchema.shape.ipa.default(""),
  example_en: vocabularyContentSchema.shape.example_en.default(""),
  synonyms_en: vocabularyContentSchema.shape.synonyms_en.default([]),
  etymology_en: vocabularyContentSchema.shape.etymology_en.default(""),
});
export type VocabularyInput = z.infer<typeof vocabularySchema>;
export const vocabularyPatchSchema = vocabularyContentSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Cần ít nhất một trường để cập nhật.");

export const libraryQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  pos: z.union([z.enum(partsOfSpeech), z.literal("")]).default(""),
  sort: z.enum(["newest", "oldest", "word"]).default("newest"),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  view: z.enum(["table", "grid"]).default("table"),
});
export function escapeLike(input: string) {
  return input.replace(/[\\%_]/g, "\\$&");
}
