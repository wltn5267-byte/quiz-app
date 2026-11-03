import { describe, expect, it } from "vitest";
import { gradeQuiz } from "./score";
import { averageScore, parseSubmittedAnswers, toPublicQuestions, wrongQuestionNumbers } from "./submission";
import type { Question } from "./types";

const questions: Question[] = [
  { question: "문제1", options: ["가", "나", "다", "라"], correctAnswer: 1, explanation: "해설1" },
  { question: "문제2", options: ["가", "나", "다", "라"], correctAnswer: 2, explanation: "해설2" },
  { question: "문제3", options: ["가", "나", "다", "라"], correctAnswer: 3, explanation: "해설3" },
];

describe("toPublicQuestions", () => {
  it("정답과 해설을 뺀다", () => {
    const result = toPublicQuestions(questions);
    expect(result[0]).toEqual({ question: "문제1", options: ["가", "나", "다", "라"] });
    expect(JSON.stringify(result)).not.toContain("해설");
    expect(JSON.stringify(result)).not.toContain("correctAnswer");
  });
});

describe("parseSubmittedAnswers", () => {
  it("문항 수만큼 1~4가 있으면 받아들인다", () => {
    expect(parseSubmittedAnswers([1, 4, 2], 3)).toEqual([1, 4, 2]);
  });

  it("개수가 다르거나 범위를 벗어나거나 빈 답이 있으면 거절한다", () => {
    expect(parseSubmittedAnswers([1, 2], 3)).toBeNull();
    expect(parseSubmittedAnswers([1, 2, 5], 3)).toBeNull();
    expect(parseSubmittedAnswers([1, null, 2], 3)).toBeNull();
    expect(parseSubmittedAnswers(["1", 2, 3], 3)).toBeNull();
    expect(parseSubmittedAnswers("1,2,3", 3)).toBeNull();
  });
});

describe("wrongQuestionNumbers", () => {
  it("틀린 문항 번호를 1부터 센다", () => {
    expect(wrongQuestionNumbers(gradeQuiz(questions, [1, 3, 4]))).toEqual([2, 3]);
    expect(wrongQuestionNumbers(gradeQuiz(questions, [1, 2, 3]))).toEqual([]);
  });
});

describe("averageScore", () => {
  it("소수 첫째 자리까지 반올림한 평균을 낸다", () => {
    expect(averageScore([100, 50, 33.3])).toBe(61.1);
    expect(averageScore([70])).toBe(70);
  });

  it("점수가 없으면 null", () => {
    expect(averageScore([])).toBeNull();
  });
});
