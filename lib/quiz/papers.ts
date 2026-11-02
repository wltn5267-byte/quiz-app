import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { QuestionPaper } from "./types";
import { validateQuizFile } from "./validate";

export type PaperFile = { fileName: string; text: string };

/**
 * 문제지 파일들을 파일 이름 순서로 정리하고 검사합니다.
 * 형식이 잘못된 파일은 목록에서 빼고, 이유를 서버 기록(콘솔)에만 남깁니다.
 */
export function parseQuestionPapers(files: PaperFile[]): QuestionPaper[] {
  const papers: QuestionPaper[] = [];
  const sorted = [...files].sort((a, b) =>
    a.fileName.localeCompare(b.fileName, "ko", { numeric: true }),
  );
  for (const { fileName, text } of sorted) {
    const result = validateQuizFile(text);
    if (result.ok) {
      papers.push({ id: fileName, ...result.quiz });
    } else {
      console.warn(`[문제지] ${fileName} 파일을 목록에서 뺐습니다: ${result.errors.join(" / ")}`);
    }
  }
  return papers;
}

/** 프로젝트의 question-papers 폴더에서 JSON 문제지를 모두 읽습니다. */
export function loadQuestionPapers(): QuestionPaper[] {
  let fileNames: string[];
  try {
    fileNames = readdirSync(join(process.cwd(), "question-papers"), { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
      .map((entry) => entry.name);
  } catch {
    console.warn("[문제지] question-papers 폴더를 읽을 수 없습니다.");
    return [];
  }
  return parseQuestionPapers(
    fileNames.map((fileName) => ({
      fileName,
      text: readFileSync(join(process.cwd(), "question-papers", fileName), "utf8"),
    })),
  );
}
