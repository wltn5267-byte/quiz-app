import type { Question, QuizFile } from "./types";

export const MAX_FILE_BYTES = 1024 * 1024;

export type ValidationResult =
  | { ok: true; quiz: QuizFile }
  | { ok: false; errors: string[] };

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * 업로드한 문제 파일의 내용이 PRD.md의 규칙에 맞는지 검사합니다.
 * 오류 메시지는 화면에 그대로 보여줄 수 있는 쉬운 한국어로 만듭니다.
 */
export function validateQuizFile(text: string, sizeInBytes: number): ValidationResult {
  if (sizeInBytes > MAX_FILE_BYTES) {
    return { ok: false, errors: ["파일이 너무 큽니다. 1MB 이하의 파일을 올려주세요."] };
  }

  let data: unknown;
  try {
    data = JSON.parse(text.replace(/^﻿/, ""));
  } catch {
    return {
      ok: false,
      errors: ["파일 내용을 읽을 수 없습니다. 올바른 JSON 문제 파일인지 확인해주세요."],
    };
  }

  const questions = (data as { questions?: unknown } | null)?.questions;
  if (typeof data !== "object" || data === null || !Array.isArray(questions)) {
    return { ok: false, errors: ['파일에 문항 목록("questions")이 없습니다.'] };
  }
  if (questions.length === 0) {
    return { ok: false, errors: ["파일에 문항이 하나도 없습니다."] };
  }

  const errors: string[] = [];
  questions.forEach((item: unknown, index) => {
    const n = index + 1;
    if (typeof item !== "object" || item === null) {
      errors.push(`${n}번 문항의 형식이 올바르지 않습니다.`);
      return;
    }
    const q = item as Record<string, unknown>;
    if (!isFilledString(q.question)) {
      errors.push(`${n}번 문항의 문제 내용이 비어 있습니다.`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`${n}번 문항의 보기가 4개가 아닙니다.`);
    } else if (!q.options.every(isFilledString)) {
      errors.push(`${n}번 문항에 비어 있는 보기가 있습니다.`);
    }
    if (
      typeof q.correctAnswer !== "number" ||
      !Number.isInteger(q.correctAnswer) ||
      q.correctAnswer < 1 ||
      q.correctAnswer > 4
    ) {
      errors.push(`${n}번 문항의 정답 번호는 1부터 4 사이의 숫자여야 합니다.`);
    }
    if (!isFilledString(q.explanation)) {
      errors.push(`${n}번 문항의 해설이 비어 있습니다.`);
    }
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const quiz: QuizFile = {
    questions: (questions as Question[]).map((q) => ({
      question: q.question,
      options: [q.options[0], q.options[1], q.options[2], q.options[3]],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    })),
  };
  return { ok: true, quiz };
}
