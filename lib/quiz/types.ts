export type Question = {
  question: string;
  options: [string, string, string, string];
  /** 정답 번호. 1이면 options[0]이 정답입니다. */
  correctAnswer: 1 | 2 | 3 | 4;
  explanation: string;
};

export type QuizFile = {
  questions: Question[];
};

/** 이용자가 고른 답. 보기 번호(1~4), 아직 고르지 않았으면 null */
export type Answer = 1 | 2 | 3 | 4 | null;
