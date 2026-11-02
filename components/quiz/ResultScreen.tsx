"use client";

import type { QuizResult } from "@/lib/quiz/score";
import { formatScore } from "@/lib/quiz/score";

type Props = {
  result: QuizResult;
  onRetry: () => void;
  onBackToList: () => void;
};

export default function ResultScreen({ result, onRetry, onBackToList }: Props) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-muted">내 점수</p>
        <p className="text-5xl font-bold" data-testid="total-score">
          {formatScore(result.score)}점
        </p>
        <p className="text-muted">
          {result.total}문항 중 {result.correctCount}개 정답
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {result.results.map(({ question, chosen, isCorrect }, i) => (
          <li
            key={i}
            className={`flex flex-col gap-3 rounded-xl border-2 p-4 ${
              isCorrect ? "border-success/50" : "border-danger/50"
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-sm font-bold ${
                  isCorrect ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                }`}
              >
                {i + 1}번 {isCorrect ? "⭕ 정답" : "❌ 오답"}
              </span>
            </div>
            <p className="font-semibold leading-7">{question.question}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm leading-6">
              <dt className="text-muted">내가 고른 답</dt>
              <dd className={isCorrect ? "text-success" : "text-danger"}>
                {chosen === null ? "답하지 않음" : `${chosen}. ${question.options[chosen - 1]}`}
              </dd>
              <dt className="text-muted">정답</dt>
              <dd className="font-medium">
                {question.correctAnswer}. {question.options[question.correctAnswer - 1]}
              </dd>
            </dl>
            <div className="rounded-lg bg-hover p-3 text-sm leading-6">
              <span className="font-semibold">해설 </span>
              {question.explanation}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="h-14 flex-1 rounded-xl bg-primary text-lg font-semibold text-primary-foreground hover:opacity-90"
        >
          다시 풀기
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
