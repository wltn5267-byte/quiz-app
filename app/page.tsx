import QuizApp from "@/components/quiz/QuizApp";
import { loadQuestionPapers } from "@/lib/quiz/papers";

export default function Home() {
  const papers = loadQuestionPapers();
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <QuizApp papers={papers} />
    </main>
  );
}
