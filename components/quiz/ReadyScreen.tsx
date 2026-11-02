"use client";

type Props = {
  title: string;
  questionCount: number;
  onStart: () => void;
  onBackToList: () => void;
};

export default function ReadyScreen({ title, questionCount, onStart, onBackToList }: Props) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">문제를 풀 준비가 되었습니다</h1>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl border border-border bg-card p-5">
        <dt className="text-muted">문제지</dt>
        <dd className="break-all font-medium">{title}</dd>
        <dt className="text-muted">문항 수</dt>
        <dd className="font-medium">총 {questionCount}문항</dd>
      </dl>

      <p className="text-sm leading-6 text-muted">
        모든 문항에 답한 뒤 &ldquo;제출&rdquo;을 누르면 점수와 해설을 볼 수 있습니다.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onStart}
          className="h-14 flex-1 rounded-xl bg-primary text-lg font-semibold text-primary-foreground hover:opacity-90"
        >
          시작
        </button>
        <button
          type="button"
          onClick={onBackToList}
          className="h-14 flex-1 rounded-xl border border-border bg-card text-lg font-medium hover:bg-hover"
        >
          문제지 목록으로
        </button>
      </div>
    </section>
  );
}
