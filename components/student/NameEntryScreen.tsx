"use client";

import { useState } from "react";
import Link from "next/link";
import { checkStudentName, STUDENT_NAME_MAX_LENGTH } from "@/lib/quiz/student";

type Props = {
  onEnter: (name: string) => void;
};

export default function NameEntryScreen({ onEnter }: Props) {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const check = checkStudentName(input);
    if (!check.ok) {
      setMessage(check.message);
      return;
    }
    onEnter(check.name);
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">학생으로 시작하기</h1>
        <p className="text-base leading-7 text-muted">이름을 입력하고 들어가세요.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <label htmlFor="student-name" className="font-medium">
          이름
        </label>
        <input
          id="student-name"
          type="text"
          value={input}
          maxLength={STUDENT_NAME_MAX_LENGTH}
          autoComplete="off"
          placeholder="예: 홍길동"
          aria-invalid={message !== null}
          aria-describedby={message ? "student-name-message" : undefined}
          onChange={(event) => {
            setInput(event.target.value);
            setMessage(null);
          }}
          className="h-14 rounded-xl border-2 border-border bg-card px-4 text-lg outline-none focus:border-primary aria-invalid:border-danger"
        />
        {message && (
          <p id="student-name-message" role="alert" className="text-danger">
            {message}
          </p>
        )}
        <button
          type="submit"
          className="mt-2 h-14 rounded-xl bg-primary text-lg font-semibold text-primary-foreground hover:opacity-90"
        >
          들어가기
        </button>
      </form>

      <Link
        href="/"
        className="flex h-14 items-center justify-center rounded-xl border border-border bg-card text-lg font-medium hover:bg-hover"
      >
        첫 화면으로
      </Link>
    </section>
  );
}
