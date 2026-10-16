"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, LoaderCircle, Search } from "lucide-react";
import { partsOfSpeech } from "@/lib/validation/vocabulary";

export function LibraryFilters({
  q,
  pos,
  sort,
  view = "table",
}: {
  q: string;
  pos: string;
  sort: string;
  view?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q);
  const [previousQuery, setPreviousQuery] = useState(q);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState(q);
  // Synchronize browser back/forward without remounting the input or losing focus.
  // Preserve characters typed while an older search navigation is still pending.
  if (q !== previousQuery) {
    setPreviousQuery(q);
    if (search === lastSubmittedQuery) {
      setSearch(q);
      setLastSubmittedQuery(q);
    }
  }
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("notice");
    next.delete("page");
    const currentQuery = key === "q" ? value : search;
    setLastSubmittedQuery(currentQuery);
    if (currentQuery) next.set("q", currentQuery);
    else next.delete("q");
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`/app/vocabulary?${next}`, { scroll: false }));
  }
  return (
    <div className="toolbar flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-1 flex-wrap items-center gap-3 min-w-0">
        <div className="search-input">
          {pending ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />}
          <input
            type="search"
            className="input"
            aria-label="Tìm từ tiếng Anh"
            placeholder="Tìm một từ trong thư viện…"
            maxLength={100}
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              if (timer.current) clearTimeout(timer.current);
              timer.current = setTimeout(() => update("q", value), 300);
            }}
          />
        </div>
        <select
          className="input"
          aria-label="Lọc theo loại từ"
          value={pos}
          onChange={(event) => {
            if (timer.current) clearTimeout(timer.current);
            update("pos", event.target.value);
          }}
        >
          {[
            { value: "", label: "Tất cả loại từ" },
            ...partsOfSpeech.map((value) => ({ value, label: value })),
          ].map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="input"
          aria-label="Sắp xếp từ"
          value={sort}
          onChange={(event) => {
            if (timer.current) clearTimeout(timer.current);
            update("sort", event.target.value);
          }}
        >
          <option value="newest">Mới thêm gần đây</option>
          <option value="oldest">Cũ nhất trước</option>
          <option value="word">Theo bảng chữ cái</option>
        </select>
      </div>

      <div className="view-toggle" role="group" aria-label="Chế độ hiển thị">
        <button
          type="button"
          className={`view-toggle-button${view !== "grid" ? " is-active" : ""}`}
          onClick={() => update("view", "table")}
          title="Dạng bảng"
          aria-label="Dạng bảng"
          aria-pressed={view !== "grid"}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          className={`view-toggle-button${view === "grid" ? " is-active" : ""}`}
          onClick={() => update("view", "grid")}
          title="Dạng thẻ"
          aria-label="Dạng thẻ"
          aria-pressed={view === "grid"}
        >
          <LayoutGrid size={16} />
        </button>
      </div>
    </div>
  );
}
