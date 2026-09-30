# 개발 가이드

## 요구 사항
- Node.js (LTS 22.x 또는 24.x 권장)
- npm

> 현재 환경의 Node v23에서는 ESLint 10 관련 `EBADENGINE` 경고가 출력되지만 빌드·실행에는 영향이 없습니다.
> 안정성을 위해 LTS 버전 사용을 권장합니다.

## 설치
```bash
npm install
```

## 스크립트
| 명령 | 설명 |
|------|------|
| `npm run dev` | Vite 개발 서버 (HMR), 기본 `http://localhost:5173` |
| `npm run build` | 타입 검사 + 프로덕션 빌드 (`tsc -b && vite build`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 포맷팅 (`prettier --write .`) |

## 처음 실행하기
1. `npm run dev`
2. 브라우저에서 접속하면 최초 1회 48개의 샘플 게시글이 localStorage에 자동 주입됩니다(`ensureSeed`).
3. `/login`에서 mock 사용자로 로그인:
   - **관리자** (admin) — 모든 글 수정/삭제 가능
   - **홍길동 / 김철수** (user) — 본인 글만 수정/삭제
4. 로그인 후 헤더의 "글쓰기"로 게시글을 작성해 보세요.

## 데이터 초기화
브라우저 개발자도구 → Application → Local Storage 에서 `board-app:` 접두사 키를 삭제하면 초기화됩니다.
- `board-app:v1` — 게시글 데이터
- `board-app:auth` — 현재 로그인 사용자
- `board-app:viewed` (사용 시) — 세션 조회 가드

## 코딩 규약
- **CSS Modules**: 컴포넌트별 `*.module.css` 동반.
- **타입 전용 import**: `tsconfig`에 `verbatimModuleSyntax`가 켜져 있어 타입은 반드시 `import type { ... }`로 가져옵니다(안 그러면 빌드 실패).
- **localStorage 직접 접근 금지**: `lib/storage.ts`와 repository 구현(`features/posts/api/`) 외에는 `localStorage`를 직접 사용하지 않습니다. 컴포넌트는 TanStack Query 훅만 사용합니다.
- **마크다운 안전성**: `MarkdownView`는 react-markdown 기본 설정(raw HTML 비활성, `rehype-raw` 미사용)으로 XSS에 안전합니다.

## 백엔드 연동 (향후)
1. `features/posts/api/httpPostRepository.ts`를 실제 엔드포인트에 맞춰 완성 (이미 `PostRepository` 인터페이스로 컴파일됨).
2. `features/posts/api/repositoryProvider.ts`의 `getPostRepository()`가 `httpPostRepository`를 반환하도록 변경.
3. `api/httpClient.ts`의 `baseURL`/인터셉터(인증 헤더 등) 설정.
4. 인증을 `AuthContext`의 mock에서 실제 `/api/auth/*` 호출로 교체.

자세한 계약은 [API.md](./API.md), 구조는 [ARCHITECTURE.md](./ARCHITECTURE.md) 참고.
