import { storeErrorResponse } from "@/lib/api/responses";
import { averageScore } from "@/lib/quiz/submission";
import { listAllPapers } from "@/lib/store/papers";
import { listResultsByPaper } from "@/lib/store/results";
import { checkTeacherAccess } from "@/lib/teacher/access";
import type { PaperReport } from "@/lib/teacher/types";

/** 문제지별 학생 결과표와 평균 점수. 허용된 교사만 볼 수 있습니다. */
export async function GET(request: Request) {
  const access = await checkTeacherAccess(request);
  if (!access.ok) {
    return Response.json({ message: access.message }, { status: access.status });
  }
  try {
    const [papers, resultsByPaper] = await Promise.all([listAllPapers(), listResultsByPaper()]);
    const reports: PaperReport[] = papers.map((paper) => {
      const rows = resultsByPaper.get(paper.id) ?? [];
      return {
        paperId: paper.id,
        title: paper.title,
        published: paper.published,
        questionCount: paper.questionCount,
        average: averageScore(rows.map((row) => row.score)),
        rows,
      };
    });
    return Response.json({ reports });
  } catch (error) {
    return storeErrorResponse(error);
  }
}
