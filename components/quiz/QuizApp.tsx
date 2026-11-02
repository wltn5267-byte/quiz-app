"use client";

import { useState } from "react";
import type { Answer, QuizFile } from "@/lib/quiz/types";
import { gradeQuiz, type QuizResult } from "@/lib/quiz/score";
import UploadScreen from "./UploadScreen";
import ReadyScreen from "./ReadyScreen";
import QuestionScreen from "./QuestionScreen";
import ResultScreen from "./ResultScreen";

type Step =
  | { name: "upload" }
  | { name: "ready"; quiz: QuizFile; fileName: string }
  | { name: "solving"; quiz: QuizFile; fileName: string; index: number; answers: Answer[] }
  | { name: "result"; quiz: QuizFile; fileName: string; result: QuizResult };

/** 파일 올리기 → 문항 확인 → 풀이 → 결과 순서로 화면을 바꿉니다. 내용은 저장하지 않습니다. */
export default function QuizApp() {
  const [step, setStep] = useState<Step>({ name: "upload" });

  function startSolving(quiz: QuizFile, fileName: string) {
    setStep({
      name: "solving",
      quiz,
      fileName,
      index: 0,
      answers: quiz.questions.map(() => null),
    });
    window.scrollTo({ top: 0 });
  }

  function goToUpload() {
    setStep({ name: "upload" });
    window.scrollTo({ top: 0 });
  }

  switch (step.name) {
    case "upload":
      return (
        <UploadScreen
          onLoaded={(quiz, fileName) => setStep({ name: "ready", quiz, fileName })}
        />
      );

    case "ready":
      return (
        <ReadyScreen
          fileName={step.fileName}
          questionCount={step.quiz.questions.length}
          onStart={() => startSolving(step.quiz, step.fileName)}
          onChangeFile={goToUpload}
        />
      );

    case "solving": {
      const { quiz, index, answers } = step;
      const move = (to: number) => {
        setStep({ ...step, index: to });
        window.scrollTo({ top: 0 });
      };
      return (
        <QuestionScreen
          key={index}
          question={quiz.questions[index]}
          index={index}
          total={quiz.questions.length}
          chosen={answers[index]}
          onChoose={(answer) => {
            const next = [...answers];
            next[index] = answer;
            setStep({ ...step, answers: next });
          }}
          onPrev={() => move(Math.max(0, index - 1))}
          onNext={() => move(Math.min(quiz.questions.length - 1, index + 1))}
          onSubmit={() => {
            if (answers.some((a) => a === null)) return;
            setStep({
              name: "result",
              quiz,
              fileName: step.fileName,
              result: gradeQuiz(quiz.questions, answers),
            });
            window.scrollTo({ top: 0 });
          }}
        />
      );
    }

    case "result":
      return (
        <ResultScreen
          result={step.result}
          onRetry={() => startSolving(step.quiz, step.fileName)}
          onNewFile={goToUpload}
        />
      );
  }
}
