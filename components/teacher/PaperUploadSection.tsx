"use client";

import { useRef, useState } from "react";
import { validateQuizFile } from "@/lib/quiz/validate";
import type { QuizFile } from "@/lib/quiz/types";
import type { TeacherPaper } from "@/lib/teacher/types";
import { teacherFetch } from "./teacherFetch";

const MAX_FILE_SIZE = 1024 * 1024;

type State =
  | { name: "idle" }
  | { name: "invalid"; fileName: string; errors: string[] }
  | { name: "preview"; fileName: string; text: string; quiz: QuizFile; error: string | null }
  | { name: "saving"; fileName: string; text: string; quiz: QuizFile }
  | { name: "saved"; title: string };

type Props = {
  onCreated: (paper: TeacherPaper) => void;
};

/** 문제지 JSON 파일을 골라 내용을 확인한 뒤 비공개로 등록합니다. */
export default function PaperUploadSection({ onCreated }: Props) {
  const [state, setState] = useState<State>({ name: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setState({ name: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      setState({ name: "invalid", fileName: file.name, errors: ["JSON 파일(.json)만 올릴 수 있습니다."] });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setState({ name: "invalid", fileName: file.name, errors: ["파일이 너무 큽니다. 1MB 이하 파일만 올릴 수 있습니다."] });
      return;
    }
    const text = await file.text();
    const checked = validateQuizFile(text);
    if (!checked.ok) {
      setState({ name: "invalid", fileName: file.name, errors: checked.errors });
      return;
    }
    setState({ name: "preview", fileName: file.name, text, quiz: checked.quiz, error: null });
  }

  async function save(current: Extract<State, { name: "preview" }>) {
    setState({ name: "saving", fileName: current.fileName, text: current.text, quiz: current.quiz });
    try {
      const response = await teacherFetch("/api/teacher/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: current.text }),
      });
      if (response.status === 201) {
        const body = (await response.json()) as { paper: TeacherPaper };
        onCreated(body.paper);
        setState({ name: "saved", title: body.paper.title });
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      const body = await response.json().catch(() => null);
      const errors: string[] = Array.isArray(body?.errors) ? body.errors : [];
      const message = typeof body?.message === "string" ? body.message : "등록하지 못했습니다.";
      setState({ ...current, error: [message, ...errors].join("\n") });
    } catch {
      setState({ ...current, error: "서버와 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요." });
    }
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="teacher-upload">
      <h2 id="teacher-upload" className="text-lg font-bold">
        문제지 등록
      </h2>
      <p className="text-sm leading-6 text-muted">
        문제지 JSON 파일을 고르면 내용을 먼저 보여줍니다. 등록한 문제지는 비공개로 저장되고, 아래 목록에서
        공개할 수 있습니다.
      </p>

      <label className="flex h-14 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-card font-medium hover:border-primary hover:bg-hover">
        JSON 파일 고르기
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </label>

      {state.name === "invalid" && (
        <div role="alert" className="flex flex-col gap-2 rounded-xl border border-danger bg-card p-4">
          <p className="break-all font-semibold text-danger">
            {state.fileName} 파일을 등록할 수 없습니다.
          </p>
          <ul className="list-disc pl-5 text-sm leading-6 text-danger">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {state.name === "saved" && (
        <p role="status" className="rounded-xl border border-success bg-card p-4 text-success">
          &ldquo;{state.title}&rdquo; 문제지를 비공개로 등록했습니다. 아래 목록에서 &ldquo;공개하기&rdquo;를 누르면
          학생에게 보입니다.
        </p>
      )}

      {(state.name === "preview" || state.name === "saving") && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-muted">파일</dt>
            <dd className="break-all">{state.fileName}</dd>
            <dt className="text-muted">제목</dt>
            <dd className="break-all font-semibold">{state.quiz.title}</dd>
            <dt className="text-muted">문항 수</dt>
            <dd>{state.quiz.questions.length}문항</dd>
          </dl>

          <details className="rounded-lg bg-hover p-3">
            <summary className="cursor-pointer font-medium">문항 내용 펼쳐 보기</summary>
            <ol className="mt-3 flex flex-col gap-3 text-sm leading-6">
              {state.quiz.questions.map((q, i) => (
                <li key={i}>
                  <p className="font-semibold">
                    {i + 1}. {q.question}
                  </p>
                  <p className="text-muted">
                    {q.options.map((option, j) => `${j + 1}) ${option}`).join("  ")}
                  </p>
                  <p>정답 {q.correctAnswer}번</p>
                </li>
              ))}
            </ol>
          </details>

          {state.name === "preview" && state.error && (
            <p role="alert" className="whitespace-pre-line rounded-lg border border-danger p-3 text-danger">
              {state.error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={state.name === "saving"}
              onClick={() => state.name === "preview" && void save(state)}
              className="h-12 flex-1 rounded-xl bg-primary font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {state.name === "saving" ? "등록하는 중…" : "등록하기"}
            </button>
            <button
              type="button"
              disabled={state.name === "saving"}
              onClick={reset}
              className="h-12 flex-1 rounded-xl border border-border bg-card font-medium hover:bg-hover disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

