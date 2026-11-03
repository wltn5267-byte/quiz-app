"use client";

import { useState } from "react";
import Link from "next/link";
import QuizApp from "@/components/quiz/QuizApp";
import NameEntryScreen from "./NameEntryScreen";

/** 학생 이름을 받은 뒤 문제풀이로 넘어갑니다. 이름은 저장하지 않으므로 새로고침하면 다시 입력합니다. */
export default function StudentApp() {
  const [name, setName] = useState<string | null>(null);

  if (name === null) {
    return <NameEntryScreen onEnter={setName} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3">
        <p className="min-w-0 break-all">
          <span className="text-muted">학생 </span>
          <span className="font-semibold">{name}</span>
        </p>
        <Link href="/" className="shrink-0 text-sm text-muted underline hover:text-foreground">
          첫 화면으로
        </Link>
      </div>
      <QuizApp studentName={name} />
    </div>
  );
}
