# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

교사가 Google로 로그인해 문제지 JSON을 올리고 공개하면, 학생이 이름만 입력하고 공개된 문제지를 골라 4지선다 문제를 모두 푼 뒤 한 번에 채점받는 교육용 웹앱입니다. 문제지와 풀이 결과는 Firestore에 저장되고, 교사는 문제지별 결과표와 평균을 봅니다. `question-papers` 폴더의 JSON은 교사가 올리는 예시 파일입니다.

- 요구사항의 기준 문서는 [PRD.md](PRD.md)입니다. 작업 전에 반드시 읽습니다. PRD.md 끝의 "변경 기록"에 초기 버전(학생 파일 업로드)과 현재 버전(목록 선택)의 차이가 있습니다.
- 기술 구성: Next.js + TypeScript, Vercel 배포, PC와 휴대폰 모두 지원
- 현재 상태: 1일차 앱을 목록 선택 방식으로 바꿨고, 이 컴퓨터에서 실행해 확인했습니다(첫 커밋 `24942ef`는 업로드 방식인 초기 버전).
- Vercel: 계정 `wltn5267-8646`(팀 `wltn5267`, 무료 Hobby), 프로젝트 `quiz-app`(Framework는 `nextjs`로 지정). 정식 주소는 https://quiz-app-zeta-ruddy.vercel.app 이고 로그인 없이 열립니다. 배포마다 생기는 개별 주소는 Vercel 보호 기능 때문에 로그인이 필요합니다. 다시 배포할 때는 `vercel deploy --prod`를 씁니다(`.vercel` 폴더로 연결됨, Git 자동 배포 연결 없음).
- Firebase: 프로젝트 `quiz-app`(ID `quiz-app-fd6e4`, 무료 Spark), 웹 앱 `quiz-app-web`, Authentication에서 Google 로그인 사용 설정됨. 허용 도메인은 기본값(`localhost`, `quiz-app-fd6e4.firebaseapp.com`, `quiz-app-fd6e4.web.app`)뿐이라 Vercel 주소는 배포 전에 추가해야 합니다. Firestore는 `(default)` 데이터베이스(asia-northeast3, Standard)이고, 규칙은 [firestore.rules](firestore.rules)로 모든 직접 접근을 막습니다. 규칙을 바꾸면 `npx.cmd -y firebase-tools@15.32.1 deploy --only firestore:rules`로 적용합니다.
- 설정값은 `.env.local`(Git에 안 올라감)에 있습니다: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`(공개 값), `TEACHER_EMAIL`(서버 전용, 교사 1명), `FIREBASE_SERVICE_ACCOUNT`(비밀값: 서버용 열쇠 JSON을 base64로 바꾼 것). 비밀값은 화면·답변·코드에 절대 출력하지 않습니다. Vercel 환경 변수에는 아직 넣지 않았으므로 지금 배포본에서는 교사 로그인과 Firestore가 동작하지 않습니다(배포 전에 Vercel 설정 화면에 사용자가 직접 넣도록 안내).
- Firebase 명령 프로그램은 설치하지 않고 `npx.cmd -y firebase-tools@15.32.1`로 씁니다(PowerShell 실행 정책 때문에 `npx`가 아닌 `npx.cmd`). wltn5267@gmail.com으로 로그인되어 있습니다. 다시 로그인할 때는 `login --non-interactive`로 받은 주소를 앱 안 브라우저 창에서 열고, 마지막 화면의 코드를 `firebase login <코드>`로 넘깁니다. Firebase 로그인 팝업은 앱 안 브라우저 창에서 Claude가 누르면 막히므로 교사 로그인 확인은 사용자가 직접 눌러야 합니다.
- 이 컴퓨터 이름(연수실1-24)에 한글이 있어 `vercel login`이 오류로 멈춥니다. 다시 로그인해야 하면 `NODE_OPTIONS="--require C:/Users/user/.vercel-fix/hostname-ascii.cjs"`를 붙여 실행합니다. Git Bash에서 `vercel api /v9/...`처럼 `/`로 시작하는 주소를 넘기면 Windows 경로로 바뀌어 실패하므로 PowerShell에서 실행합니다.
- GitHub: 공개 저장소 https://github.com/wltn5267-byte/quiz-app (`origin`, 브랜치 `main`, 계정 `wltn5267-byte`). GitHub CLI(`gh`)는 `C:\Program Files\GitHub CLI`에 설치되어 있습니다. 공개 저장소이므로 문제지의 정답·해설과 커밋 이메일이 누구에게나 보입니다. 저장소에는 Vercel 등 자동 배포 연결이 없습니다.
- 확인된 작업 환경: Windows 11, Node.js v26.13.0, npm 11.20.0, Git 2.56.0, Next.js 16.4.3 (Turbopack, `cacheComponents` 켜짐)
- 이 Next.js 버전은 예전 버전과 다른 점이 있습니다. 코드를 쓰기 전에 [AGENTS.md](AGENTS.md)의 안내대로 `node_modules/next/dist/docs/`를 확인합니다. AGENTS.md는 `next dev`가 다시 써 넣는 파일이므로 직접 고치지 않습니다.

## 명령

```bash
npm run dev      # 개발용 실행, http://localhost:3000
npm test         # 자동 점검 (Vitest)
npx vitest run lib/quiz/score.test.ts   # 점검 파일 하나만 실행
npm run lint     # 코드 규칙 검사 (ESLint)
npm run build    # 배포용 빌드 확인
```

- Claude 앱 안의 브라우저 창으로 확인할 때는 `.claude/launch.json`의 `quiz-app` 설정으로 엽니다.
- 배포(`vercel` 명령 등)는 사용자가 따로 요청할 때만 합니다.

## 구조

- `app/page.tsx`는 첫 화면으로, "교사로 시작하기"(`/teacher`)와 "학생으로 시작하기"(`/student`)만 있습니다.
- `app/teacher/page.tsx`는 [components/teacher/TeacherApp.tsx](components/teacher/TeacherApp.tsx)만 보여줍니다. `TeacherApp`이 Firebase Google 로그인(팝업)을 하고, 교사 요청은 모두 [components/teacher/teacherFetch.ts](components/teacher/teacherFetch.ts)가 ID 토큰을 `Authorization: Bearer`로 붙여 `/api/teacher/*`에 보냅니다. 각 교사 API는 먼저 `checkTeacherAccess`(`lib/teacher/access.ts`: `jose`로 토큰을 Google 공개 열쇠로 검사, `lib/teacher/allowlist.ts`로 `TEACHER_EMAIL`과 비교)를 부릅니다. 403이면 화면이 자동 로그아웃하고 "허용되지 않은 계정입니다"를 보여줍니다. 새 교사 기능도 반드시 이 확인을 거친 API로 만듭니다.
  - `GET /api/teacher`: 이메일과 전체 문제지 목록 / `POST /api/teacher/papers`: 파일 내용 검사(`validateQuizFile`)·중복 확인 뒤 비공개 저장 / `PATCH /api/teacher/papers/[id]`: 공개 여부 / `GET /api/teacher/results`: 문제지별 결과표·평균
  - 화면: `TeacherDashboard`(등록한 문제지·공개 버튼), `PaperUploadSection`(파일 고르기 → 미리보기 → 등록), `ResultsSection`(결과표). 교사용 데이터 형식은 `lib/teacher/types.ts`.
- `app/student/page.tsx` → [components/student/StudentApp.tsx](components/student/StudentApp.tsx)(이름 입력 `NameEntryScreen`, 검사는 `lib/quiz/student.ts`) → [components/quiz/QuizApp.tsx](components/quiz/QuizApp.tsx). 학생 API는 로그인 없이 씁니다.
  - `GET /api/papers`: 공개된 문제지 요약 / `GET /api/papers/[id]`: 공개된 문제지의 문항(정답·해설 뺌, `toPublicQuestions`) / `POST /api/papers/[id]/submissions`: 이름과 모든 답을 받아 서버에서 채점(`gradeQuiz`)하고 저장한 뒤, 정답·해설이 든 결과와 `saved`를 돌려줍니다. 저장에 실패해도 결과는 보여주고 `saved: false`면 화면에 "다시 저장하기"가 나옵니다.
  - 학생 GET API는 `await connection()`으로 요청마다 Firestore를 읽습니다(`cacheComponents` 때문에 없으면 빌드 때 미리 만들어짐).
  - `QuizApp` 단계: `list → ready → solving → submitting → result`. 이름과 풀이 중 답은 저장하지 않으므로 새로고침하면 이름 입력부터 다시 시작합니다.
- 서버 저장소: `lib/firebase/admin.ts`(`firebase-admin`, `FIREBASE_SERVICE_ACCOUNT`로 초기화, 설정이 없으면 `StoreConfigError`), `lib/store/papers.ts`, `lib/store/results.ts`, 오류 응답은 `lib/api/responses.ts`. 브라우저는 Firestore에 직접 접근하지 않습니다.
  - `papers` 컬렉션: `title`, `titleKey`, `contentHash`, `questions`(정답·해설 포함), `questionCount`, `published`, `createdBy`, `createdAt`, `updatedAt`. 제목(`titleKey`) 또는 문항 내용(`contentHash`, `lib/quiz/fingerprint.ts`)이 같으면 중복으로 거절합니다.
  - `results` 컬렉션: 문서 이름이 `{paperId}_{이름 해시}`라서 같은 문제지·같은 이름(`studentNameKey`: 앞뒤 공백 제거, 여러 칸 공백을 한 칸으로)이면 최신 결과로 덮어씁니다. `studentName`, `answers`, `correctCount`, `total`, `score`, `wrongQuestions`(1부터), `submittedAt`.
- `lib/firebase/client.ts`는 브라우저용 Firebase 설정(로그인만)입니다. 설정값이 없으면 교사 화면에 "교사 로그인 설정이 아직 연결되지 않았습니다"가 나옵니다.
- 화면과 상관없는 규칙은 `lib/quiz/`에 있습니다: `validate.ts`(문제지 형식 검사, 한국어 오류 문구), `score.ts`(채점·점수), `submission.ts`(학생용 문항 만들기, 제출 답 검사, 틀린 문항 번호, 평균), `fingerprint.ts`(중복 비교), `student.ts`(이름), `types.ts`.
- 학생에게는 채점 전까지 정답·해설을 보내지 않습니다. 다만 학생은 로그인하지 않으므로 같은 이름으로 다시 제출하면 결과가 덮어써지고, 아무 답이나 제출하면 정답을 볼 수 있습니다(이름만으로 입장하는 설계의 한계).
- 색은 `app/globals.css`의 이름 붙인 색(`primary`, `muted`, `danger` 등)을 씁니다. 어두운 화면 설정도 지원합니다.
- 확인용으로 `question-papers`에 임의의 문제지나 문항을 추가하지 않습니다.

## 1일차와 2일차 구분

- **1일차 (지금 만들 것):** `question-papers` 문제지 목록 표시·선택, 문항 표시, 한 문제씩 4지선다 풀이, 모든 문항 완료 후 채점·점수·정오·해설 표시, 로컬 실행, Vercel 배포
- **2일차 (나중에 추가할 것):** 교사 Google 로그인과 학생 이름으로 입장, Azure AI 문제 생성, 문제 저장·공개, Firestore 결과 저장, 교사용 점수 조회
- 1일차에는 로그인, AI, DB를 구현하지 않습니다. 2일차 기능을 붙이기 쉬운 구조로만 만들고, 미래 기능을 미리 만들지 않습니다.
- 문제지 파일 형식, 풀이 규칙, 점수 계산, 파일 검사 규칙은 PRD.md의 "문제지 파일"과 "결정 사항 (1일차)"을 그대로 따릅니다. 특히 다음을 지킵니다.
  - 풀이 중에는 정답 여부·점수·해설을 보여주지 않습니다.
  - `correctAnswer`는 1부터 셉니다. 1이 `options`의 첫 번째 보기입니다.

## 앱을 만드는 기준

- PRD.md에 적힌 요구사항을 기준으로 작업합니다.
- 지금 만들 기능과 나중에 추가할 기능을 구분합니다.
- 정해진 조건을 마음대로 바꾸지 않고, 요청하지 않은 기능을 추가하지 않습니다.
- 정해지지 않은 내용이나 선택이 필요한 사항은 먼저 질문합니다.
- 기존 파일의 내용과 PRD.md가 서로 다르면 임의로 결정하지 말고 사용자에게 알립니다.

## 사용자에게 설명하는 방법

사용자는 개발을 모르는 일반인입니다.

- 새 세션을 시작하면 오늘이 1일차인지 2일차인지 먼저 물어봅니다.
- 모든 설명은 쉬운 한국어로 합니다. 개발 지식이 있어야 이해할 수 있는 기술용어는 쓰지 않습니다.
- 사용자가 알아야 할 것은 "무엇을 하면 되는지"와 "어떤 결과가 나오는지"입니다.
- 화면에 보이는 버튼 이름과 파일 이름은 그대로 쓰고, 설명은 쉬운 말로 합니다.
- 설치나 설정이 필요하면 다음 순서로 안내합니다.
  1. 어느 화면을 열어야 하는지
  2. 무엇을 누르거나 입력해야 하는지
  3. 제대로 됐는지 무엇을 보고 확인하는지
- 사용자가 입력할 내용은 그대로 복사할 수 있게 코드 블록으로 줍니다.
- 여러 가지를 한꺼번에 시키지 말고 한 단계씩 순서대로 안내합니다.
- 오류가 나면 원인과 해결 방법을 쉬운 말로 설명합니다.

## 작업을 진행하는 방법

- 앱을 만들기 전에 무엇을 어떤 순서로 만들지 짧게 설명하고 사용자의 확인을 받습니다.
- 수정한 뒤에는 무엇이 바뀌었고 사용자가 어떻게 확인하면 되는지 알려줍니다.
- 실제로 확인한 결과와 아직 확인하지 못한 부분을 구분해서 말합니다.
- 실행하거나 확인하지 않은 일을 완료했다고 말하지 않습니다.
- 앱 화면의 안내 문구와 오류 메시지도 일반인이 이해할 수 있는 쉬운 말로 씁니다.
- 사용자가 브라우저를 직접 조작하지 않아도 되도록 CLI, MCP, Plugin 등을 최대한 활용합니다. 불가능한 작업(예: 계정 로그인)이면 방법을 친절하게 안내합니다.
- 사용자의 컴퓨터 화면을 직접 조작하지 않습니다. 마우스·키보드 조작이나 화면 캡처로 다른 프로그램을 움직이는 일이 여기에 해당합니다.
  - 이 프로젝트 폴더 안에서 명령을 실행하는 것은 허용됩니다. 예: 패키지 설치, 앱 실행·빌드·테스트, Git 사용
  - Claude 앱에 들어 있는 브라우저 창에서 앱을 열어 확인하는 것은 화면 조작에 해당하지 않으므로 허용됩니다.
