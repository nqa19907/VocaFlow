import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { escapeLike, libraryQuerySchema } from "@/lib/validation/vocabulary";
import { LibraryFilters } from "@/components/vocabulary/library-filters";
import { DeleteWord } from "@/components/vocabulary/delete-word";

function getPosClass(pos: string) {
  const lower = pos.toLowerCase();
  if (lower.includes("n.") || lower.includes("noun") || lower.includes("danh"))
    return "chip chip-noun";
  if (lower.includes("v.") || lower.includes("verb") || lower.includes("động"))
    return "chip chip-verb";
  if (lower.includes("adj") || lower.includes("tính"))
    return "chip chip-adj";
  if (lower.includes("adv") || lower.includes("trạng"))
    return "chip chip-adv";
  if (lower.includes("prep") || lower.includes("giới"))
    return "chip chip-prep";
  return "chip";
}

export default async function Library({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase, user } = await requireUser();
  const raw = await searchParams;
  const parsed = libraryQuerySchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : libraryQuerySchema.parse({});
  const { q, pos, sort, page, view } = filters;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("user_id", user.id)
    .single();
  if (profileError || !profile) throw new Error("PROFILE_NOT_AVAILABLE");
  let query = supabase
    .from("vocabulary_items")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);
  if (q) query = query.ilike("word", `%${escapeLike(q)}%`);
  if (pos) query = query.eq("part_of_speech", pos);
  const { data, error, count } = await query
    .order(sort === "word" ? "word" : "created_at", { ascending: sort !== "newest" })
    .order("id")
    .range((page - 1) * 20, page * 20 - 1);
  if (error) throw new Error("VOCABULARY_UNAVAILABLE");
  const pageLink = (number: number) => {
    const params = new URLSearchParams({ q, pos, sort, view, page: String(number) });
    return `/app/vocabulary?${params}`;
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow text-primary mb-2">LỚN DẦN THEO TỪNG NGÀY</span>
          <h1>Thư viện từ của bạn</h1>
          <p>{count || 0} từ trong kết quả · Những điều bạn muốn ghi nhớ.</p>
        </div>
        <Link className="button" href="/app/vocabulary/new">
          <Plus size={16} /> Thêm từ mới
        </Link>
      </div>
      {raw.notice === "saved" && (
        <div className="notice success mb-5" role="status">
          Đã lưu thẻ từ vào thư viện.
        </div>
      )}
      {!parsed.success && (
        <div className="notice mb-5">Bộ lọc không hợp lệ. Đang hiển thị thư viện mặc định.</div>
      )}
      <LibraryFilters {...filters} />

      {data?.length ? (
        view === "grid" ? (
          <div className="vocab-card-grid">
            {data.map((item) => (
              <article key={item.id} className="vocab-card">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <Link href={`/app/vocabulary/${item.id}`} className="word-link text-lg font-bold">
                        {item.word}
                      </Link>
                      {item.ipa && <div className="text-xs text-[#8c7b9b] font-mono mt-0.5">/{item.ipa}/</div>}
                    </div>
                    <span className={getPosClass(item.part_of_speech)}>{item.part_of_speech}</span>
                  </div>
                  <p className="text-sm text-[#463f58] font-medium leading-relaxed mb-3">
                    {item.definition_vi}
                  </p>
                  {item.example_en && (
                    <p className="text-xs text-[#7e768f] italic bg-[#faf8fc] p-2.5 rounded-lg border border-[#f0ebf5]">
                      &ldquo;{item.example_en}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#f0ecf5] text-xs text-[#a094af]">
                  <span>
                    {new Date(item.created_at).toLocaleDateString("vi-VN", {
                      timeZone: profile.timezone,
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/app/vocabulary/${item.id}`}
                      className="icon-button"
                      aria-label={`Sửa ${item.word}`}
                    >
                      <Pencil size={14} />
                    </Link>
                    <DeleteWord id={item.id} word={item.word} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel p-0! overflow-hidden">
            <table className="vocab-table">
              <thead>
                <tr>
                  <th>TỪ VỰNG</th>
                  <th>NGHĨA TIẾNG VIỆT</th>
                  <th>LOẠI TỪ</th>
                  <th>NGÀY THÊM</th>
                  <th>
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link href={`/app/vocabulary/${item.id}`} className="word-link">
                        {item.word}
                      </Link>
                      <div className="row-ipa">{item.ipa || "—"}</div>
                    </td>
                    <td>
                      <span className="text-[#8c7b9b] line-clamp-2 max-w-sm break-words">
                        {item.definition_vi}
                      </span>
                    </td>
                    <td>
                      <span className={getPosClass(item.part_of_speech)}>{item.part_of_speech}</span>
                    </td>
                    <td className="date-cell">
                      <span className="text-[#b09fbd]">
                        {new Date(item.created_at).toLocaleDateString("vi-VN", {
                          timeZone: profile.timezone,
                        })}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <Link
                          href={`/app/vocabulary/${item.id}`}
                          className="icon-button"
                          aria-label={`Sửa ${item.word}`}
                        >
                          <Pencil size={14} />
                        </Link>
                        <DeleteWord id={item.id} word={item.word} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="panel p-0! overflow-hidden">
          <div className="empty-state">
            <div className="empty-icon">
              <BookOpen size={27} strokeWidth={1.5} />
            </div>
            <h2>{q || pos ? "Chưa tìm thấy từ phù hợp" : "Một thư viện đang chờ bạn viết nên"}</h2>
            <p>
              {q || pos
                ? "Thử một từ khóa khác hoặc thay đổi bộ lọc."
                : "Bắt đầu với từ vừa gặp trong một bài đọc, một bộ phim hay một cuộc trò chuyện."}
            </p>
            <Link
              href={q || pos ? "/app/vocabulary" : "/app/vocabulary/new"}
              className="button secondary"
            >
              {q || pos ? "Xóa bộ lọc" : "Thêm từ đầu tiên"}
              <Plus size={14} />
            </Link>
          </div>
        </div>
      )}

      {!!count && (
        <div className="flex items-center justify-between mt-5 text-xs text-muted">
          <span>
            Trang {page} / {Math.max(1, Math.ceil(count / 20))}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageLink(page - 1)} className="button secondary">
                <ChevronLeft size={14} /> Trước
              </Link>
            )}
            {page * 20 < count && (
              <Link href={pageLink(page + 1)} className="button secondary">
                Sau <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
