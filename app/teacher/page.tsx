import Link from "next/link";
import { loadQuestionPapers } from "@/lib/quiz/papers";

/** 교사 화면의 기본 구조. 로그인·문제 등록·결과 조회는 다음 단계에서 연결합니다. */
export default function TeacherPage() {
  const papers = loadQuestionPapers();
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">교사 화면</h1>
          <p className="text-base leading-7 text-muted">
            문제를 등록하고 학생들의 풀이 결과를 확인하는 곳입니다.
          </p>
        </div>

        <section className="flex flex-col gap-3" aria-labelledby="teacher-papers">
          <h2 id="teacher-papers" className="text-lg font-bold">
            지금 학생에게 보이는 문제지
          </h2>
          {papers.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-5 text-muted">
              아직 준비된 문제지가 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {papers.map((paper) => (
                <li
                  key={paper.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <span className="font-semibold leading-7">{paper.title}</span>
                  <span className="shrink-0 text-sm text-muted">{paper.questions.length}문항</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="teacher-new">
          <h2 id="teacher-new" className="text-lg font-bold">
            문제 등록
          </h2>
          <p className="rounded-xl border border-dashed border-border bg-card p-5 text-muted">
            준비 중입니다. 다음 단계에서 연결됩니다.
          </p>
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="teacher-results">
          <h2 id="teacher-results" className="text-lg font-bold">
            학생 풀이 결과
          </h2>
          <p className="rounded-xl border border-dashed border-border bg-card p-5 text-muted">
            준비 중입니다. 다음 단계에서 연결됩니다.
          </p>
        </section>

        <Link
          href="/"
          className="flex h-14 items-center justify-center rounded-xl border border-border bg-card text-lg font-medium hover:bg-hover"
        >
          첫 화면으로
        </Link>
      </section>
    </main>
  );
}
