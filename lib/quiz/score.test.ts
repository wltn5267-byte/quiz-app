import { describe, expect, it } from "vitest";
import { calculateScore, formatScore, gradeQuiz } from "./score";
import type { Answer, Question } from "./types";

function makeQuestion(correctAnswer: 1 | 2 | 3 | 4): Question {
  return {
    question: "문제",
    options: ["가", "나", "다", "라"],
    correctAnswer,
    explanation: "해설",
  };
}

describe("calculateScore", () => {
  it("정답 수 ÷ 전체 × 100을 소수 첫째 자리까지 반올림한다", () => {
    expect(calculateScore(1, 3)).toBe(33.3);
    expect(calculateScore(2, 3)).toBe(66.7);
    expect(calculateScore(10, 10)).toBe(100);
    expect(calculateScore(0, 10)).toBe(0);
    expect(calculateScore(3, 10)).toBe(30);
  });
});

describe("formatScore", () => {
  it("정수는 소수점 없이, 아니면 소수 첫째 자리까지 표시한다", () => {
    expect(formatScore(30)).toBe("30");
    expect(formatScore(100)).toBe("100");
    expect(formatScore(33.3)).toBe("33.3");
  });
});

describe("gradeQuiz", () => {
  // sample-questions.json의 정답 번호와 같습니다.
  const questions = [4, 2, 1, 3, 1, 3, 2, 4, 3, 1].map((n) =>
    makeQuestion(n as 1 | 2 | 3 | 4),
  );

  it("모두 1번을 고르면 3, 5, 10번만 맞아 30점이다", () => {
    const result = gradeQuiz(questions, questions.map(() => 1));
    expect(result.correctCount).toBe(3);
    expect(result.score).toBe(30);
    expect(result.results.map((r) => r.isCorrect)).toEqual([
      false, false, true, false, true, false, false, false, false, true,
    ]);
  });

  it("모두 정답을 고르면 100점이다", () => {
    const result = gradeQuiz(questions, questions.map((q) => q.correctAnswer));
    expect(result.score).toBe(100);
    expect(result.correctCount).toBe(10);
  });

  it("고른 답을 문항별 결과에 그대로 담는다", () => {
    const answers: Answer[] = [2, null];
    const result = gradeQuiz([makeQuestion(2), makeQuestion(3)], answers);
    expect(result.results.map((r) => r.chosen)).toEqual([2, null]);
    expect(result.results[1].isCorrect).toBe(false);
    expect(result.score).toBe(50);
  });
});
