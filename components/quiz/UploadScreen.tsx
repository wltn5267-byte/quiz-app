"use client";

import { useId, useState } from "react";
import type { QuizFile } from "@/lib/quiz/types";
import { validateQuizFile } from "@/lib/quiz/validate";

type Props = {
  onLoaded: (quiz: QuizFile, fileName: string) => void;
};

export default function UploadScreen({ onLoaded }: Props) {
  const inputId = useId();
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    setBusy(true);
    setErrors([]);
    let text: string;
    try {
      text = await file.text();
    } catch {
      setErrors(["파일을 열 수 없습니다. 다시 선택해주세요."]);
      setBusy(false);
      input.value = "";
      return;
    }
    const result = validateQuizFile(text, file.size);
    setBusy(false);
    // 같은 파일을 고쳐서 다시 선택해도 변경으로 인식되도록 비웁니다.
    input.value = "";

    if (result.ok) {
      onLoaded(result.quiz, file.name);
    } else {
      setErrors(result.errors);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">문제풀이</h1>
        <p className="text-base leading-7 text-muted">
          선생님께 받은 문제 파일(JSON)을 올려주세요.
          <br />
          파일을 올리면 문제를 풀 수 있습니다.
        </p>
      </div>

      <label
        htmlFor={inputId}
        className="flex h-14 cursor-pointer items-center justify-center rounded-xl bg-primary px-6 text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {busy ? "파일 확인 중…" : "파일 선택"}
      </label>
      <input
        id={inputId}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        onChange={handleChange}
        disabled={busy}
        data-testid="quiz-file-input"
      />

      {errors.length > 0 && (
        <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-4">
          <p className="mb-2 font-semibold text-danger">이 파일로는 문제를 풀 수 없습니다.</p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">파일을 확인한 뒤 다시 선택해주세요.</p>
        </div>
      )}
    </section>
  );
}
