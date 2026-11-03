import TeacherApp from "@/components/teacher/TeacherApp";

/** 교사 화면. 내용은 로그인과 서버 확인을 거친 뒤 /api/teacher에서 받아옵니다. */
export default function TeacherPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <TeacherApp />
    </main>
  );
}
