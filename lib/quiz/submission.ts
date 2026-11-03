import type { QuizResult } from "./score";
import type { Answer, PublicQuestion, Question } from "./types";

/** 학생에게 보낼 문항. 정답과 해설을 뺍니다. */
export function toPublicQuestions(questions: Question[]): PublicQuestion[] {
  return questions.map(({ question, options }) => ({ question, options }));
}

/** 제출된 답이 문항 수만큼 있고 모두 1~4인지 확인합니다. 아니면 null을 돌려줍니다. */
export function parseSubmittedAnswers(
  value: unknown,
  questionCount: number,
): Exclude<Answer, null>[] | null {
  if (!Array.isArray(value) || value.length !== questionCount) return null;
  const valid = value.every((a) => a === 1 || a === 2 || a === 3 || a === 4);
  return valid ? (value as Exclude<Answer, null>[]) : null;
}

/** 틀린 문항 번호(1부터)를 돌려줍니다. */
export function wrongQuestionNumbers(result: QuizResult): number[] {
  return result.results.flatMap((r, i) => (r.isCorrect ? [] : [i + 1]));
}

/** 점수들의 평균을 소수 첫째 자리까지 반올림합니다. 점수가 없으면 null입니다. */
export function averageScore(scores: number[]): number | null {
  if (scores.length === 0) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}
