import { readJson, storeErrorResponse } from "@/lib/api/responses";
import { validateQuizFile } from "@/lib/quiz/validate";
import { createPaper } from "@/lib/store/papers";
import { checkTeacherAccess } from "@/lib/teacher/access";

/** 업로드할 수 있는 문제지 파일의 최대 크기 */
const MAX_FILE_TEXT_LENGTH = 1024 * 1024;

/** 교사가 올린 문제지 파일 내용을 검사해 비공개로 저장합니다. */
export async function POST(request: Request) {
  const access = await checkTeacherAccess(request);
  if (!access.ok) {
    return Response.json({ message: access.message }, { status: access.status });
  }

  const body = (await readJson(request)) as { text?: unknown } | null;
  const text = body?.text;
  if (typeof text !== "string" || text.trim() === "") {
    return Response.json({ message: "문제지 파일 내용이 비어 있습니다." }, { status: 400 });
  }
  if (text.length > MAX_FILE_TEXT_LENGTH) {
    return Response.json({ message: "파일이 너무 큽니다. 1MB 이하 파일만 올릴 수 있습니다." }, { status: 400 });
  }

  const checked = validateQuizFile(text);
  if (!checked.ok) {
    return Response.json({ message: "파일 형식을 확인해 주세요.", errors: checked.errors }, { status: 400 });
  }

  try {
    const created = await createPaper(checked.quiz, access.email);
    if (!created.ok) {
      const message =
        created.reason === "duplicate-title"
          ? `같은 제목("${created.existingTitle}")의 문제지가 이미 등록되어 있습니다. 제목을 바꿔서 올려 주세요.`
          : `같은 문항 내용의 문제지가 이미 등록되어 있습니다. (등록된 제목: "${created.existingTitle}")`;
      return Response.json({ message, duplicate: true }, { status: 409 });
    }
    return Response.json({ paper: created.paper }, { status: 201 });
  } catch (error) {
    return storeErrorResponse(error);
  }
}
