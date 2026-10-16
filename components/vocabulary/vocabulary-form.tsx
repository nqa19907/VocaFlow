"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { partsOfSpeech, vocabularySchema, type VocabularyInput } from "@/lib/validation/vocabulary";
import type { VocabularyItem } from "@/lib/supabase/types";

const initial: VocabularyInput = {
  word: "",
  part_of_speech: "n.",
  ipa: "",
  definition_vi: "",
  example_en: "",
  synonyms_en: [],
  etymology_en: "",
};
export function VocabularyForm({ item }: { item?: VocabularyItem }) {
  const [values, setValues] = useState<VocabularyInput>(
    item
      ? {
          word: item.word,
          part_of_speech: item.part_of_speech as VocabularyInput["part_of_speech"],
          ipa: item.ipa,
          definition_vi: item.definition_vi,
          example_en: item.example_en,
          synonyms_en: item.synonyms_en,
          etymology_en: item.etymology_en,
        }
      : initial,
  );
  const [synonyms, setSynonyms] = useState(item?.synonyms_en.join(", ") || "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const payload = {
    ...values,
    synonyms_en: synonyms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  const valid = vocabularySchema.safeParse(payload).success;
  function change(key: keyof VocabularyInput, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsed = vocabularySchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    startTransition(async () => {
      try {
        const response = await fetch(item ? `/api/vocabulary/${item.id}` : "/api/vocabulary", {
          method: item ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        if (!response.ok) {
          const body = await response.json();
          setError(body.error?.message || "Không thể lưu từ vựng.");
          return;
        }
        router.push("/app/vocabulary?notice=saved");
        router.refresh();
      } catch {
        setError("Không thể kết nối. Hãy kiểm tra mạng và thử lại.");
      }
    });
  }
  return (
    <>
      <Link
        href="/app/vocabulary"
        className="inline-flex items-center gap-2 text-xs text-muted mb-6"
      >
        <ArrowLeft size={14} /> Về thư viện
      </Link>
      <div className="page-heading">
        <div>
          <h1>{item ? "Chỉnh sửa thẻ từ" : "Thêm một từ mới"}</h1>
          <p>Một từ có ngữ cảnh, một kết nối để nhớ lâu hơn.</p>
        </div>
        <span className="chip">
          <PenLine size={12} className="mr-2" /> Nhập thủ công · Miễn phí
        </span>
      </div>
      <div className="form-layout">
        <form onSubmit={submit} className="panel">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="word">
                Từ tiếng Anh <span className="text-primary">*</span>
              </label>
              <input
                className="input"
                id="word"
                name="word"
                required
                maxLength={100}
                placeholder="e.g. hurricane"
                value={values.word}
                onChange={(e) => change("word", e.target.value)}
                disabled={pending}
                autoFocus
                autoComplete="off"
              />
            </div>
            <div className="field">
              <label htmlFor="part_of_speech">
                Loại từ <span className="text-primary">*</span>
              </label>
              <select
                className="input"
                id="part_of_speech"
                name="part_of_speech"
                value={values.part_of_speech}
                onChange={(e) => change("part_of_speech", e.target.value)}
                disabled={pending}
              >
                {partsOfSpeech.map((pos) => (
                  <option key={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div className="field full">
              <label htmlFor="ipa">
                Phiên âm IPA <span className="font-normal text-[#b9abc6]">· Không bắt buộc</span>
              </label>
              <input
                id="ipa"
                className="input"
                placeholder="/ˈhɝː.ɪ.keɪn/"
                maxLength={200}
                value={values.ipa}
                onChange={(e) => change("ipa", e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="field full">
              <label htmlFor="definition_vi">
                Nghĩa tiếng Việt <span className="text-primary">*</span>
              </label>
              <textarea
                id="definition_vi"
                className="input"
                placeholder="bão lớn, bão nhiệt đới"
                maxLength={2000}
                required
                value={values.definition_vi}
                onChange={(e) => change("definition_vi", e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="field full">
              <label htmlFor="example_en">
                Example <span className="font-normal text-[#b9abc6]">· Tiếng Anh</span>
              </label>
              <textarea
                id="example_en"
                className="input"
                placeholder="The hurricane damaged several houses along the coast."
                maxLength={2000}
                value={values.example_en}
                onChange={(e) => change("example_en", e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="field full">
              <label htmlFor="synonyms_en">
                Synonyms{" "}
                <span className="font-normal text-[#b9abc6]">
                  · Tiếng Anh, cách nhau bằng dấu phẩy
                </span>
              </label>
              <input
                id="synonyms_en"
                className="input"
                placeholder="tropical cyclone, storm"
                maxLength={2000}
                value={synonyms}
                onChange={(e) => setSynonyms(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="field full">
              <label htmlFor="etymology_en">
                Etymology{" "}
                <span className="font-normal text-[#b9abc6]">
                  · Tiếng Anh, để trống nếu chưa chắc
                </span>
              </label>
              <textarea
                id="etymology_en"
                className="input"
                placeholder="From Spanish huracán, borrowed from a Caribbean language."
                maxLength={2000}
                value={values.etymology_en}
                onChange={(e) => change("etymology_en", e.target.value)}
                disabled={pending}
              />
            </div>
          </div>
          {error && (
            <div className="notice error mt-5" role="alert">
              {error}
            </div>
          )}
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#f0eaf5]">
            <Button type="submit" disabled={!valid || pending}>
              {pending ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />}
              {pending ? "Đang lưu…" : item ? "Lưu thay đổi" : "Lưu vào thư viện"}
            </Button>
            <Link className="button ghost" href="/app/vocabulary">
              Hủy
            </Link>
          </div>
          <p className="text-[10px] text-[#b4a4be] mt-4">
            Dấu * là trường bắt buộc. Không tự suy đoán nguồn gốc từ khi chưa chắc chắn.
          </p>
        </form>
        <aside className="panel preview-panel">
          <span className="eyebrow text-primary">THẺ TỪ CỦA BẠN</span>
          <h2>
            {values.word || "Your next word"}
            <span className="text-xs text-primary ml-3">{values.part_of_speech}</span>
          </h2>
          <p className="text-[#b19dc0]! mt-1">{values.ipa || "Phiên âm sẽ hiển thị ở đây"}</p>
          <h3>Definition</h3>
          <p className="preview-definition">{values.definition_vi || "Nghĩa tiếng Việt của từ"}</p>
          <h3>Example</h3>
          <p className="italic">
            {values.example_en || "Add a sentence that makes this word yours."}
          </p>
          <h3>Synonyms</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {payload.synonyms_en.length ? (
              payload.synonyms_en.map((word, index) => (
                <span key={index} className="chip max-w-full break-words">
                  {word}
                </span>
              ))
            ) : (
              <p>—</p>
            )}
          </div>
          <h3>Etymology</h3>
          <p>{values.etymology_en || "—"}</p>
          <div className="mt-7 pt-4 border-t border-[#f0eaf5] text-[10px] text-[#b6a4c1]">
            Bản xem trước · Chỉ lưu khi bạn xác nhận
          </div>
        </aside>
      </div>
    </>
  );
}
