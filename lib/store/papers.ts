import "server-only";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/admin";
import { contentHash, titleKey } from "@/lib/quiz/fingerprint";
import type { Question, QuizFile } from "@/lib/quiz/types";
import type { TeacherPaper } from "@/lib/teacher/types";

const PAPERS = "papers";

type PaperDoc = {
  title: string;
  titleKey: string;
  contentHash: string;
  questions: Question[];
  questionCount: number;
  published: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type StoredPaper = { id: string; title: string; questions: Question[]; published: boolean };

function toTeacherPaper(id: string, data: PaperDoc): TeacherPaper {
  return {
    id,
    title: data.title,
    questionCount: data.questionCount,
    published: data.published,
    createdAt: data.createdAt?.toDate().toISOString() ?? null,
  };
}

/** 모든 문제지(공개·비공개)를 등록한 순서대로 돌려줍니다. */
export async function listAllPapers(): Promise<TeacherPaper[]> {
  const snap = await getDb().collection(PAPERS).orderBy("createdAt").get();
  return snap.docs.map((doc) => toTeacherPaper(doc.id, doc.data() as PaperDoc));
}

/** 공개된 문제지만 등록한 순서대로 돌려줍니다. */
export async function listPublishedPapers(): Promise<TeacherPaper[]> {
  const snap = await getDb().collection(PAPERS).where("published", "==", true).get();
  return snap.docs
    .map((doc) => toTeacherPaper(doc.id, doc.data() as PaperDoc))
    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
}

export async function getPaper(id: string): Promise<StoredPaper | null> {
  const doc = await getDb().collection(PAPERS).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data() as PaperDoc;
  return { id: doc.id, title: data.title, questions: data.questions, published: data.published };
}

export type CreatePaperResult =
  | { ok: true; paper: TeacherPaper }
  | { ok: false; reason: "duplicate-title" | "duplicate-content"; existingTitle: string };

/** 문제지를 비공개로 저장합니다. 제목이나 문항 내용이 같은 문제지가 있으면 저장하지 않습니다. */
export async function createPaper(quiz: QuizFile, teacherEmail: string): Promise<CreatePaperResult> {
  const db = getDb();
  const papers = db.collection(PAPERS);
  const key = titleKey(quiz.title);
  const hash = contentHash(quiz.questions);

  return db.runTransaction(async (tx) => {
    const sameTitle = await tx.get(papers.where("titleKey", "==", key).limit(1));
    if (!sameTitle.empty) {
      return { ok: false, reason: "duplicate-title", existingTitle: sameTitle.docs[0].get("title") };
    }
    const sameContent = await tx.get(papers.where("contentHash", "==", hash).limit(1));
    if (!sameContent.empty) {
      return {
        ok: false,
        reason: "duplicate-content",
        existingTitle: sameContent.docs[0].get("title"),
      };
    }
    const ref = papers.doc();
    tx.create(ref, {
      title: quiz.title.trim(),
      titleKey: key,
      contentHash: hash,
      questions: quiz.questions,
      questionCount: quiz.questions.length,
      published: false,
      createdBy: teacherEmail,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return {
      ok: true,
      paper: {
        id: ref.id,
        title: quiz.title.trim(),
        questionCount: quiz.questions.length,
        published: false,
        createdAt: new Date().toISOString(),
      },
    };
  });
}

/** 공개 여부를 바꿉니다. 문제지가 없으면 false를 돌려줍니다. */
export async function setPaperPublished(id: string, published: boolean): Promise<boolean> {
  const ref = getDb().collection(PAPERS).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.update({ published, updatedAt: FieldValue.serverTimestamp() });
  return true;
}
