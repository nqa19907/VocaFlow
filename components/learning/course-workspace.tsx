"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Check, RotateCcw, Search, X } from "lucide-react";
import type { Course, CourseWord } from "@/lib/content/courses";
import { PronunciationButton } from "@/components/learning/pronunciation-button";
import { WordReading } from "@/components/learning/word-reading";
import { HighlightedExample } from "@/components/learning/highlighted-example";
import { stopPronunciation } from "@/lib/speech/browser";

type LearningMode = "vocabulary" | "practice";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("vi");
}

function WordCard({ word, locale, index }: { word: CourseWord; locale: string; index: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <article className={`learning-word-card${flipped ? " is-flipped" : ""}`}>
      <div className="learning-card-header">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <PronunciationButton text={word.term} locale={locale} className="word-pronunciation" />
      </div>
      <button
        type="button"
        className="learning-card-flip"
        onClick={() => setFlipped(!flipped)}
        aria-label={flipped ? `Xem từ ${word.term}` : `Xem nghĩa của ${word.term}`}
        aria-pressed={flipped}
      >
        <span className="learning-card-content">
          {flipped ? (
            <>
              <span className="learning-card-source" lang={locale}>
                {word.term}
              </span>
              <WordReading
                reading={word.reading}
                locale={locale}
                className="learning-card-reading"
              />
              <span className="learning-card-meaning">{word.meaning}</span>
            </>
          ) : (
            <>
              <span className="learning-card-term" lang={locale}>
                {word.term}
              </span>
              <WordReading
                reading={word.reading}
                locale={locale}
                className="learning-card-reading"
              />
            </>
          )}
        </span>
        <span className="learning-card-hint">
          <RotateCcw size={14} aria-hidden="true" /> {flipped ? "Xem lại từ" : "Xem nghĩa"}
        </span>
      </button>
      <div className="learning-card-example">
        <div className="learning-example-row">
          <p lang={locale}>
            <HighlightedExample example={word.example} term={word.term} />
          </p>
          <PronunciationButton
            text={word.example}
            locale={locale}
            label={`Nghe câu ví dụ: ${word.example}`}
            className="example-pronunciation"
          />
        </div>
        {flipped && <p className="learning-card-translation">{word.translation}</p>}
      </div>
    </article>
  );
}

function VocabularyPanel({ course }: { course: Course }) {
  const [query, setQuery] = useState("");
  const search = normalize(query.trim());
  const words = course.words.filter((word) =>
    normalize(
      [word.term, word.reading, word.meaning, word.example, word.translation].join(" "),
    ).includes(search),
  );

  return (
    <>
      <div className="course-toolbar">
        <div>
          <h3>Từ vựng chọn lọc</h3>
          <p>Lật thẻ để xem nghĩa và bản dịch tiếng Việt dưới câu ví dụ.</p>
        </div>
        <div className="course-search">
          <label className="sr-only" htmlFor={`search-${course.slug}`}>
            Tìm từ vựng
          </label>
          <Search size={17} aria-hidden="true" />
          <input
            id={`search-${course.slug}`}
            type="search"
            placeholder="Tìm từ, nghĩa hoặc phiên âm…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
      <p className="course-result-count" role="status">
        {search ? `${words.length} từ phù hợp` : `${course.words.length} từ trong bộ này`}
      </p>
      {words.length ? (
        <div className="course-word-grid">
          {words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              locale={course.locale}
              index={course.words.indexOf(word)}
            />
          ))}
        </div>
      ) : (
        <div className="course-empty-state">
          <Search size={24} aria-hidden="true" />
          <h3>Không tìm thấy từ phù hợp.</h3>
          <p>Thử một từ hoặc nghĩa khác.</p>
          <button className="button secondary" type="button" onClick={() => setQuery("")}>
            Xóa tìm kiếm
          </button>
        </div>
      )}
    </>
  );
}

function PracticePanel({ course }: { course: Course }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const word = course.words[index];
  const options = Array.from({ length: Math.min(4, course.words.length) }, (_, offset) => {
    const relativeIndex = (offset - (index % 4) + course.words.length) % course.words.length;
    return course.words[(index + relativeIndex) % course.words.length];
  });

  function choose(answer: CourseWord) {
    if (selected !== null) return;
    setSelected(answer.id);
    if (answer.id === word.id) setScore((current) => current + 1);
  }

  function next() {
    if (selected === null) return;
    stopPronunciation();
    if (index === course.words.length - 1) {
      setComplete(true);
    } else {
      setIndex((current) => current + 1);
      setSelected(null);
    }
  }

  function restart() {
    stopPronunciation();
    setIndex(0);
    setSelected(null);
    setScore(0);
    setComplete(false);
  }

  if (complete) {
    return (
      <div className="quiz-panel quiz-complete" role="status">
        <span className="quiz-complete-icon">
          <Check size={28} aria-hidden="true" />
        </span>
        <span className="eyebrow">LƯỢT LUYỆN TẬP CỦA BẠN</span>
        <h3>Bạn đã hoàn thành lượt luyện tập</h3>
        <p className="quiz-score">
          {score}/{course.words.length} câu đúng
        </p>
        <p>Quay lại những thẻ từ hoặc bắt đầu một lượt mới khi bạn sẵn sàng.</p>
        <button type="button" className="button" onClick={restart}>
          <RotateCcw size={16} aria-hidden="true" /> Luyện lại
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-panel">
      <div className="quiz-topline">
        <span className="eyebrow">NHẬN DIỆN TỪ VỰNG</span>
        <span>
          Câu {index + 1} / {course.words.length}
        </span>
      </div>
      <div
        className="quiz-progress"
        role="progressbar"
        aria-label="Số câu đã trả lời"
        aria-valuemin={0}
        aria-valuemax={course.words.length}
        aria-valuenow={index + (selected !== null ? 1 : 0)}
      >
        <span
          style={{
            width: `${((index + (selected !== null ? 1 : 0)) / course.words.length) * 100}%`,
          }}
        />
      </div>
      <div className="quiz-question">
        <h3>Chọn nghĩa đúng</h3>
        <div className="quiz-term-row">
          <p className="quiz-term" lang={course.locale}>
            {word.term}
          </p>
          <PronunciationButton key={word.id} text={word.term} locale={course.locale} />
        </div>
        <WordReading reading={word.reading} locale={course.locale} className="quiz-reading" />
      </div>
      <div className="quiz-options" aria-label="Các đáp án">
        {options.map((option, optionIndex) => {
          const isCorrect = selected !== null && option.id === word.id;
          const isWrong = selected === option.id && option.id !== word.id;
          return (
            <button
              key={option.id}
              type="button"
              className={`quiz-option${isCorrect ? " is-correct" : ""}${isWrong ? " is-wrong" : ""}`}
              onClick={() => choose(option)}
              disabled={selected !== null}
              aria-label={option.meaning}
            >
              <span className="quiz-option-letter" aria-hidden="true">
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span>{option.meaning}</span>
              {isCorrect && <Check size={18} aria-hidden="true" />}
              {isWrong && <X size={18} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className={`quiz-feedback${selected === word.id ? " is-correct" : " is-wrong"}`}>
          <div role="status">
            <strong>
              {selected === word.id ? "Chính xác!" : `Chưa đúng. Đáp án là: ${word.meaning}.`}
            </strong>
            <div className="learning-example-row">
              <p lang={course.locale}>
                <HighlightedExample example={word.example} term={word.term} />
              </p>
              <PronunciationButton
                text={word.example}
                locale={course.locale}
                label={`Nghe câu ví dụ: ${word.example}`}
                className="example-pronunciation"
              />
            </div>
            <p className="quiz-translation">{word.translation}</p>
          </div>
          <button type="button" className="button" onClick={next}>
            {index === course.words.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export function CourseWorkspace({ course }: { course: Course }) {
  const [mode, setMode] = useState<LearningMode>("vocabulary");
  const vocabularyTab = useRef<HTMLButtonElement>(null);
  const practiceTab = useRef<HTMLButtonElement>(null);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const target =
      event.key === "Home"
        ? "vocabulary"
        : event.key === "End"
          ? "practice"
          : mode === "vocabulary"
            ? "practice"
            : "vocabulary";
    stopPronunciation();
    setMode(target);
    (target === "vocabulary" ? vocabularyTab : practiceTab).current?.focus();
  }

  return (
    <section className="course-workspace" aria-label={`Nội dung học ${course.name}`}>
      <div className="course-workspace-header">
        <div className="course-tabs" role="tablist" aria-label="Chế độ học">
          <button
            ref={vocabularyTab}
            id={`${course.slug}-vocabulary-tab`}
            type="button"
            role="tab"
            aria-controls={`${course.slug}-vocabulary-panel`}
            aria-selected={mode === "vocabulary"}
            tabIndex={mode === "vocabulary" ? 0 : -1}
            className={mode === "vocabulary" ? "is-active" : undefined}
            onClick={() => {
              stopPronunciation();
              setMode("vocabulary");
            }}
            onKeyDown={moveTab}
          >
            Từ vựng
          </button>
          <button
            ref={practiceTab}
            id={`${course.slug}-practice-tab`}
            type="button"
            role="tab"
            aria-controls={`${course.slug}-practice-panel`}
            aria-selected={mode === "practice"}
            tabIndex={mode === "practice" ? 0 : -1}
            className={mode === "practice" ? "is-active" : undefined}
            onClick={() => {
              stopPronunciation();
              setMode("practice");
            }}
            onKeyDown={moveTab}
          >
            Luyện tập
          </button>
        </div>
        <span className="course-workspace-label">{course.language}</span>
      </div>
      <div
        id={`${course.slug}-vocabulary-panel`}
        role="tabpanel"
        aria-labelledby={`${course.slug}-vocabulary-tab`}
        hidden={mode !== "vocabulary"}
        tabIndex={0}
      >
        <VocabularyPanel course={course} />
      </div>
      <div
        id={`${course.slug}-practice-panel`}
        role="tabpanel"
        aria-labelledby={`${course.slug}-practice-tab`}
        hidden={mode !== "practice"}
        tabIndex={0}
      >
        <PracticePanel course={course} />
      </div>
      <p className="course-session-note">
        Lượt luyện tập chỉ được giữ trong trang đang mở. Kết quả chưa được lưu vào tài khoản.
      </p>
    </section>
  );
}
