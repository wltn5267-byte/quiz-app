import { readJson, storeErrorResponse } from "@/lib/api/responses";
import { setPaperPublished } from "@/lib/store/papers";
import { checkTeacherAccess } from "@/lib/teacher/access";

/** 문제지의 공개 여부를 바꿉니다. 허용된 교사만 할 수 있습니다. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/teacher/papers/[id]">) {
  const access = await checkTeacherAccess(request);
  if (!access.ok) {
    return Response.json({ message: access.message }, { status: access.status });
  }

  const body = (await readJson(request)) as { published?: unknown } | null;
  if (typeof body?.published !== "boolean") {
    return Response.json({ message: "공개 여부 값이 올바르지 않습니다." }, { status: 400 });
  }

  const { id } = await ctx.params;
  try {
    const found = await setPaperPublished(id, body.published);
    if (!found) {
      return Response.json({ message: "문제지를 찾을 수 없습니다." }, { status: 404 });
    }
    return Response.json({ id, published: body.published });
  } catch (error) {
    return storeErrorResponse(error);
  }
}
