import { readJson, storeErrorResponse } from "@/lib/api/responses";
import { gradeQuiz } from "@/lib/quiz/score";
import { checkStudentName } from "@/lib/quiz/student";
import { parseSubmittedAnswers } from "@/lib/quiz/submission";
import { getPaper } from "@/lib/store/papers";
import { saveResult } from "@/lib/store/results";

/**
 * 학생용: 모든 답을 한 번에 받아 서버에서 채점하고 결과를 저장합니다.
 * 채점 결과(정답·해설 포함)는 이때 처음 돌려줍니다. 저장에 실패해도 채점 결과는 보여주고 saved: false로 알립니다.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/papers/[id]/submissions">) {
  const { id } = await ctx.params;
  const body = (await readJson(request)) as { studentName?: unknown; answers?: unknown } | null;

  const name = checkStudentName(typeof body?.studentName === "string" ? body.studentName : "");
  if (!name.ok) {
    return Response.json({ message: name.message }, { status: 400 });
  }

  let paper;
  try {
    paper = await getPaper(id);
  } catch (error) {
    return storeErrorResponse(error);
  }
  if (!paper || !paper.published) {
    return Response.json({ message: "공개된 문제지를 찾을 수 없습니다." }, { status: 404 });
  }

  const answers = parseSubmittedAnswers(body?.answers, paper.questions.length);
  if (!answers) {
    return Response.json({ message: "모든 문항에 답한 뒤 제출해 주세요." }, { status: 400 });
  }

  const result = gradeQuiz(paper.questions, answers);
  try {
    await saveResult({
      paperId: paper.id,
      paperTitle: paper.title,
      studentName: name.name,
      answers,
      result,
    });
    return Response.json({ result, saved: true });
  } catch (error) {
    console.error("[결과 저장 실패]", error);
    return Response.json({ result, saved: false });
  }
}
