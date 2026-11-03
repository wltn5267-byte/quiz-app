"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { getFirebaseAuth, hasFirebaseConfig } from "@/lib/firebase/client";
import type { TeacherPaper } from "@/lib/teacher/types";
import TeacherDashboard from "./TeacherDashboard";

type View =
  | { name: "no-config" }
  | { name: "loading" }
  | { name: "signed-out"; notice: string | null }
  | { name: "ready"; email: string; papers: TeacherPaper[] }
  | { name: "error"; message: string };

/** 서버에 교사 화면 내용을 요청합니다. 서버가 로그인과 허용 계정을 다시 확인합니다. */
async function fetchTeacherData(user: User) {
  const token = await user.getIdToken();
  const response = await fetch("/api/teacher", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

function signInErrorMessage(error: unknown): string | null {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return null;
      case "auth/popup-blocked":
        return "로그인 창이 막혔습니다. 인터넷 창에서 팝업을 허용한 뒤 다시 눌러 주세요.";
      case "auth/unauthorized-domain":
        return "이 주소에서는 아직 Google 로그인을 쓸 수 없습니다. Firebase의 허용 도메인 설정이 필요합니다.";
      case "auth/operation-not-allowed":
        return "Firebase에서 Google 로그인이 아직 켜져 있지 않습니다.";
    }
  }
  return "로그인 중 문제가 생겼습니다. 잠시 뒤 다시 시도해 주세요.";
}

/** 교사 화면: Google 로그인 → 서버 확인 → 교사 화면 내용 표시 */
export default function TeacherApp() {
  const [view, setView] = useState<View>(() =>
    hasFirebaseConfig() ? { name: "loading" } : { name: "no-config" },
  );
  // 로그아웃시키면서 보여줄 안내. 로그아웃 뒤 상태 변화에서 꺼내 씁니다.
  const pendingNotice = useRef<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setView({ name: "signed-out", notice: pendingNotice.current });
        pendingNotice.current = null;
        return;
      }
      setView({ name: "loading" });
      try {
        const { status, body } = await fetchTeacherData(user);
        if (status === 200) {
          setView({ name: "ready", email: body.email, papers: body.papers });
        } else if (status === 401 || status === 403) {
          pendingNotice.current =
            status === 403
              ? `허용되지 않은 계정입니다 (${user.email ?? "이메일 없음"}). 교사로 등록된 Google 계정으로 다시 로그인해 주세요.`
              : (body.message ?? "다시 로그인해 주세요.");
          await signOut(auth);
        } else {
          setView({ name: "error", message: body.message ?? "교사 화면을 불러오지 못했습니다." });
        }
      } catch {
        setView({ name: "error", message: "서버와 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요." });
      }
    });
  }, []);

  async function handleSignIn() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      const message = signInErrorMessage(error);
      if (message) setView({ name: "signed-out", notice: message });
    }
  }

  async function handleSignOut() {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">교사 화면</h1>
        <p className="text-base leading-7 text-muted">
          문제를 등록하고 학생들의 풀이 결과를 확인하는 곳입니다.
        </p>
      </div>

      {view.name === "no-config" && (
        <p className="rounded-xl border border-border bg-card p-5 text-muted">
          교사 로그인 설정이 아직 연결되지 않았습니다.
        </p>
      )}

      {view.name === "loading" && (
        <p className="rounded-xl border border-border bg-card p-5 text-muted">확인하는 중입니다…</p>
      )}

      {view.name === "signed-out" && (
        <div className="flex flex-col gap-4">
          {view.notice && (
            <p role="alert" className="rounded-xl border border-danger bg-card p-4 leading-7 text-danger">
              {view.notice}
            </p>
          )}
          <p className="leading-7 text-muted">교사로 등록된 Google 계정으로 로그인해 주세요.</p>
          <button
            type="button"
            onClick={handleSignIn}
            className="h-14 rounded-xl bg-primary text-lg font-semibold text-primary-foreground hover:opacity-90"
          >
            Google로 로그인
          </button>
        </div>
      )}

      {view.name === "error" && (
        <p role="alert" className="rounded-xl border border-danger bg-card p-4 leading-7 text-danger">
          {view.message}
        </p>
      )}

      {view.name === "ready" && (
        <TeacherDashboard email={view.email} papers={view.papers} onSignOut={handleSignOut} />
      )}

      <Link
        href="/"
        className="flex h-14 items-center justify-center rounded-xl border border-border bg-card text-lg font-medium hover:bg-hover"
      >
        첫 화면으로
      </Link>
    </section>
  );
}
