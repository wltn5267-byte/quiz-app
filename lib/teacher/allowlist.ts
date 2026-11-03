/** 비교하기 쉽게 이메일의 앞뒤 공백을 지우고 소문자로 바꿉니다. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * 로그인한 계정이 교사로 허용된 계정인지 확인합니다.
 * Google이 확인한 이메일(emailVerified)이고, 허용 이메일과 같아야 합니다.
 */
export function isAllowedTeacher(
  email: string | undefined,
  emailVerified: boolean | undefined,
  allowedEmail: string | undefined,
): boolean {
  if (!email || emailVerified !== true || !allowedEmail) return false;
  const allowed = normalizeEmail(allowedEmail);
  return allowed !== "" && normalizeEmail(email) === allowed;
}
