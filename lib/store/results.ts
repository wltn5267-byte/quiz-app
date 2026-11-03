import "server-only";
import { createHash } from "node:crypto";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/admin";
import type { QuizResult } from "@/lib/quiz/score";
import { studentNameKey } from "@/lib/quiz/student";
import { wrongQuestionNumbers } from "@/lib/quiz/submission";
import type { Answer } from "@/lib/quiz/types";
import type { StudentResultRow } from "@/lib/teacher/types";

const RESULTS = "results";

type ResultDoc = {
  paperId: string;
  paperTitle: string;
  studentName: string;
  answers: Exclude<Answer, null>[];
  correctCount: number;
  total: number;
  score: number;
  wrongQuestions: number[];
  submittedAt: Timestamp;
};

/** 같은 문제지·같은 이름이면 같은 문서가 되도록 만든 문서 이름. 다시 풀면 최신 결과로 덮어씁니다. */
function resultId(paperId: string, studentName: string): string {
  const nameHash = createHash("sha256").update(studentNameKey(studentName)).digest("hex");
  return `${paperId}_${nameHash.slice(0, 32)}`;
}

/** 최종 제출한 풀이 결과를 저장합니다. */
export async function saveResult(params: {
  paperId: string;
  paperTitle: string;
  studentName: string;
  answers: Exclude<Answer, null>[];
  result: QuizResult;
}): Promise<void> {
  const { paperId, paperTitle, studentName, answers, result } = params;
  await getDb()
    .collection(RESULTS)
    .doc(resultId(paperId, studentName))
    .set({
      paperId,
      paperTitle,
      studentName: studentNameKey(studentName),
      answers,
      correctCount: result.correctCount,
      total: result.total,
      score: result.score,
      wrongQuestions: wrongQuestionNumbers(result),
      submittedAt: FieldValue.serverTimestamp(),
    });
}

/** 모든 풀이 결과를 문제지별로 묶어 돌려줍니다. 이름별 최신 결과 한 개씩만 있습니다. */
export async function listResultsByPaper(): Promise<Map<string, StudentResultRow[]>> {
  const snap = await getDb().collection(RESULTS).get();
  const byPaper = new Map<string, StudentResultRow[]>();
  for (const doc of snap.docs) {
    const data = doc.data() as ResultDoc;
    const rows = byPaper.get(data.paperId) ?? [];
    rows.push({
      studentName: data.studentName,
      score: data.score,
      correctCount: data.correctCount,
      total: data.total,
      wrongQuestions: data.wrongQuestions,
      submittedAt: data.submittedAt?.toDate().toISOString() ?? null,
    });
    byPaper.set(data.paperId, rows);
  }
  for (const rows of byPaper.values()) {
    rows.sort((a, b) => a.studentName.localeCompare(b.studentName, "ko"));
  }
  return byPaper;
}
