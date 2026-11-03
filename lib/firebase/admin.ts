import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/** 서버 저장소(Firestore) 설정이 없거나 잘못되었을 때 */
export class StoreConfigError extends Error {}

/**
 * 서버용 열쇠(서비스 계정)를 환경 변수 FIREBASE_SERVICE_ACCOUNT에서 읽습니다.
 * 값은 열쇠 파일 내용(JSON) 그대로이거나 base64로 바꾼 것입니다. 코드와 저장소에는 넣지 않습니다.
 */
function readServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) throw new StoreConfigError("FIREBASE_SERVICE_ACCOUNT 설정이 없습니다.");
  let parsed: { project_id?: string; client_email?: string; private_key?: string };
  try {
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    parsed = JSON.parse(json);
  } catch {
    throw new StoreConfigError("FIREBASE_SERVICE_ACCOUNT 값을 읽을 수 없습니다.");
  }
  const { project_id, client_email, private_key } = parsed;
  if (!project_id || !client_email || !private_key) {
    throw new StoreConfigError("FIREBASE_SERVICE_ACCOUNT에 필요한 항목이 없습니다.");
  }
  const expected = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (expected && expected !== project_id) {
    throw new StoreConfigError("서버용 열쇠의 프로젝트가 Firebase 설정과 다릅니다.");
  }
  return { projectId: project_id, clientEmail: client_email, privateKey: private_key };
}

function getAdminApp(): App {
  return getApps()[0] ?? initializeApp({ credential: cert(readServiceAccount()) });
}

/** 서버에서만 쓰는 Firestore. 설정이 없으면 StoreConfigError를 던집니다. */
export function getDb(): Firestore {
  return getFirestore(getAdminApp());
}
