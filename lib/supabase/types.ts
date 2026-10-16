import type { Database } from "./database.types";
// Stable domain aliases survive regeneration of Supabase's generated file.
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type VocabularyItem = Database["public"]["Tables"]["vocabulary_items"]["Row"];
export type ReviewState = Database["public"]["Tables"]["review_states"]["Row"];
