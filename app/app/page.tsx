import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Plus, Sparkles, Sprout } from "lucide-react";
import { requireUser } from "@/lib/auth/session";

function getPosClass(pos?: string) {
  if (!pos) return "chip";
  const lower = pos.toLowerCase();
  if (lower.includes("noun") || lower.includes("danh")) return "chip chip-noun";
  if (lower.includes("verb") || lower.includes("động")) return "chip chip-verb";
  if (lower.includes("adj") || lower.includes("tính")) return "chip chip-adj";
  if (lower.includes("adv") || lower.includes("trạng")) return "chip chip-adv";
  if (lower.includes("prep") || lower.includes("giới")) return "chip chip-prep";
  return "chip";
}

export default async function Dashboard() {
  const { supabase, user } = await requireUser();
  const [profile, vocabulary, due, mastered, recentItem] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
    supabase
      .from("vocabulary_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("review_states")
      .select("vocabulary_item_id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lte("due_at", new Date().toISOString()),
    supabase
      .from("review_states")
      .select("vocabulary_item_id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gt("repetitions", 0),
    supabase
      .from("vocabulary_items")
      .select("id, word, ipa, part_of_speech, definition_vi, example_en")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if ([profile, vocabulary, due].some((result) => result.error))
    throw new Error("DASHBOARD_DATA_UNAVAILABLE");

  const dueCount = due.count ?? 0;
  const vocabCount = vocabulary.count ?? 0;
  const masteredCount = mastered.count ?? 0;
  const wordOfTheDay = recentItem.data;

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow text-primary mb-2">MỖI NGÀY MỘT CHÚT</span>
          <h1>
            Chào {profile.data?.display_name || "bạn"} <span className="text-[#a18ac5]">✦</span>
          </h1>
          <p>Thêm một từ mới. Mở thêm một góc nhìn.</p>
        </div>
        <Link className="button" href="/app/vocabulary/new">
          <Plus size={16} /> Thêm từ mới
        </Link>
      </div>

      <div className="stat-grid">
        {[
          {
            label: "Từ đã lưu",
            value: vocabCount,
            sub: "Trong thư viện cá nhân",
            Icon: BookOpen,
          },
          {
            label: "Từ đến hạn ôn",
            value: dueCount,
            sub: dueCount > 0 ? "Sẵn sàng để củng cố" : "Không có từ tồn đọng",
            Icon: Clock3,
          },
          {
            label: "Đã củng cố",
            value: masteredCount,
            sub: masteredCount > 0 ? "Đã qua các vòng ôn lặp lại" : "Chờ hoàn thành lượt ôn đầu",
            Icon: Sparkles,
          },
        ].map(({ label, value, sub, Icon }) => (
          <div className="panel" key={label}>
            <div className="flex items-center justify-between gap-1">
              <span className="stat-label">{label}</span>
              <Icon size={16} className="text-[#b09bcc]" />
            </div>
            <p className="stat-value">{value}</p>
            <span className="stat-subtitle">{sub}</span>
          </div>
        ))}
      </div>

      {dueCount > 0 && (
        <section className="quick-review-banner" aria-label="Thông báo ôn tập">
          <div className="flex items-center gap-4">
            <div className="quick-review-icon">
              <Clock3 size={22} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#20213e]">
                Có {dueCount} từ cần ôn tập hôm nay
              </h2>
              <p className="text-xs text-[#74758c] mt-0.5">
                Củng cố đúng nhịp theo thuật toán Spaced Repetition giúp từ vựng đi vào trí nhớ dài hạn.
              </p>
            </div>
          </div>
          <Link className="button shrink-0" href="/app/vocabulary">
            Ôn tập ngay <ArrowRight size={15} />
          </Link>
        </section>
      )}

      {wordOfTheDay && (
        <section className="daily-word-card">
          <div className="flex items-center justify-between mb-3">
            <span className="eyebrow text-primary">
              <Sparkles size={14} /> TỪ GẦN ĐÂY TRONG THƯ VIỆN
            </span>
            <Link
              href={`/app/vocabulary/${wordOfTheDay.id}`}
              className="text-xs text-[#5951dc] hover:underline inline-flex items-center gap-1 font-medium"
            >
              Xem chi tiết <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            <h3 className="text-2xl font-bold text-[#20213e]">{wordOfTheDay.word}</h3>
            {wordOfTheDay.ipa && (
              <span className="text-sm text-[#8c7b9b] font-mono">/{wordOfTheDay.ipa}/</span>
            )}
            {wordOfTheDay.part_of_speech && (
              <span className={getPosClass(wordOfTheDay.part_of_speech)}>
                {wordOfTheDay.part_of_speech}
              </span>
            )}
          </div>
          <p className="text-sm text-[#4b4363] font-medium mb-2">{wordOfTheDay.definition_vi}</p>
          {wordOfTheDay.example_en && (
            <p className="text-xs text-[#7d7593] italic bg-[#faf8fc] p-3 rounded-lg border border-[#f0ebf5]">
              &ldquo;{wordOfTheDay.example_en}&rdquo;
            </p>
          )}
        </section>
      )}

      <section className="welcome-panel">
        <div>
          <span className="eyebrow text-primary mb-2">
            <Sprout size={14} /> KHỞI ĐẦU THÓI QUEN
          </span>
          <h2>
            {vocabCount
              ? "Thư viện của bạn đang lớn dần."
              : "Từ đầu tiên là bước khởi đầu đẹp."}
          </h2>
          <p>
            Tự thêm từ với một ví dụ gắn với cuộc sống của bạn. Mỗi từ bạn lưu là một bước tiến trên
            hành trình làm chủ ngôn ngữ.
          </p>
        </div>
        <Link className="button secondary shrink-0" href="/app/vocabulary">
          Mở thư viện <ArrowRight size={15} />
        </Link>
      </section>

      <div className="panel mt-6 flex items-start gap-4">
        <div className="feature-icon mb-0! shrink-0">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-sm font-semibold mb-2">Tiếp theo trên hành trình</h2>
          <p className="text-xs text-muted leading-7">
            Hệ thống tự động tính toán thời điểm ôn tập tối ưu cho từng từ dựa trên phương pháp lặp lại
            ngắt quãng. Bạn có thể tra cứu nhanh, quản lý và củng cố vốn từ vựng bất kỳ lúc nào.
          </p>
        </div>
      </div>
    </>
  );
}
