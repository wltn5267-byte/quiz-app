import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadQuestionPapers, parseQuestionPapers } from "./papers";

// 여러 문제지 점검용 내용은 이 점검 안에서만 쓰고, question-papers 폴더에는 넣지 않습니다.
function paper(title: string, questionText: string) {
  return JSON.stringify({
    title,
    questions: [
      {
        question: questionText,
        options: ["가", "나", "다", "라"],
        correctAnswer: 1,
        explanation: "해설",
      },
    ],
  });
}

describe("question-papers", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("실제 question-papers 폴더에서 '중학교 정보과목'을 읽는다", () => {
    const papers = loadQuestionPapers();
    const sample = papers.find((p) => p.id === "01-sample-questions.json");
    expect(sample?.title).toBe("중학교 정보과목");
    expect(sample?.questions).toHaveLength(10);
  });

  it("여러 문제지를 파일 이름 순서로 정리하고, 각 파일의 제목과 문항을 담는다", () => {
    const papers = parseQuestionPapers([
      { fileName: "10-b.json", text: paper("나중 제목", "B 문제") },
      { fileName: "02-a.json", text: paper("가장 첫 제목", "A 문제") },
    ]);
    expect(papers.map((p) => [p.id, p.title, p.questions[0].question])).toEqual([
      ["02-a.json", "가장 첫 제목", "A 문제"],
      ["10-b.json", "나중 제목", "B 문제"],
    ]);
  });

  it("형식이 잘못되었거나 제목이 없는 파일은 목록에서 빼고 이유를 기록한다", () => {
    const papers = parseQuestionPapers([
      { fileName: "good.json", text: paper("정상", "문제") },
      { fileName: "broken.json", text: "{ 잘못된 JSON" },
      {
        fileName: "no-title.json",
        text: JSON.stringify({ questions: JSON.parse(paper("x", "문제")).questions }),
      },
    ]);
    expect(papers.map((p) => p.id)).toEqual(["good.json"]);
    expect(console.warn).toHaveBeenCalledTimes(2);
  });
});
