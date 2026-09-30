# board-app 문서

사내용 게시판 웹앱(React 19 + Vite + TypeScript)의 프로젝트 문서입니다.

## 개요

백엔드 없이도 동작하는 게시판 프론트엔드입니다. 데이터는 브라우저 `localStorage`에 영속되며,
데이터 접근을 `PostRepository` 인터페이스로 추상화해 두어 나중에 Flask/REST 백엔드로 교체할 수 있습니다.

- **게시글 CRUD** (목록·상세·작성·수정·삭제)
- **검색**(제목+본문+작성자) · **카테고리 필터** · **정렬**(최신/조회) · **페이지네이션**(20개/페이지)
- **마크다운 본문** · **조회수** · **작성자/작성일** 표시
- **Mock 로그인 + 역할**(admin/user) 기반 권한

## 문서 인덱스

| 문서 | 내용 |
|------|------|
| [PRD.md](./PRD.md) | 제품 요구사항 — 기능 범위(MVP/추가/나중), 수용 기준(AC) |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 폴더 구조, 데이터 흐름, 라우팅, 상태 관리, 컴포넌트 |
| [API.md](./API.md) | 데이터 모델 + REST API 명세(현재 localStorage가 구현, 향후 Flask) |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 설치, 실행, 스크립트, 코딩 규약 |

## 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속. 최초 실행 시 48개의 샘플 게시글이 자동 주입됩니다.
`/login`에서 mock 사용자(관리자 / 홍길동 / 김철수)로 로그인하면 글쓰기·수정·삭제가 가능합니다.

## 기술 스택

- React 19 · React Router v7(`createBrowserRouter`) · TanStack Query v5 · axios
- TypeScript 6 · Vite 8 · CSS Modules
- 마크다운: react-markdown + remark-gfm

> 산출 이력: 요구사항은 [.omc/specs/deep-interview-board-app.md](../.omc/specs/deep-interview-board-app.md),
> 구현 계획은 [.omc/plans/board-app-implementation-plan.md](../.omc/plans/board-app-implementation-plan.md) 참고.
