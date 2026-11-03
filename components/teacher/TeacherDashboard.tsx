"use client";

export type TeacherPaper = { id: string; title: string; questionCount: number };

type Props = {
  email: string;
  papers: TeacherPaper[];
  onSignOut: () => void;
};

/** 로그인과 서버 확인을 마친 교사에게만 보이는 내용 */
export default function TeacherDashboard({ email, papers, onSignOut }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3">
        <p className="min-w-0 break-all">
          <span className="text-muted">교사 </span>
          <span className="font-semibold">{email}</span>
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="shrink-0 text-sm text-muted underline hover:text-foreground"
        >
          로그아웃
        </button>
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
                <span className="shrink-0 text-sm text-muted">{paper.questionCount}문항</span>
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
    </div>
  );
}
