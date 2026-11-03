import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Firebase 웹 설정값. 브라우저로 전달되는 공개 값이며 비밀키가 아닙니다.
 * 이 컴퓨터에서는 .env.local에, 배포할 때는 Vercel 환경 변수에 넣습니다.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Firebase 웹 설정값이 모두 들어 있는지 확인합니다. */
export function hasFirebaseConfig(): boolean {
  const { apiKey, authDomain, projectId, appId } = firebaseConfig;
  return Boolean(apiKey && authDomain && projectId && appId);
}

/** 설정값이 모두 있으면 Firebase 로그인 도구를, 없으면 null을 돌려줍니다. */
export function getFirebaseAuth(): Auth | null {
  if (!hasFirebaseConfig()) return null;
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}
