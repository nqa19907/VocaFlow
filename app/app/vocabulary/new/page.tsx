import { VocabularyForm } from "@/components/vocabulary/vocabulary-form";
import { requireUser } from "@/lib/auth/session";
export default async function NewWord() {
  await requireUser();
  return <VocabularyForm />;
}
