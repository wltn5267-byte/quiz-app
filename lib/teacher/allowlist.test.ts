import { describe, expect, it } from "vitest";
import { isAllowedTeacher } from "./allowlist";

describe("isAllowedTeacher", () => {
  it("허용 이메일과 같고 확인된 이메일이면 허용한다", () => {
    expect(isAllowedTeacher("teacher@example.com", true, "teacher@example.com")).toBe(true);
  });

  it("대소문자와 앞뒤 공백은 구분하지 않는다", () => {
    expect(isAllowedTeacher("Teacher@Example.com", true, " teacher@example.com ")).toBe(true);
  });

  it("다른 이메일은 허용하지 않는다", () => {
    expect(isAllowedTeacher("student@example.com", true, "teacher@example.com")).toBe(false);
  });

  it("Google이 확인하지 않은 이메일은 허용하지 않는다", () => {
    expect(isAllowedTeacher("teacher@example.com", false, "teacher@example.com")).toBe(false);
    expect(isAllowedTeacher("teacher@example.com", undefined, "teacher@example.com")).toBe(false);
  });

  it("허용 이메일이 설정되지 않았으면 아무도 허용하지 않는다", () => {
    expect(isAllowedTeacher("teacher@example.com", true, undefined)).toBe(false);
    expect(isAllowedTeacher("teacher@example.com", true, "  ")).toBe(false);
    expect(isAllowedTeacher(undefined, true, "teacher@example.com")).toBe(false);
  });
});
