import { getFirebaseAuth } from "@/lib/firebase/client";

/** 로그인한 교사의 ID 토큰을 붙여 서버에 요청합니다. 서버가 요청마다 계정을 다시 확인합니다. */
export async function teacherFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const user = getFirebaseAuth()?.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");
  const token = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers, cache: "no-store" });
}

/** 서버 응답의 안내 문구를 꺼냅니다. */
export async function readMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  return typeof body?.message === "string" ? body.message : fallback;
}
