"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, RotateCcw, Sparkles } from "lucide-react";
import { courses } from "@/lib/content/courses";
import { PronunciationButton } from "@/components/learning/pronunciation-button";
import { WordReading } from "@/components/learning/word-reading";
import { HighlightedExample } from "@/components/learning/highlighted-example";
import { stopPronunciation } from "@/lib/speech/browser";

const languages = [
  { slug: "topik", label: "Tiếng Hàn" },
  { slug: "ielts", label: "Tiếng Anh" },
  { slug: "hsk", label: "Tiếng Trung" },
] as const;

export function SampleCard() {
  const [selected, setSelected] = useState<string>("topik");
  const [flipped, setFlipped] = useState(false);
  const course = courses.find(({ slug }) => slug === selected)!;
  const word = course.words[0];
  return (
    <div className={`sample-scene multilingual-scene theme-${course.theme}`}>
      <span className="scene-language" aria-hidden="true">
        가 <ArrowUpRight size={14} /> A <ArrowUpRight size={14} /> 字
      </span>
      <span className="scene-spark" aria-hidden="true">
        ✳
      </span>
      <div className="sample-decoration decoration-one" aria-hidden="true" />
      <div className="sample-decoration decoration-two" aria-hidden="true" />
      <div className="sample-card">
        <div className="sample-meta">
          <span className="eyebrow text-primary">
            <Sparkles size={14} /> MỘT TỪ MỚI HÔM NAY
          </span>
          <span className="chip">{course.name}</span>
        </div>
        <div className="sample-language-tabs" aria-label="Chọn ngôn ngữ">
          {languages.map(({ slug, label }) => (
            <button
              key={slug}
              type="button"
              aria-pressed={selected === slug}
              onClick={() => {
                stopPronunciation();
                setSelected(slug);
                setFlipped(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="sample-word">
          <div className="sample-word-row">
            <h2 lang={course.locale}>{word.term}</h2>
            <PronunciationButton key={course.slug} text={word.term} locale={course.locale} />
          </div>
          <WordReading reading={word.reading} locale={course.locale} className="sample-reading" />
        </div>
        <div className="sample-learning-content" aria-live="polite">
          {flipped ? (
            <>
              <span className="field-caption">NGHĨA TIẾNG VIỆT</span>
              <p className="meaning">{word.meaning}</p>
              <p className="example" lang={course.locale}>
                <HighlightedExample example={word.example} term={word.term} />
              </p>
              <p className="sample-translation">{word.translation}</p>
            </>
          ) : (
            <>
              <span className="field-caption">TRONG NGỮ CẢNH</span>
              <p className="sample-context" lang={course.locale}>
                <HighlightedExample example={word.example} term={word.term} />
              </p>
              <span className="sample-card-hint">Một từ nhỏ. Một kết nối mới.</span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFlipped(!flipped)}
          className="flip-button"
          aria-pressed={flipped}
        >
          <RotateCcw size={16} />
          {flipped ? "Xem mặt trước" : "Lật thẻ để khám phá"}
          <ArrowUpRight size={16} className="ml-auto" />
        </button>
        <Link className="sample-course-link" href={`/${course.slug}`}>
          Tiếp tục với {course.name} <ArrowRight size={14} />
        </Link>
      </div>
      <div className="floating-note">
        <span className="note-icon">✦</span>
        <div>
          <strong>Chào một thế giới mới.</strong>
          <span>한국어 · English · 中文</span>
        </div>
      </div>
    </div>
  );
}
