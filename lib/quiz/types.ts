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

/** 이용자가 고른 답. 보기 번호(1~4), 아직 고르지 않았으면 null */
export type Answer = 1 | 2 | 3 | 4 | null;
