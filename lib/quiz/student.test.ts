import { describe, expect, it } from "vitest";
import { checkStudentName, STUDENT_NAME_MAX_LENGTH } from "./student";

describe("checkStudentName", () => {
  it("앞뒤 공백을 지운 이름을 돌려준다", () => {
    expect(checkStudentName("  홍길동 ")).toEqual({ ok: true, name: "홍길동" });
  });

  it("비어 있거나 공백뿐이면 입력 안내를 돌려준다", () => {
    expect(checkStudentName("")).toEqual({ ok: false, message: "이름을 입력해 주세요." });
    expect(checkStudentName("   ")).toEqual({ ok: false, message: "이름을 입력해 주세요." });
  });

  it("최대 글자 수를 넘으면 안내를 돌려준다", () => {
    expect(checkStudentName("가".repeat(STUDENT_NAME_MAX_LENGTH)).ok).toBe(true);
    expect(checkStudentName("가".repeat(STUDENT_NAME_MAX_LENGTH + 1)).ok).toBe(false);
  });
});
