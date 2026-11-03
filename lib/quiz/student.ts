/** 학생 이름 최대 글자 수 */
export const STUDENT_NAME_MAX_LENGTH = 20;

export type StudentNameCheck =
  | { ok: true; name: string }
  | { ok: false; message: string };

/** 같은 학생인지 비교하는 값. 앞뒤 공백을 지우고 여러 칸 공백을 한 칸으로 줄입니다. */
export function studentNameKey(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/** 학생이 입력한 이름의 앞뒤 공백을 지우고, 비어 있으면 안내 문구를 돌려줍니다. */
export function checkStudentName(input: string): StudentNameCheck {
  const name = input.trim();
  if (name === "") {
    return { ok: false, message: "이름을 입력해 주세요." };
  }
  if (name.length > STUDENT_NAME_MAX_LENGTH) {
    return { ok: false, message: `이름은 ${STUDENT_NAME_MAX_LENGTH}글자까지 쓸 수 있습니다.` };
  }
  return { ok: true, name };
}
