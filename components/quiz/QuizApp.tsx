"use client";

import { useState } from "react";
import type { Answer, QuestionPaper } from "@/lib/quiz/types";
import { gradeQuiz, type QuizResult } from "@/lib/quiz/score";
import PaperListScreen from "./PaperListScreen";
import ReadyScreen from "./ReadyScreen";
import QuestionScreen from "./QuestionScreen";
import ResultScreen from "./ResultScreen";

type Step =
  | { name: "list" }
  | { name: "ready"; paper: QuestionPaper }
  | { name: "solving"; paper: QuestionPaper; index: number; answers: Answer[] }
  | { name: "result"; paper: QuestionPaper; result: QuizResult };

type Props = {
  papers: QuestionPaper[];
};

/** 문제지 목록 → 문항 확인 → 풀이 → 결과 순서로 화면을 바꿉니다. 내용은 저장하지 않습니다. */
export default function QuizApp({ papers }: Props) {
  const [step, setStep] = useState<Step>({ name: "list" });

  function startSolving(paper: QuestionPaper) {
    setStep({
      name: "solving",
      paper,
      index: 0,
      answers: paper.questions.map(() => null),
    });
    window.scrollTo({ top: 0 });
  }

  function goToList() {
    setStep({ name: "list" });
    window.scrollTo({ top: 0 });
  }

  switch (step.name) {
    case "list":
      return (
        <PaperListScreen
          papers={papers}
          onSelect={(paper) => {
            setStep({ name: "ready", paper });
            window.scrollTo({ top: 0 });
          }}
        />
      );

    case "ready":
      return (
        <ReadyScreen
          title={step.paper.title}
          questionCount={step.paper.questions.length}
          onStart={() => startSolving(step.paper)}
          onBackToList={goToList}
        />
      );

    case "solving": {
      const { paper, index, answers } = step;
      const questions = paper.questions;
      const move = (to: number) => {
        setStep({ ...step, index: to });
        window.scrollTo({ top: 0 });
      };
      return (
        <QuestionScreen
          key={index}
          question={questions[index]}
          index={index}
          total={questions.length}
          chosen={answers[index]}
          onChoose={(answer) => {
            const next = [...answers];
            next[index] = answer;
            setStep({ ...step, answers: next });
          }}
          onPrev={() => move(Math.max(0, index - 1))}
          onNext={() => move(Math.min(questions.length - 1, index + 1))}
          onSubmit={() => {
            if (answers.some((a) => a === null)) return;
            setStep({ name: "result", paper, result: gradeQuiz(questions, answers) });
            window.scrollTo({ top: 0 });
          }}
        />
      );
    }

    case "result":
      return (
        <ResultScreen
          result={step.result}
          onRetry={() => startSolving(step.paper)}
          onBackToList={goToList}
        />
      );
  }
}
