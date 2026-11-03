"use client";

import { useCallback, useEffect, useState } from "react";
import { formatScore } from "@/lib/quiz/score";
import type { PaperReport } from "@/lib/teacher/types";
import { readMessage, teacherFetch } from "./teacherFetch";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; reports: PaperReport[] };

function formatTime(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 문제지별 학생 결과표와 평균 점수. 서버가 교사 계정을 확인한 뒤에만 받아옵니다. */
type Props = {
  /** 값이 바뀌면 결과표를 다시 불러옵니다(문제지 등록·공개 변경 뒤). */
  refreshKey: number;
};

export default function ResultsSection({ refreshKey }: Props) {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const response = await teacherFetch("/api/teacher/results");
      if (!response.ok) {
        setState({ status: "error", message: await readMessage(response, "결과를 불러오지 못했습니다.") });
        return;
      }
      const body = (await response.json()) as { reports: PaperReport[] };
      setState({ status: "ready", reports: body.reports });
    } catch {
      setState({ status: "error", message: "서버와 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요." });
    }
  }, []);

  useEffect(() => {
    // 처음 화면이 열릴 때 결과표를 한 번 불러옵니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load, refreshKey]);

  return (
    <section className="flex flex-col gap-3" aria-labelledby="teacher-results">
      <div className="flex items-center justify-between gap-4">
        <h2 id="teacher-results" className="text-lg font-bold">
          학생 풀이 결과
        </h2>
        <button
          type="button"
          onClick={() => void load()}
          disabled={state.status === "loading"}
          className="h-10 shrink-0 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-hover disabled:opacity-50"
        >
          새로고침
        </button>
      </div>
      <p className="text-sm leading-6 text-muted">
        같은 문제지를 같은 이름으로 다시 풀면 가장 최근 결과만 남습니다. 평균도 그 결과로 계산합니다.
      </p>

      {state.status === "loading" && (
        <p className="rounded-xl border border-border bg-card p-5 text-muted">결과를 불러오는 중입니다…</p>
      )}

      {state.status === "error" && (
        <p role="alert" className="rounded-xl border border-danger bg-card p-4 text-danger">
          {state.message}
        </p>
      )}

      {state.status === "ready" && state.reports.length === 0 && (
        <p className="rounded-xl border border-border bg-card p-5 text-muted">아직 등록한 문제지가 없습니다.</p>
      )}

      {state.status === "ready" &&
        state.reports.map((report) => (
          <article key={report.paperId} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="break-all font-semibold">{report.title}</h3>
              <p className="text-sm text-muted">
                {report.rows.length}명 · 평균{" "}
                <span className="font-semibold text-foreground">
                  {report.average === null ? "-" : `${formatScore(report.average)}점`}
                </span>
              </p>
            </div>
            {report.rows.length === 0 ? (
              <p className="text-sm text-muted">아직 제출한 학생이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead className="border-b border-border text-muted">
                    <tr>
                      <th scope="col" className="py-2 pr-3 font-medium">이름</th>
                      <th scope="col" className="py-2 pr-3 font-medium">점수</th>
                      <th scope="col" className="py-2 pr-3 font-medium">틀린 문제</th>
                      <th scope="col" className="py-2 font-medium">제출 시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row) => (
                      <tr key={row.studentName} className="border-b border-border last:border-0">
                        <td className="break-all py-2 pr-3 font-medium">{row.studentName}</td>
                        <td className="py-2 pr-3">
                          {formatScore(row.score)}점
                          <span className="text-muted"> ({row.correctCount}/{row.total})</span>
                        </td>
                        <td className="py-2 pr-3">
                          {row.wrongQuestions.length === 0 ? "없음" : `${row.wrongQuestions.join(", ")}번`}
                        </td>
                        <td className="py-2 text-muted">{formatTime(row.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ))}
    </section>
  );
}
