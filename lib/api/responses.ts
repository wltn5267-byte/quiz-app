import "server-only";
import { StoreConfigError } from "@/lib/firebase/admin";

/** 서버 저장소(Firestore) 오류를 쉬운 안내 문구로 바꿉니다. 자세한 원인은 서버 기록에만 남깁니다. */
export function storeErrorResponse(error: unknown): Response {
  if (error instanceof StoreConfigError) {
    console.error(`[저장소 설정] ${error.message}`);
    return Response.json(
      { message: "서버 저장소 설정이 아직 끝나지 않았습니다." },
      { status: 500 },
    );
  }
  console.error("[저장소 오류]", error);
  return Response.json(
    { message: "저장소에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요." },
    { status: 503 },
  );
}

/** 요청 본문을 JSON으로 읽습니다. 읽을 수 없으면 null입니다. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
