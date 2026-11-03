"use client";

import { useState } from "react";
import type { TeacherPaper } from "@/lib/teacher/types";
import PaperUploadSection from "./PaperUploadSection";
import ResultsSection from "./ResultsSection";
import { readMessage, teacherFetch } from "./teacherFetch";

type Props = {
  email: string;
  papers: TeacherPaper[];
  onSignOut: () => void;
};

/** 로그인과 서버 확인을 마친 교사에게만 보이는 내용 */
export default function TeacherDashboard({ email, papers: initialPapers, onSignOut }: Props) {
  const [papers, setPapers] = useState(initialPapers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [resultsKey, setResultsKey] = useState(0);

  async function togglePublished(paper: TeacherPaper) {
    setBusyId(paper.id);
    setListError(null);
    try {
      const response = await teacherFetch(`/api/teacher/papers/${encodeURIComponent(paper.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !paper.published }),
      });
      if (!response.ok) {
        setListError(await readMessage(response, "공개 상태를 바꾸지 못했습니다."));
        return;
      }
      setPapers((list) =>
        list.map((p) => (p.id === paper.id ? { ...p, published: !paper.published } : p)),
      );
      setResultsKey((k) => k + 1);
    } catch {
      setListError("서버와 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-10">
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

      <PaperUploadSection
        onCreated={(paper) => {
          setPapers((list) => [...list, paper]);
          setResultsKey((k) => k + 1);
        }}
      />

      <section className="flex flex-col gap-3" aria-labelledby="teacher-papers">
        <h2 id="teacher-papers" className="text-lg font-bold">
          등록한 문제지
        </h2>
        <p className="text-sm leading-6 text-muted">
          &ldquo;공개&rdquo;인 문제지만 학생 목록에 보입니다.
        </p>
        {listError && (
          <p role="alert" className="rounded-xl border border-danger bg-card p-4 text-danger">
            {listError}
          </p>
        )}
        {papers.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-5 text-muted">
            아직 등록한 문제지가 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {papers.map((paper) => (
              <li
                key={paper.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="break-all font-semibold leading-7">{paper.title}</span>
                  <span className="text-sm text-muted">
                    {paper.questionCount}문항 ·{" "}
                    <span className={paper.published ? "font-semibold text-success" : ""}>
                      {paper.published ? "공개" : "비공개"}
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  disabled={busyId === paper.id}
                  onClick={() => void togglePublished(paper)}
                  className={`h-11 shrink-0 rounded-xl px-4 font-semibold disabled:opacity-50 ${
                    paper.published
                      ? "border border-border bg-card hover:bg-hover"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {busyId === paper.id ? "바꾸는 중…" : paper.published ? "비공개로 바꾸기" : "공개하기"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ResultsSection refreshKey={resultsKey} />
    </div>
  );
}
