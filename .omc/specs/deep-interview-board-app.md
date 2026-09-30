# Deep Interview Spec: 사내 게시판 웹앱 (board-app)

## Metadata
- Interview ID: board-app-2026-05-24
- Rounds: 5 (+ Round 0 topology gate)
- Final Ambiguity Score: 19.5%
- Type: greenfield (Vite 스캐폴드 위 신규 기능 구축)
- Generated: 2026-05-24
- Threshold: 0.2 (20%)
- Threshold Source: default
- Initial Context Summarized: no
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.85 | 0.40 | 0.34 |
| Constraint Clarity | 0.80 | 0.30 | 0.24 |
| Success Criteria | 0.75 | 0.30 | 0.225 |
| **Total Clarity** | | | **0.805** |
| **Ambiguity** | | | **0.195** |

## Topology
| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| 게시글 관리 (Posts CRUD) | active | 목록·상세·작성·수정·삭제 화면/폼 | 마크다운 본문, 권한(admin/owner) 적용, AC 1~6 |
| 탐색 & 검색 (Browse & Search) | active | 검색·카테고리·페이지네이션·정렬 | 제목+본문+작성자 검색, 20/page, 최신/조회 정렬, AC 7~10 |
| 데이터/API 레이어 (Data/API Layer) | active | repository 추상화 + react-query | localStorage 구현 → 동일 계약으로 Flask 교체, AC 11~13 |
| 인증/사용자 (Auth/User) | active | Mock 로그인 + 역할 | admin=전체, user=본인 글, AC 14~16 |

> 미룬(deferred) 컴포넌트 없음. 4개 모두 이번 범위에 포함.

## Goal
React 19 + Vite + TypeScript 기반의 **사내용 게시판 프론트엔드**를 백엔드 없이 동작 가능한 상태로 구축한다.
게시글 CRUD, 고정 카테고리 필터, 통합 검색(제목+본문+작성자), 페이지 번호 페이지네이션(20개/페이지),
정렬(최신순/조회순), 조회수, 마크다운 본문, Mock 로그인 + 역할(admin/user)을 제공한다.
데이터 접근은 **repository 인터페이스로 추상화**하여 지금은 localStorage 영속화로 동작하고,
나중에 동일한 계약(REST 표준)으로 Flask/REST 백엔드를 끼워 넣을 수 있어야 한다.

## Constraints
- 스택 고정: React 19, react-router-dom v7, @tanstack/react-query v5, axios, TypeScript 6, Vite 8
- 스타일링: **CSS Modules** (`*.module.css`), 추가 UI 라이브러리 없음
- 현재 데이터 소스: **localStorage** (새로고침 후 데이터 유지)
- 데이터 접근은 `PostRepository` 인터페이스 뒤에 두어, localStorage 구현 ↔ HTTP(axios) 구현을 교체 가능하게 한다
- react-query 훅(`usePosts`, `usePost`, mutations)은 repository를 호출하며, 나중 API 교체 시 훅 시그니처는 불변
- 권한: admin은 모든 글 수정/삭제, user는 본인 글만. 비로그인 사용자는 읽기만
- 조회수: 상세 진입 시 +1 (세션 단위 단순 처리, 정교한 중복 방지는 비목표)
- 페이지네이션·검색·정렬은 지금은 **클라이언트 측** 처리, 단 API 계약은 `?q=&category=&sort=&page=&size=` 쿼리 파라미터 형태로 미리 설계

## Non-Goals (이번 범위 제외)
- 실제 Flask/REST 백엔드 구현 및 연동 (나중)
- 실제 로그인/세션/권한 서버 검증 (지금은 mock)
- 댓글, 마크다운 미리보기, 첨부파일, 다크모드 (추가 기능)
- 알림, 추천/좋아요 (나중)
- 정교한 조회수 중복 방지, SSR, i18n, 접근성 인증 수준 대응

## 범위 분류 (MVP / 추가 / 나중)
**[MVP]** 게시글 CRUD · 고정 카테고리 필터 · 검색(제목+본문+작성자) · 페이지네이션(20) · 정렬(최신/조회) · 조회수 · 마크다운 렌더링 · Mock 로그인+역할 · localStorage 영속화 · repository 추상화

**[추가]** 댓글 · 마크다운 미리보기(작성 중 실시간) · 첨부파일 · 다크모드

**[나중]** 실제 Flask/REST 연동 · 실제 로그인/권한 서버검증 · 알림 · 추천/좋아요 · 인기순 정렬

## Acceptance Criteria
- [ ] AC1: `/` 목록에서 게시글들이 카드/행으로 표시되고 제목·작성자·작성일·조회수·카테고리가 보인다
- [ ] AC2: `/posts/new`에서 제목·카테고리·마크다운 본문을 입력해 글을 생성하면 목록/상세에 반영되고 새로고침 후에도 유지된다
- [ ] AC3: `/posts/:id` 상세에서 마크다운이 렌더링되고 메타데이터가 표시된다
- [ ] AC4: `/posts/:id/edit`에서 글을 수정하면 `updatedAt`이 갱신되고 변경이 유지된다
- [ ] AC5: 글 삭제 시 확인 후 목록에서 제거되고 유지된다
- [ ] AC6: 권한 — admin은 모든 글의 수정/삭제 버튼이 보이고, user는 본인 글에만 보이며, 비로그인은 보이지 않는다
- [ ] AC7: 검색어 입력 시 제목·본문·작성자 중 하나라도 매칭되는 글만 필터링된다
- [ ] AC8: 카테고리 선택 시 해당 카테고리 글만 표시된다 (단일 선택, 고정 목록)
- [ ] AC9: 목록은 페이지당 20개로 나뉘고 페이지 번호 UI로 이동 가능하다
- [ ] AC10: 정렬을 최신순/조회순으로 전환할 수 있다
- [ ] AC11: 상세 진입 시 조회수가 1 증가한다
- [ ] AC12: 데이터 접근은 `PostRepository` 인터페이스를 통하며 localStorage 구현체가 주입된다
- [ ] AC13: react-query 훅으로 로딩/에러/캐시 상태가 처리된다
- [ ] AC14: `/login`에서 mock 사용자(admin/user)를 선택/입력해 로그인하면 현재 사용자가 localStorage에 유지된다
- [ ] AC15: 보호 라우트(`/posts/new`, `/posts/:id/edit`)는 비로그인 시 `/login`으로 리다이렉트된다
- [ ] AC16: 헤더에 현재 로그인 사용자/역할이 표시되고 로그아웃이 가능하다

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| 백엔드 없이 "프론트 먼저"가 가능한가 | 데이터를 어디서 가져오나? | localStorage 영속화 + repository 추상화 (R1) |
| "인증"이 무엇을 의미하나 | 지금 단계에서 어느 수준? | Mock 로그인 + admin/user 역할 (R2) |
| 본문은 단순 텍스트인가 | 에디터 복잡도 결정 | 마크다운 (R3) |
| 카테고리는 동적인가 | 관리 화면 필요 여부 | 고정 목록, 단일 선택 (R3) |
| 댓글이 MVP인가 | 데이터 모델/상세 화면 영향 | 추가 기능으로, 모델만 확장 가능하게 (R3) |
| 무거운 서버식 페이지네이션이 필요한가 (Contrarian) | 사내 게시판 규모 | 페이지 번호 20개, 지금은 클라이언트 측 (R4) |
| 검색 범위는 | 제목만으로 충분한가 | 제목+본문+작성자 (R4) |
| 완료 기준/범위가 명확한가 | MVP 경계 | MVP/추가/나중 3분류 확정 (R5) |

## Technical Context
- 현재 `src/`는 Vite + React 19 기본 스캐폴드 (App.tsx 카운터 데모). 게시판 기능 코드 없음 → 신규 구축.
- 이미 설치됨: `react-router-dom@7`, `@tanstack/react-query@5`, `axios`, `prettier`(dev).
- 마크다운 렌더링을 위해 `react-markdown`(+`remark-gfm`) 추가 설치 권장.
- Node v23.3.0 사용 중 — ESLint 10이 요구하는 엔진과 불일치(EBADENGINE 경고). 동작엔 무방하나 Node LTS(22/24) 권장.

---

## 화면 목록 (Screen List)

| # | 화면 | 경로 | 주요 기능 | 인증 |
|---|------|------|-----------|------|
| S1 | 게시글 목록 | `/` | 검색바, 카테고리 필터, 정렬 셀렉트, 목록, 페이지네이션, "글쓰기" 버튼 | 불필요(읽기) |
| S2 | 게시글 상세 | `/posts/:id` | 마크다운 본문, 메타(작성자/일시/조회수/카테고리), 수정/삭제(권한 시), 조회수 +1 | 불필요(읽기) |
| S3 | 게시글 작성 | `/posts/new` | 제목·카테고리·마크다운 본문 폼, 저장/취소 | 필요 |
| S4 | 게시글 수정 | `/posts/:id/edit` | 기존 값 프리필 폼, 저장/취소 | 필요 + 권한 |
| S5 | 로그인 | `/login` | mock 사용자 선택/입력, 로그인 | - |
| S6 | Not Found | `*` | 404 안내, 목록으로 이동 | - |

공통 레이아웃: `Header`(로고/네비/현재 사용자/로그아웃) + `<Outlet/>` 본문.

---

## URL 라우팅 (react-router-dom v7)

| 경로 | 컴포넌트(페이지) | 가드 | params/query |
|------|------------------|------|--------------|
| `/` | `BoardListPage` | - | `?q=&category=&sort=&page=` (URL 동기화) |
| `/posts/:id` | `PostDetailPage` | - | `:id` |
| `/posts/new` | `PostCreatePage` | `RequireAuth` | - |
| `/posts/:id/edit` | `PostEditPage` | `RequireAuth` + 권한 체크 | `:id` |
| `/login` | `LoginPage` | - | `?redirect=` |
| `*` | `NotFoundPage` | - | - |

- 목록 필터 상태(검색어/카테고리/정렬/페이지)는 **URL 쿼리 파라미터로 동기화** → 공유·뒤로가기 자연스럽게.
- `RequireAuth`는 비로그인 시 `/login?redirect=<현재경로>`로 이동, 로그인 후 복귀.
- 라우터는 `createBrowserRouter` 기반 객체 라우팅 또는 `<Routes>` 선언형 중 택1 (객체 라우팅 권장 — v7 데이터 라우터).

---

## 컴포넌트 구조 (Folder & Component Tree)

```
src/
  main.tsx                      # QueryClientProvider + RouterProvider 부트스트랩
  App.tsx                       # (스캐폴드 데모 제거 후) Layout/Outlet 구성
  router.tsx                    # 라우트 정의 (createBrowserRouter)

  api/
    httpClient.ts               # axios 인스턴스 (baseURL, 인터셉터) — 나중 API용
    queryClient.ts              # react-query QueryClient 설정

  features/
    posts/
      types.ts                  # Post 타입
      api/
        postRepository.ts       # interface PostRepository (list/get/create/update/remove)
        localPostRepository.ts  # localStorage 구현 (지금)
        httpPostRepository.ts   # axios 구현 (나중, 스텁)
        repositoryProvider.ts   # 활성 구현 선택 (env/플래그)
        postQueries.ts          # usePosts, usePost, useCreatePost, useUpdatePost, useDeletePost
      components/
        PostList.tsx            # 목록 렌더 + 빈/로딩/에러 상태
        PostListItem.tsx        # 행/카드 (제목·작성자·일시·조회수·카테고리)
        PostForm.tsx            # 작성/수정 공용 폼 (제목·카테고리·마크다운)
        PostMeta.tsx            # 메타데이터 표시
        MarkdownView.tsx        # react-markdown 렌더
        PostActions.tsx         # 수정/삭제 버튼 (권한 가드)
      pages/
        BoardListPage.tsx
        PostDetailPage.tsx
        PostCreatePage.tsx
        PostEditPage.tsx

    categories/
      types.ts                  # Category 타입
      categories.ts             # 고정 카테고리 상수 목록
      api/categoryQueries.ts    # useCategories (지금은 상수 반환)

    auth/
      types.ts                  # User, Role 타입
      AuthContext.tsx           # 현재 사용자 컨텍스트 (localStorage 영속)
      useAuth.ts                # useAuth() 훅
      mockUsers.ts             # 데모 사용자 목록 (admin/user)
      RequireAuth.tsx           # 라우트 가드
      LoginPage.tsx
      permissions.ts            # canEditPost(user, post) 등 권한 헬퍼

  components/                   # 공용 UI
    Layout.tsx                  # Header + Outlet
    Header.tsx                  # 네비 + 현재 사용자 + 로그아웃
    SearchBar.tsx
    CategoryFilter.tsx
    SortSelect.tsx
    Pagination.tsx
    Button.tsx / Field.tsx      # 작은 공용 입력/버튼 (선택)
    EmptyState.tsx / ErrorState.tsx / Spinner.tsx

  lib/
    storage.ts                  # localStorage 직렬화 헬퍼 (try/catch, 버전키)
    paginate.ts                 # 클라이언트 측 페이징/정렬/필터 유틸
    id.ts                       # id 생성 (crypto.randomUUID)

  pages/
    NotFoundPage.tsx

  styles/
    *.module.css 또는 컴포넌트와 동거
```

**데이터 흐름:** Page → react-query 훅(`postQueries`) → `repositoryProvider`가 고른 `PostRepository` 구현 → (지금) localStorage / (나중) axios. UI는 repository 구현을 모름.

---

## API 명세 초안 (REST 계약 — repository가 구현, 나중 Flask가 동일 제공)

Base URL: `/api`

### Posts
| Method | Path | 설명 | Query / Body |
|--------|------|------|--------------|
| GET | `/api/posts` | 목록(검색/필터/정렬/페이징) | `?q=&category=&sort=latest\|views&page=1&size=20` |
| GET | `/api/posts/:id` | 단건 조회 (순수 read, 부작용 없음) | - |
| POST | `/api/posts/:id/views` | 조회수 +1 (명시적 write, idempotent하지 않음) | - |
| POST | `/api/posts` | 생성 | `{ title, content, categoryId }` |
| PUT | `/api/posts/:id` | 수정 | `{ title, content, categoryId }` |
| DELETE | `/api/posts/:id` | 삭제 | - |

> 조회수는 **GET의 부작용이 아니라 별도 write 엔드포인트**(`POST /api/posts/:id/views`)로 분리한다. GET이 read-only여야 react-query가 refetch(포커스/무효화) 시 조회수를 잘못 증가시키지 않는다. 클라이언트는 상세 진입 시 세션 단위 가드(`Set<postId>`)로 1회만 호출한다.

**목록 응답:**
```json
{
  "items": [ /* Post[] */ ],
  "total": 137,
  "page": 1,
  "size": 20
}
```

**Post 객체:**
```json
{
  "id": "uuid",
  "title": "string",
  "content": "string (markdown)",
  "categoryId": "notice|general|qna|etc",
  "author": { "id": "uuid", "name": "홍길동", "role": "user" },
  "views": 0,
  "createdAt": "2026-05-24T07:00:00Z",
  "updatedAt": "2026-05-24T07:00:00Z"
}
```

### Categories
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/categories` | 카테고리 목록 (지금은 고정 상수) |

```json
[
  { "id": "notice", "name": "공지" },
  { "id": "general", "name": "일반" },
  { "id": "qna", "name": "질문" },
  { "id": "etc", "name": "기타" }
]
```

### Auth (mock)
| Method | Path | 설명 | Body / 응답 |
|--------|------|------|-------------|
| POST | `/api/auth/login` | 로그인 | req `{ username }` → res `{ user: User }` |
| POST | `/api/auth/logout` | 로그아웃 | - |
| GET | `/api/auth/me` | 현재 사용자 | res `{ user: User \| null }` |

**User 객체:** `{ "id": "uuid", "name": "string", "role": "admin" | "user" }`

> 지금은 위 계약을 `localPostRepository` / `AuthContext`가 localStorage로 흉내 낸다. 나중 Flask는 동일 경로·동일 응답 형태를 제공하면 프론트 변경 최소화.

---

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Post | core domain | id, title, content(md), categoryId, author, views, createdAt, updatedAt | Post belongs-to Category; Post authored-by User |
| Category | supporting | id, name | Category has-many Posts |
| User | core domain | id, name, role | User has-many Posts |
| Role | value/enum | 'admin' \| 'user' | User has-a Role |
| Comment | future | id, postId, author, content, createdAt | Comment belongs-to Post (추가 기능) |

## Ontology Convergence
| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 3 (Post, Category, User) | 3 | - | - | N/A |
| 2 | 4 (+Role) | 1 | 0 | 3 | 75% |
| 3 | 5 (+Comment*) | 1 | 0 | 4 | 80% |
| 4 | 5 | 0 | 0 | 5 | 100% |
| 5 | 5 | 0 | 0 | 5 | 100% |

→ 온톨로지 수렴 (2라운드 연속 동일). 도메인 모델 안정.

---

## Interview Transcript
<details>
<summary>Full Q&A (Round 0 + 5 rounds)</summary>

### Round 0 — Topology Gate
**Q:** 최상위 컴포넌트 토폴로지 확인 (Posts CRUD / Browse&Search / Data·API / Auth)
**A:** 인증/사용자도 포함 → 4개 활성 컴포넌트 확정

### Round 1 — Data/API Layer / Goal
**Q:** 백엔드 없는 지금, 게시글 데이터를 어떻게 다루나?
**A:** localStorage 영속화
**Ambiguity:** 83%

### Round 2 — Auth/User / Goal
**Q:** 지금 단계 인증 수준은?
**A:** Mock 로그인 + 역할(admin/user)
**Ambiguity:** 65%

### Round 3 — Posts & Browse
**Q:** 본문 형식 / 카테고리 운영 / 댓글 여부
**A:** 마크다운 / 고정 목록·단일 선택 / 댓글은 추가 기능
**Ambiguity:** 43%

### Round 4 — Browse & Search (Contrarian)
**Q:** 검색 대상 / 페이징 방식·크기 / 정렬·조회수 규칙
**A:** 제목+본문+작성자 / 페이지번호 20개 / 최신+조회순, 상세 진입 +1
**Ambiguity:** 31%

### Round 5 — 전체 마감
**Q:** 스타일링 / MVP·추가·나중 범위 / API 계약 방향
**A:** CSS Modules / 제안대로 확정 / 표준 REST {items,total,page,size} 확정
**Ambiguity:** 19.5% (PASSED)

</details>
