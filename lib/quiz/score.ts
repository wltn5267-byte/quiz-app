import type { Answer, Question } from "./types";

export type QuestionResult = {
  question: Question;
  chosen: Answer;
  isCorrect: boolean;
};

export type QuizResult = {
  results: QuestionResult[];
  correctCount: number;
  total: number;
  /** 100점 만점, 소수 첫째 자리까지 반올림한 점수 */
  score: number;
};

/** 정답 수 ÷ 전체 문항 수 × 100 을 소수 첫째 자리까지 반올림합니다. */
export function calculateScore(correctCount: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correctCount / total) * 1000) / 10;
}

export function gradeQuiz(questions: Question[], answers: Answer[]): QuizResult {
  const results = questions.map((question, i) => {
    const chosen = answers[i] ?? null;
    return { question, chosen, isCorrect: chosen === question.correctAnswer };
  });
  const correctCount = results.filter((r) => r.isCorrect).length;
  return {
    results,
    correctCount,
    total: questions.length,
    score: calculateScore(correctCount, questions.length),
  };
}

/** 점수를 화면용 문자열로 바꿉니다. 예: 30 → "30", 33.3 → "33.3" */
export function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}
