import Link from "next/link";
import { ArrowRight, ArrowUpRight, Globe2, Languages, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/shell";
import { SampleCard } from "@/components/vocabulary/sample-card";
import { courses } from "@/lib/content/courses";

export default function Home() {
  return (
    <MarketingShell>
      <main id="main" className="container-wide home-main multilingual-home">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-label">
              <span /> TIẾNG HÀN · TIẾNG ANH · TIẾNG TRUNG
            </span>
            <h1>
              Một nền tảng.
              <br />
              <span className="highlight">Nhiều ngôn ngữ.</span>
            </h1>
            <p className="hero-description">
              Từ tiếng Hàn đầu tiên đến vốn từ học thuật tiếng Anh. Chọn TOPIK, IELTS hoặc HSK
              và bắt đầu với những bài học dành cho mục tiêu của bạn.
            </p>
            <div className="hero-actions">
              <Link href="/topik" className="button large">
                Học TOPIK <ArrowRight size={17} />
              </Link>
              <Link href="/ielts" className="button secondary large">
                Khám phá IELTS <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="hero-languages" aria-label="Ngôn ngữ trên VocaFlow">
              <span lang="ko">안녕하세요</span>
              <i aria-hidden="true" />
              <span lang="en">Hello</span>
              <i aria-hidden="true" />
              <span lang="zh-Hans">你好</span>
            </div>
          </div>
          <SampleCard />
        </section>

        <section className="program-section" aria-labelledby="program-heading">
          <div className="section-heading">
            <div>
              <span className="eyebrow text-primary">
                <Globe2 size={14} /> CHỌN MỤC TIÊU CỦA BẠN
              </span>
              <h2 id="program-heading">Bạn muốn bắt đầu với điều gì?</h2>
            </div>
            <p>
              Ba ngôn ngữ. Ba mục tiêu.
              <br />
              Một nơi để bắt đầu.
            </p>
          </div>
          <div className="program-grid">
            {courses.map((course) => (
              <Link
                key={course.slug}
                href={`/${course.slug}`}
                className={`program-card theme-${course.theme}`}
                aria-label={`Học ${course.name} · ${course.language}`}
              >
                <div className="program-card-top">
                  <span className="program-language">{course.language}</span>
                  <ArrowUpRight size={19} />
                </div>
                <div className="program-glyph" lang={course.locale} aria-hidden="true">
                  {course.glyph}
                </div>
                <h3>{course.name}</h3>
                <p>{course.description}</p>
                <div className="program-tags">
                  {course.focus.map((focus) => (
                    <span key={focus}>{focus}</span>
                  ))}
                </div>
                <div className="program-card-bottom">
                  Vào bài học <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="language-banner" aria-label="VocaFlow đa ngôn ngữ">
          <div className="language-banner-icon">
            <Languages size={28} strokeWidth={1.4} />
          </div>
          <div>
            <span className="eyebrow">MỞ THÊM MỘT NGÔN NGỮ</span>
            <h2>Thêm một cách để kết nối với thế giới.</h2>
            <p>Từ vựng có ví dụ, thẻ tương tác và bài tập ngay trong từng chương trình.</p>
          </div>
          <Sparkles size={28} className="language-banner-spark" aria-hidden="true" />
        </section>
      </main>
    </MarketingShell>
  );
}
