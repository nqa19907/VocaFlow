import { notFound } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { VocabularyForm } from "@/components/vocabulary/vocabulary-form";
export default async function EditWord({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { data, error } = await supabase
    .from("vocabulary_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("VOCABULARY_UNAVAILABLE");
  if (!data) notFound();
  return <VocabularyForm item={data} />;
}
