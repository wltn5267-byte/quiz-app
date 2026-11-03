import { storeErrorResponse } from "@/lib/api/responses";
import { listAllPapers } from "@/lib/store/papers";
import { checkTeacherAccess } from "@/lib/teacher/access";

/** 교사 화면 내용. 서버에서 로그인과 허용 계정을 확인한 뒤에만 돌려줍니다. */
export async function GET(request: Request) {
  const access = await checkTeacherAccess(request);
  if (!access.ok) {
    return Response.json({ message: access.message }, { status: access.status });
  }
  try {
    return Response.json({ email: access.email, papers: await listAllPapers() });
  } catch (error) {
    return storeErrorResponse(error);
  }
}
