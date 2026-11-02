import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MAX_FILE_BYTES, validateQuizFile } from "./validate";

const validQuestion = {
  question: "1 + 1은?",
  options: ["1", "2", "3", "4"],
  correctAnswer: 2,
  explanation: "1에 1을 더하면 2입니다.",
};

function check(data: unknown) {
  const text = JSON.stringify(data);
  return validateQuizFile(text, text.length);
}

describe("validateQuizFile", () => {
  it("예시 파일 sample-questions.json의 10문항을 그대로 받아들인다", () => {
    const text = readFileSync(join(process.cwd(), "sample-questions.json"), "utf8");
    const result = validateQuizFile(text, Buffer.byteLength(text));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.quiz.questions).toHaveLength(10);
      expect(result.quiz.questions[0].correctAnswer).toBe(4);
    }
  });

  it("앞에 BOM이 붙은 파일도 읽는다", () => {
    const text = "﻿" + JSON.stringify({ questions: [validQuestion] });
    expect(validateQuizFile(text, text.length).ok).toBe(true);
  });

  it("1MB를 넘는 파일은 거부한다", () => {
    const text = JSON.stringify({ questions: [validQuestion] });
    expect(validateQuizFile(text, MAX_FILE_BYTES + 1)).toEqual({
      ok: false,
      errors: ["파일이 너무 큽니다. 1MB 이하의 파일을 올려주세요."],
    });
  });

  it("JSON 문법 오류를 알려준다", () => {
    const result = validateQuizFile("{ questions: [", 14);
    expect(result).toEqual({
      ok: false,
      errors: ["파일 내용을 읽을 수 없습니다. 올바른 JSON 문제 파일인지 확인해주세요."],
    });
  });

  it("questions가 없거나 배열이 아니면 거부한다", () => {
    expect(check({})).toMatchObject({ ok: false });
    expect(check({ questions: "abc" })).toMatchObject({ ok: false });
    expect(check([validQuestion])).toMatchObject({ ok: false });
    expect(check(null)).toMatchObject({ ok: false });
  });

  it("문항이 하나도 없으면 거부한다", () => {
    expect(check({ questions: [] })).toEqual({
      ok: false,
      errors: ["파일에 문항이 하나도 없습니다."],
    });
  });

  it("보기가 4개가 아니면 몇 번 문항인지 알려준다", () => {
    const result = check({
      questions: [validQuestion, { ...validQuestion, options: ["a", "b", "c"] }],
    });
    expect(result).toEqual({ ok: false, errors: ["2번 문항의 보기가 4개가 아닙니다."] });
  });

  it("정답 번호가 1~4 정수가 아니면 거부한다", () => {
    for (const correctAnswer of [0, 5, 2.5, "2", null]) {
      const result = check({ questions: [{ ...validQuestion, correctAnswer }] });
      expect(result).toEqual({
        ok: false,
        errors: ["1번 문항의 정답 번호는 1부터 4 사이의 숫자여야 합니다."],
      });
    }
  });

  it("문제·해설·보기가 비어 있으면 거부한다", () => {
    const result = check({
      questions: [
        { ...validQuestion, question: "  " },
        { ...validQuestion, explanation: "" },
        { ...validQuestion, options: ["a", "", "c", "d"] },
      ],
    });
    expect(result).toEqual({
      ok: false,
      errors: [
        "1번 문항의 문제 내용이 비어 있습니다.",
        "2번 문항의 해설이 비어 있습니다.",
        "3번 문항에 비어 있는 보기가 있습니다.",
      ],
    });
  });

  it("문항 순서와 보기 순서를 바꾸지 않는다", () => {
    const second = { ...validQuestion, question: "두 번째", options: ["d", "c", "b", "a"] };
    const result = check({ questions: [validQuestion, second] });
    expect(result.ok && result.quiz.questions.map((q) => q.question)).toEqual([
      "1 + 1은?",
      "두 번째",
    ]);
    expect(result.ok && result.quiz.questions[1].options).toEqual(["d", "c", "b", "a"]);
  });
});
