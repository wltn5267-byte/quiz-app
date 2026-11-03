"use client";

import type { Answer, PublicQuestion } from "@/lib/quiz/types";

type Props = {
  question: PublicQuestion;
  index: number;
  total: number;
  chosen: Answer;
  onChoose: (answer: Exclude<Answer, null>) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export default function QuestionScreen({
  question,
  index,
  total,
  chosen,
  onChoose,
  onPrev,
  onNext,
  onSubmit,
}: Props) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-muted" aria-live="polite">
          {index + 1} / {total}
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-hover">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-bold leading-8">{question.question}</h2>

      <div role="radiogroup" aria-label="보기" className="flex flex-col gap-3">
        {question.options.map((option, i) => {
          const number = (i + 1) as 1 | 2 | 3 | 4;
          const selected = chosen === number;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChoose(number)}
              className={`flex min-h-14 items-start gap-3 rounded-xl border-2 p-4 text-left text-base leading-7 transition-colors ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:bg-hover"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  selected ? "bg-primary text-primary-foreground" : "bg-hover"
                }`}
              >
                {number}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="h-14 flex-1 rounded-xl border border-border bg-card text-lg font-medium hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          이전
        </button>
        <button
          type="button"
          onClick={isLast ? onSubmit : onNext}
          disabled={chosen === null}
          className="h-14 flex-1 rounded-xl bg-primary text-lg font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLast ? "제출" : "다음"}
        </button>
      </div>
      {chosen === null && (
        <p className="text-center text-sm text-muted">
          보기를 하나 고르면 &ldquo;{isLast ? "제출" : "다음"}&rdquo; 버튼을 누를 수 있습니다.
        </p>
      )}
    </section>
  );
}
