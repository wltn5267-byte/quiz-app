export type Question = {
  question: string;
  options: [string, string, string, string];
  /** 정답 번호. 1이면 options[0]이 정답입니다. */
  correctAnswer: 1 | 2 | 3 | 4;
  explanation: string;
};

/** question-papers 폴더의 JSON 문제지 한 개 */
export type QuizFile = {
  title: string;
  questions: Question[];
};

/** 목록에 보여줄 문제지. id는 파일 이름입니다. */
export type QuestionPaper = QuizFile & {
  id: string;
};

/** 학생이 풀이 중에 받는 문항. 정답과 해설은 들어 있지 않습니다. */
export type PublicQuestion = Pick<Question, "question" | "options">;

/** 목록에 보여줄 문제지 요약 */
export type PaperSummary = { id: string; title: string; questionCount: number };

/** 학생이 풀이할 때 받는 문제지. 정답과 해설은 채점 뒤에만 받습니다. */
export type PublicPaper = { id: string; title: string; questions: PublicQuestion[] };

/** 이용자가 고른 답. 보기 번호(1~4), 아직 고르지 않았으면 null */
export type Answer = 1 | 2 | 3 | 4 | null;
