import { connection } from "next/server";
import { storeErrorResponse } from "@/lib/api/responses";
import { listPublishedPapers } from "@/lib/store/papers";
import type { PaperSummary } from "@/lib/quiz/types";

/** 학생용: 공개된 문제지 목록(제목·문항 수)만 돌려줍니다. */
export async function GET() {
  // 요청할 때마다 Firestore에서 새로 읽습니다(빌드할 때 미리 만들지 않음).
  await connection();
  try {
    const papers: PaperSummary[] = (await listPublishedPapers()).map(({ id, title, questionCount }) => ({
      id,
      title,
      questionCount,
    }));
    return Response.json({ papers });
  } catch (error) {
    return storeErrorResponse(error);
  }
}
