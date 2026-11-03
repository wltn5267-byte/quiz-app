/** 교사 화면에 보여줄 문제지 정보. 문항 내용은 빼고 보냅니다. */
export type TeacherPaper = {
  id: string;
  title: string;
  questionCount: number;
  published: boolean;
  createdAt: string | null;
};

/** 결과표 한 줄: 학생 이름별 최신 완료 결과 */
export type StudentResultRow = {
  studentName: string;
  score: number;
  correctCount: number;
  total: number;
  /** 틀린 문항 번호(1부터) */
  wrongQuestions: number[];
  submittedAt: string | null;
};

/** 문제지 하나의 결과표와 평균 점수 */
export type PaperReport = {
  paperId: string;
  title: string;
  published: boolean;
  questionCount: number;
  average: number | null;
  rows: StudentResultRow[];
};
