import Link from "next/link";

/** 첫 화면: 교사와 학생 중 하나를 고릅니다. */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">문제풀이</h1>
          <p className="text-base leading-7 text-muted">어떻게 시작할지 골라주세요.</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/teacher"
            className="flex min-h-16 items-center justify-between gap-4 rounded-xl border-2 border-border bg-card p-4 transition-colors hover:border-primary hover:bg-hover"
          >
            <span className="text-lg font-semibold">교사로 시작하기</span>
            <span className="shrink-0 text-muted">›</span>
          </Link>
          <Link
            href="/student"
            className="flex min-h-16 items-center justify-between gap-4 rounded-xl border-2 border-border bg-card p-4 transition-colors hover:border-primary hover:bg-hover"
          >
            <span className="text-lg font-semibold">학생으로 시작하기</span>
            <span className="shrink-0 text-muted">›</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
