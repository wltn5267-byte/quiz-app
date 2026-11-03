import { describe, expect, it } from "vitest";
import { contentHash, titleKey } from "./fingerprint";
import type { Question } from "./types";

const base: Question = {
  question: "문제",
  options: ["가", "나", "다", "라"],
  correctAnswer: 1,
  explanation: "해설",
};

describe("titleKey", () => {
  it("공백과 대소문자 차이는 같은 제목으로 본다", () => {
    expect(titleKey("  중학교   정보과목 ")).toBe(titleKey("중학교 정보과목"));
    expect(titleKey("Quiz A")).toBe(titleKey("quiz a"));
  });
});

describe("contentHash", () => {
  it("공백 차이만 있으면 같은 값", () => {
    expect(contentHash([{ ...base, question: " 문제  " }])).toBe(contentHash([base]));
  });

  it("정답이나 보기가 다르면 다른 값", () => {
    expect(contentHash([{ ...base, correctAnswer: 2 }])).not.toBe(contentHash([base]));
    expect(contentHash([{ ...base, options: ["가", "나", "다", "마"] }])).not.toBe(
      contentHash([base]),
    );
  });
});
