"use client";

import { useCallback, useEffect, useState } from "react";
import type { Answer, PaperSummary, PublicPaper } from "@/lib/quiz/types";
import type { QuizResult } from "@/lib/quiz/score";
import PaperListScreen from "./PaperListScreen";
import ReadyScreen from "./ReadyScreen";
import QuestionScreen from "./QuestionScreen";
import ResultScreen from "./ResultScreen";

type Step =
  | { name: "list" }
  | { name: "ready"; summary: PaperSummary; paper: PublicPaper | null; error: string | null }
  | { name: "solving"; paper: PublicPaper; index: number; answers: Answer[]; submitError: string | null }
  | { name: "submitting"; paper: PublicPaper; answers: Answer[] }
  | {
      name: "result";
      paper: PublicPaper;
      answers: Answer[];
      result: QuizResult;
      saved: boolean;
      saving: boolean;
    };

type ListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; papers: PaperSummary[] };

type SubmitResponse = { result: QuizResult; saved: boolean };

type Props = {
  studentName: string;
};

async function readMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  return typeof body?.message === "string" ? body.message : fallback;
}

/**
 * 공개된 문제지 목록 → 문항 확인 → 풀이 → 결과 순서로 화면을 바꿉니다.
 * 풀이 중에는 정답·해설이 없는 문항만 받고, 제출하면 서버가 채점·저장한 결과를 받습니다.
 */
export default function QuizApp({ studentName }: Props) {
  const [step, setStep] = useState<Step>({ name: "list" });
  const [list, setList] = useState<ListState>({ status: "loading" });

  const loadList = useCallback(async () => {
    setList({ status: "loading" });
    try {
      const response = await fetch("/api/papers", { cache: "no-store" });
      if (!response.ok) {
        setList({ status: "error", message: await readMessage(response, "문제지 목록을 불러오지 못했습니다.") });
        return;
      }
      const body = (await response.json()) as { papers: PaperSummary[] };
      setList({ status: "ready", papers: body.papers });
    } catch {
      setList({ status: "error", message: "서버와 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요." });
    }
  }, []);

  useEffect(() => {
    // 처음 화면이 열릴 때 목록을 한 번 불러옵니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadList();
  }, [loadList]);

  function goToList() {
    setStep({ name: "list" });
    void loadList();
    window.scrollTo({ top: 0 });
  }

  async function selectPaper(summary: PaperSummary) {
    setStep({ name: "ready", summary, paper: null, error: null });
    window.scrollTo({ top: 0 });
    try {
      const response = await fetch(`/api/papers/${encodeURIComponent(summary.id)}`, { cache: "no-store" });
      if (!response.ok) {
        const error = await readMessage(response, "문제지를 불러오지 못했습니다.");
        setStep({ name: "ready", summary, paper: null, error });
        return;
      }
      const paper = (await response.json()) as PublicPaper;
      setStep({ name: "ready", summary, paper, error: null });
    } catch {
      setStep({ name: "ready", summary, paper: null, error: "서버와 연결하지 못했습니다." });
    }
  }

  function startSolving(paper: PublicPaper) {
    setStep({
      name: "solving",
      paper,
      index: 0,
      answers: paper.questions.map(() => null),
      submitError: null,
    });
    window.scrollTo({ top: 0 });
  }

  /** 모든 답을 서버로 보내 채점·저장합니다. 결과 화면의 "다시 저장하기"도 이 함수를 씁니다. */
  async function submit(paper: PublicPaper, answers: Answer[]): Promise<SubmitResponse | string> {
    try {
      const response = await fetch(`/api/papers/${encodeURIComponent(paper.id)}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, answers }),
      });
      if (!response.ok) {
        return readMessage(response, "제출하지 못했습니다. 다시 시도해 주세요.");
      }
      return (await response.json()) as SubmitResponse;
    } catch {
      return "서버와 연결하지 못했습니다. 인터넷 연결을 확인하고 다시 제출해 주세요.";
    }
  }

  async function handleSubmit(paper: PublicPaper, answers: Answer[], index: number) {
    if (answers.some((a) => a === null)) return;
    setStep({ name: "submitting", paper, answers });
    const outcome = await submit(paper, answers);
    if (typeof outcome === "string") {
      setStep({ name: "solving", paper, index, answers, submitError: outcome });
      return;
    }
    setStep({ name: "result", paper, answers, result: outcome.result, saved: outcome.saved, saving: false });
    window.scrollTo({ top: 0 });
  }

  async function retrySave(current: Extract<Step, { name: "result" }>) {
    setStep({ ...current, saving: true });
    const outcome = await submit(current.paper, current.answers);
    const saved = typeof outcome !== "string" && outcome.saved;
    setStep({ ...current, saved, saving: false });
  }

  switch (step.name) {
    case "list":
      if (list.status === "loading") {
        return <p className="rounded-xl border border-border bg-card p-5 text-muted">문제지 목록을 불러오는 중입니다…</p>;
      }
      if (list.status === "error") {
        return (
          <div className="flex flex-col gap-3">
            <p role="alert" className="rounded-xl border border-danger bg-card p-4 text-danger">
              {list.message}
            </p>
            <button
              type="button"
              onClick={() => void loadList()}
              className="h-14 rounded-xl border border-border bg-card text-lg font-medium hover:bg-hover"
            >
              다시 불러오기
            </button>
          </div>
        );
      }
      return <PaperListScreen papers={list.papers} onSelect={(paper) => void selectPaper(paper)} />;

    case "ready":
      return (
        <div className="flex flex-col gap-4">
          {step.error && (
            <p role="alert" className="rounded-xl border border-danger bg-card p-4 text-danger">
              {step.error}
            </p>
          )}
          <ReadyScreen
            title={step.summary.title}
            questionCount={step.paper?.questions.length ?? step.summary.questionCount}
            startDisabled={step.paper === null}
            onStart={() => step.paper && startSolving(step.paper)}
            onBackToList={goToList}
          />
        </div>
      );

    case "solving": {
      const { paper, index, answers } = step;
      const questions = paper.questions;
      const move = (to: number) => {
        setStep({ ...step, index: to, submitError: null });
        window.scrollTo({ top: 0 });
      };
      return (
        <div className="flex flex-col gap-4">
          {step.submitError && (
            <p role="alert" className="rounded-xl border border-danger bg-card p-4 text-danger">
              {step.submitError}
            </p>
          )}
          <QuestionScreen
            key={index}
            question={questions[index]}
            index={index}
            total={questions.length}
            chosen={answers[index]}
            onChoose={(answer) => {
              const next = [...answers];
              next[index] = answer;
              setStep({ ...step, answers: next });
            }}
            onPrev={() => move(Math.max(0, index - 1))}
            onNext={() => move(Math.min(questions.length - 1, index + 1))}
            onSubmit={() => void handleSubmit(paper, answers, index)}
          />
        </div>
      );
    }

    case "submitting":
      return <p className="rounded-xl border border-border bg-card p-5 text-muted">채점하고 저장하는 중입니다…</p>;

    case "result":
      return (
        <div className="flex flex-col gap-4">
          {!step.saved && (
            <div role="alert" className="flex flex-col gap-3 rounded-xl border border-danger bg-card p-4">
              <p className="leading-7 text-danger">
                결과를 저장하지 못했습니다. 선생님이 결과를 볼 수 있도록 다시 저장해 주세요.
              </p>
              <button
                type="button"
                disabled={step.saving}
                onClick={() => void retrySave(step)}
                className="h-12 rounded-xl bg-primary font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {step.saving ? "저장하는 중…" : "다시 저장하기"}
              </button>
            </div>
          )}
          <ResultScreen
            result={step.result}
            onRetry={() => startSolving(step.paper)}
            onBackToList={goToList}
          />
        </div>
      );
  }
}
