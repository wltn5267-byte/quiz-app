import { createHash } from "node:crypto";
import type { Question } from "./types";

function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

/** 제목 중복 비교용 값. 앞뒤 공백, 여러 칸 공백, 대소문자 차이는 같은 제목으로 봅니다. */
export function titleKey(title: string): string {
  return normalizeText(title).toLowerCase();
}

/** 문항 내용(문제·보기·정답·해설) 중복 비교용 값. 공백 차이는 같은 내용으로 봅니다. */
export function contentHash(questions: Question[]): string {
  const normalized = questions.map((q) => [
    normalizeText(q.question),
    q.options.map(normalizeText),
    q.correctAnswer,
    normalizeText(q.explanation),
  ]);
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}
