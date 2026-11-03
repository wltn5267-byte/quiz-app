import { connection } from "next/server";
import { storeErrorResponse } from "@/lib/api/responses";
import { toPublicQuestions } from "@/lib/quiz/submission";
import type { PublicPaper } from "@/lib/quiz/types";
import { getPaper } from "@/lib/store/papers";

/** 학생용: 공개된 문제지의 문항. 정답과 해설은 보내지 않습니다. */
export async function GET(_request: Request, ctx: RouteContext<"/api/papers/[id]">) {
  // 요청할 때마다 Firestore에서 새로 읽습니다(빌드할 때 미리 만들지 않음).
  await connection();
  const { id } = await ctx.params;
  try {
    const paper = await getPaper(id);
    if (!paper || !paper.published) {
      return Response.json({ message: "공개된 문제지를 찾을 수 없습니다." }, { status: 404 });
    }
    const body: PublicPaper = {
      id: paper.id,
      title: paper.title,
      questions: toPublicQuestions(paper.questions),
    };
    return Response.json(body);
  } catch (error) {
    return storeErrorResponse(error);
  }
}
