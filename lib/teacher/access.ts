import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { isAllowedTeacher } from "./allowlist";

/** Google이 Firebase 로그인 확인용으로 공개하는 열쇠 목록. 비밀키가 아닙니다. */
const FIREBASE_PUBLIC_KEYS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export type TeacherAccess =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403 | 500; message: string };

/**
 * 요청에 들어 있는 Firebase 로그인 표(ID 토큰)를 서버에서 직접 검사합니다.
 * 진짜 Google 로그인인지, 이 Firebase 프로젝트의 것인지, 허용된 교사 이메일인지 확인합니다.
 */
export async function checkTeacherAccess(request: Request): Promise<TeacherAccess> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const allowedEmail = process.env.TEACHER_EMAIL;
  if (!projectId || !allowedEmail) {
    console.error("[교사 확인] NEXT_PUBLIC_FIREBASE_PROJECT_ID 또는 TEACHER_EMAIL 설정이 없습니다.");
    return { ok: false, status: 500, message: "교사 로그인 설정이 아직 끝나지 않았습니다." };
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  if (!token) {
    return { ok: false, status: 401, message: "로그인이 필요합니다." };
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(token, FIREBASE_PUBLIC_KEYS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ["RS256"],
    }));
  } catch {
    return { ok: false, status: 401, message: "로그인 정보가 맞지 않거나 만료되었습니다. 다시 로그인해 주세요." };
  }

  const email = typeof payload.email === "string" ? payload.email : undefined;
  const emailVerified = payload.email_verified === true;
  if (!payload.sub || !isAllowedTeacher(email, emailVerified, allowedEmail)) {
    return { ok: false, status: 403, message: "허용되지 않은 계정입니다." };
  }
  return { ok: true, email: email! };
}
