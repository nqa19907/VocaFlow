import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowDownRight, Languages } from "lucide-react";
import { MarketingShell } from "@/components/marketing/shell";
import { CourseWorkspace } from "@/components/learning/course-workspace";
import { courses, getCourse } from "@/lib/content/courses";

type CoursePageProps = { params: Promise<{ course: string }> };

export function generateStaticParams() {
  return courses.map((course) => ({ course: course.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const course = getCourse((await params).course);
  if (!course) notFound();

  return {
    title: `${course.name} · ${course.language}`,
    description: course.description,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = getCourse((await params).course);
  if (!course) notFound();

  return (
    <MarketingShell className={`course-shell theme-${course.theme}`}>
      <main id="main" className={`container-wide course-page theme-${course.theme}`}>
        <header className="course-hero">
          <div className="course-hero-copy">
            <span className="eyebrow">
              <Languages size={15} aria-hidden="true" /> {course.kicker}
            </span>
            <h1>{course.name}</h1>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <ul className="course-focus" aria-label="Chủ đề nội dung">
              {course.focus.map((focus) => (
                <li key={focus}>{focus}</li>
              ))}
            </ul>
          </div>
          <div className="course-hero-art" aria-hidden="true">
            <span className="course-art-label">A NEW LANGUAGE. A NEW PERSPECTIVE.</span>
            <span className="course-art-glyph" lang={course.locale}>
              {course.glyph}
            </span>
            <div className="course-art-bottom">
              <span>{course.language}</span>
              <ArrowDownRight size={28} />
            </div>
          </div>
        </header>

        <CourseWorkspace key={course.slug} course={course} />

        <p className="course-content-note">
          Nội dung thực hành do VocaFlow biên soạn, không phải đề thi chính thức.
        </p>
      </main>
    </MarketingShell>
  );
}
