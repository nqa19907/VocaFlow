// M1 contract. Regenerate with `npm run db:types` after running Supabase locally.
export type Profile = {
  user_id: string;
  display_name: string;
  timezone: string;
  role: "user" | "admin";
  created_at: string;
};
export type VocabularyItem = {
  id: string;
  user_id: string;
  word: string;
  normalized_word: string;
  part_of_speech: string;
  ipa: string;
  definition_vi: string;
  example_en: string;
  synonyms_en: string[];
  etymology_en: string;
  source: "manual" | "ai" | "pack";
  created_at: string;
  updated_at: string;
};
export type ReviewState = {
  vocabulary_item_id: string;
  user_id: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  due_at: string;
  last_reviewed_at: string | null;
};
type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};
export type VocabularyWrite = Pick<
  VocabularyItem,
  | "word"
  | "part_of_speech"
  | "ipa"
  | "definition_vi"
  | "example_en"
  | "synonyms_en"
  | "etymology_en"
>;
export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, never, Pick<Profile, "display_name" | "timezone">>;
      vocabulary_items: Table<
        VocabularyItem,
        VocabularyWrite & { user_id: string },
        Partial<VocabularyWrite>
      >;
      review_states: Table<ReviewState, never, never>;
      credit_wallets: Table<{ user_id: string; balance: number; updated_at: string }, never, never>;
    };
    Views: Record<string, never>;
    Functions: { consume_rate_limit: { Args: { bucket_name: string }; Returns: boolean } };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
