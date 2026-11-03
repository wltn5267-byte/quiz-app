"use client";

import type { PaperSummary } from "@/lib/quiz/types";

type Props = {
  papers: PaperSummary[];
  onSelect: (paper: PaperSummary) => void;
};

export default function PaperListScreen({ papers, onSelect }: Props) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">문제풀이</h1>
        <p className="text-base leading-7 text-muted">풀고 싶은 문제지를 골라주세요.</p>
      </div>

      {papers.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-5 text-muted">
          아직 준비된 문제지가 없습니다. 선생님께 문의해주세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {papers.map((paper) => (
            <li key={paper.id}>
              <button
                type="button"
                onClick={() => onSelect(paper)}
                className="flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border-2 border-border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-hover"
              >
                <span className="text-lg font-semibold leading-7">{paper.title}</span>
                <span className="shrink-0 text-sm text-muted">
                  {paper.questionCount}문항 ›
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
