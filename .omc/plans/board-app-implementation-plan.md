# board-app 구현 계획 (Consensus, Iteration 2)

> Source spec: `.omc/specs/deep-interview-board-app.md` (ambiguity 19.5%, PASSED)
> Mode: consensus + direct, RALPLAN-DR short
> Status: **pending approval**
> Changelog: Architect(APPROVE-WITH-CHANGES) + Critic(REJECT→재검토) 피드백 10건 전부 반영

## RALPLAN-DR Summary

### Principles (5)
1. **API 계약 우선(Contract-first):** UI는 REST 계약(`{items,total,page,size}`, 쿼리 파라미터)만 알고, 데이터 출처는 `PostRepository` 뒤에 숨긴다.
2. **Feature 기반 응집:** `features/{posts,categories,auth}`로 도메인을 묶고, 도메인-불가지(domain-agnostic) 유틸만 `lib/`, 공용 UI만 `components/`.
3. **react-query를 단일 서버상태 출처로(+순수 read 보장):** 컴포넌트는 query/mutation 훅만 사용. **query는 부작용 없는 read여야 한다**(조회수 증가는 별도 mutation).
4. **URL을 목록 상태의 출처로:** 검색/카테고리/정렬/페이지는 쿼리스트링에 동기화. 단, 클라이언트 캐시는 안정 키 `['posts']` 하나로 두고 필터/정렬/페이징은 클라이언트에서 파생.
5. **MVP 경계 엄수:** 댓글/미리보기/첨부/다크모드/실백엔드는 폴더·타입만 확장 가능하게 두고 구현하지 않는다.

### Decision Drivers (top 3)
1. 나중 Flask/REST 교체 비용 최소화 (가장 중요)
2. 사내 게시판 수준의 단순성·가독성 (과설계 회피)
3. 16개 Acceptance Criteria의 검증 가능성

### Viable Options
**Option A — Repository 인터페이스 + react-query 훅 (채택, hardened)**
- Pros: API 교체 시 repository 구현체 교체로 수렴; 훅 시그니처 불변; mock 주입 테스트 용이; AC12 직접 충족
- Cons: 초기 보일러플레이트 증가. localStorage(동기)와 HTTP(비동기·서버페이징·status 에러)의 임피던스 차이는 **계약 하드닝**(typed error, 정확한 envelope)으로 흡수

**Option B — react-query에서 axios 직접 호출 + MSW로 mock**
- Pros: 실제 HTTP/에러 경로를 처음부터 사용
- **Rejection (강화):** B는 react-query를 **전송 계층(axios)에 직접 결합**시켜 Driver 1이 요구하는 repository seam을 제거한다. (MSW의 새로고침 휘발은 부차적 근거일 뿐, 핵심은 교체 가능한 seam 상실.) → 탈락

**Option C — 컴포넌트에서 localStorage 직접 접근**
- Invalidation: API 교체 시 전 컴포넌트 수정 → Driver 1 정면 위반. 즉시 탈락.

→ **Option A (hardened)** 채택.

---

## Requirements Summary
React 19 + Vite + TS 사내 게시판 프론트엔드를 백엔드 없이 동작하게 구축. 게시글 CRUD, 고정 카테고리 단일선택 필터, 통합 검색(제목+본문+작성자), 페이지네이션(20/page, 클라이언트 측), 정렬(최신/조회), 조회수(상세 진입 시 별도 write로 +1, 세션 1회), 마크다운 본문, Mock 로그인+역할(admin/user). 데이터는 localStorage 영속화 + repository 추상화. 스타일은 CSS Modules.

## Acceptance Criteria (spec AC1~16 + 추가, 검증 가능)
- [ ] AC1 `/` 목록에 제목·작성자·작성일·조회수·카테고리 표시
- [ ] AC2 작성→목록/상세 반영, 새로고침 후 유지(localStorage); mutation 후 `['posts']` 무효화로 목록 즉시 반영
- [ ] AC3 상세에서 마크다운 렌더링 + 메타 표시
- [ ] AC4 수정 시 `updatedAt` 갱신·유지; `['post',id]`+`['posts']` 무효화
- [ ] AC5 삭제 확인 후 제거·유지; `['posts']` 무효화
- [ ] AC6 권한: admin=전체, user=본인, 비로그인=버튼 숨김 (UI)
- [ ] AC7 검색이 제목·본문·작성자 매칭 (대소문자 무시)
- [ ] AC8 카테고리 단일선택 필터 (옵션은 `useCategories()` 출처)
- [ ] AC9 20개/페이지 페이지 번호 이동 — **시드 ≥45개로 ≥3페이지 검증 가능**
- [ ] AC10 최신/조회 정렬 전환
- [ ] AC11 상세 진입 시 조회수 +1 — 세션 `Set<id>` 가드로 정확히 1회 (StrictMode 이중 마운트에도 1회)
- [ ] AC12 데이터 접근이 `PostRepository` 경유 + localStorage 구현 주입; `httpPostRepository` 스텁이 동일 인터페이스로 컴파일
- [ ] AC13 react-query 로딩/에러/캐시 처리 — **목록·상세·작성·수정 4개 페이지 전부** + 라우터 `errorElement`
- [ ] AC14 mock 로그인 후 현재 사용자 localStorage 유지
- [ ] AC15 보호 라우트 비로그인 시 `/login?redirect=` 이동 (redirect는 same-origin 상대경로만)
- [ ] AC16 헤더에 사용자/역할 표시 + 로그아웃
- [ ] AC17 (신규) `/posts/:id/edit`는 post 로드 후 `canEditPost(user,post)` 거짓이면 상세로 리다이렉트 (라우트 레벨 권한)
- [ ] AC18 (신규) 존재하지 않는 `:id` 상세/수정 시 NotFound 처리 (blank/crash 금지)
- [ ] AC-Q `npm run build`(tsc -b + vite build)와 `npm run lint` 무오류

## Implementation Steps

### Phase 0 — 정리 & 의존성
1. Vite 데모 제거: `src/App.tsx` 카운터/hero/`/icons.svg` 섹션 삭제, `src/App.css`·`src/index.css` 데모 스타일 정리, 미사용 `src/assets/*`(react/vite/hero) 참조 제거
2. `npm i react-markdown@^9 remark-gfm@^4` (버전 핀, React 19 peer 확인)
3. Prettier: `.prettierrc`(singleQuote, semi:false 등 기존 코드 스타일 일치), `.prettierignore`, `package.json`에 `"format": "prettier --write ."`
4. (선택) `@/`→`src/` alias: 채택 시 `vite.config.ts` `resolve.alias` + `tsconfig.app.json` `compilerOptions.paths` **동시** 수정
5. (선택) ESLint 가드: `eslint.config.js`에 `no-restricted-syntax`로 `MemberExpression[object.name='localStorage']`/`sessionStorage` 금지, `src/lib/storage.ts`·`features/**/api/**` 예외. **미채택 시** 위험표의 mitigation을 "리뷰 컨벤션"으로 표기(린트 강제 주장 금지)

### Phase 1 — 기반(부트스트랩/라우터/유틸)
6. `src/lib/storage.ts` — `readJSON/writeJSON` (try/catch, 버전 키 `board-app:v1`)
7. `src/lib/id.ts` — `crypto.randomUUID` 래퍼 (secure context/localhost 가정)
8. `src/lib/paginate.ts` — **제네릭** `filterSortPaginate<T>(items, { predicate, comparator, page, size }): Page<T>` (도메인-불가지)
9. `src/api/queryClient.ts` — `QueryClient`, **`staleTime: Infinity`**(로컬 소스, 변경은 mutation 무효화로만), retry:0
10. `src/api/httpClient.ts` — axios 인스턴스(baseURL `/api`, 인터셉터) ※ 나중용 스텁
11. `src/router.tsx` — `createBrowserRouter` 데이터 라우터. **loaders/actions 미사용(react-query가 모든 데이터 소유)**. 루트에 `errorElement: <RouteError/>`
12. `src/main.tsx` — `QueryClientProvider` + `AuthProvider` + `RouterProvider`

### Phase 2 — 도메인 타입 & 데이터 레이어
13. `features/posts/types.ts` — `Post`(id,title,content,categoryId,author{id,name,role},views,createdAt,updatedAt), `PostInput`, `PostQuery`, `Page<T>={items,total,page,size}`, `RepositoryError{status?:number;message:string}`
14. `features/categories/types.ts` + `categories.ts` — 고정 목록(notice/general/qna/etc)
15. `features/auth/types.ts` — `User`, `Role='admin'|'user'`
16. `features/posts/api/postRepository.ts` — `interface PostRepository { list(q:PostQuery):Promise<Page<Post>>; get(id):Promise<Post>(404→throw RepositoryError{status:404}); create(input,author); update(id,input); remove(id); incrementViews(id) }`
17. `features/posts/api/localPostRepository.ts` — localStorage 구현. **정확히 `{items,total,page,size}` envelope 반환**, not-found는 `RepositoryError{status:404}` throw. `incrementViews`는 해당 post views+1 저장
18. `features/posts/api/seed.ts` — **≥45개 idempotent 시드**(4개 카테고리 분산, views/createdAt 다양). `board-app:v1` 키 없을 때만 주입(사용자 글 보존)
19. `features/posts/api/httpPostRepository.ts` — axios 구현 스텁(경로: `/posts`, `/posts/:id`, `/posts/:id/views`), 동일 인터페이스로 **컴파일만**
20. `features/posts/api/repositoryProvider.ts` — `getPostRepository()` (현재 local; env 플래그 분기 자리)
21. `features/posts/api/postQueries.ts`:
    - `usePosts()` → **안정 키 `['posts']`**로 전체 컬렉션 fetch (1회)
    - `usePost(id)` → 키 `['post', id]`, 순수 read
    - `useCreatePost`/`useUpdatePost`/`useDeletePost` mutations
    - 무효화 규약: create/delete → `invalidateQueries(['posts'])`; update → `['posts']` + `['post',id]`; **incrementViews → 무효화 없음**(refetch 루프 방지)
    - `useIncrementViews(id)` mutation
22. 목록 파생: `BoardListPage`에서 `useSearchParams` → `useMemo`로 `filterSortPaginate` 적용(서버 키에 파라미터 미포함)
23. `features/categories/api/categoryQueries.ts` — `useCategories()`

### Phase 3 — 인증
24. `features/auth/mockUsers.ts` — 데모 사용자(admin 1, user 2)
25. `features/auth/AuthContext.tsx` + `useAuth.ts` — `{user, login(name), logout()}`, localStorage 영속(`board-app:auth`)
26. `features/auth/permissions.ts` — `canEditPost(user,post)`, `canDeletePost(user,post)` (admin || author.id===user.id)
27. `features/auth/RequireAuth.tsx` — 비로그인 시 `<Navigate to={'/login?redirect='+encodeURIComponent(pathname)}>`
28. `features/auth/LoginPage.tsx` — mock 사용자 선택/입력 → login → redirect. **redirect 검증**: `^/(?!/)` 패턴(프로토콜-상대 차단)만 허용, 아니면 `/`

### Phase 4 — 공용 UI & 레이아웃
29. `components/Layout.tsx` — `<Header/>` + `<main><Outlet/></main>`
30. `components/Header.tsx` — 홈/글쓰기 링크, 현재 사용자/역할 + 로그아웃 (비로그인 시 로그인 링크)
31. `components/SearchBar.tsx`, `CategoryFilter.tsx`(옵션=`useCategories`), `SortSelect.tsx`, `Pagination.tsx`
32. `components/EmptyState.tsx`, `ErrorState.tsx`, `Spinner.tsx`, `RouteError.tsx`
33. 각 컴포넌트 `*.module.css`

### Phase 5 — 게시글 기능 UI
34. `features/posts/components/`: `PostList`, `PostListItem`, `PostMeta`, `MarkdownView`(react-markdown+remark-gfm, raw HTML 비활성=XSS 안전), `PostActions`(권한 가드), `PostForm`(작성/수정 공용)
35. **PostForm 검증 규칙**: title 필수·1~120자, content 필수·1자 이상, categoryId ∈ 고정 카테고리. 위반 시 인라인 에러 + 제출 차단
36. `BoardListPage.tsx` — searchParams 동기화(필터/정렬=`replace:true`, 페이지=push), `usePosts`+`useMemo` 파생, 로딩(Spinner)/에러(ErrorState)/빈(EmptyState, 필터결과 0 포함) 상태, 목록+페이지네이션
37. `PostDetailPage.tsx` — `usePost(id)`: 로딩/에러/`status===404`→NotFound. 마운트 시 세션 `Set<id>`(sessionStorage/모듈 스코프) 가드로 `incrementViews` 1회. 권한별 수정/삭제 버튼
38. `PostCreatePage.tsx` — `PostForm`, 성공 시 상세 이동, 로딩/에러 처리
39. `PostEditPage.tsx` — `usePost` 로드 → **`canEditPost` 거짓이면 `<Navigate to={'/posts/'+id} replace>`(AC17)**, 404 처리(AC18), `PostForm` 프리필
40. `pages/NotFoundPage.tsx`

### Phase 6 — 마감 & 검증
41. CSS Modules 마감(목록/상세/폼/헤더)
42. `npm run lint`, `npm run build` 무오류화
43. `npm run dev`로 AC1~18 수동 검증

## URL Routing
| 경로 | 컴포넌트 | 가드 | query/params |
|------|----------|------|--------------|
| `/` | BoardListPage | - | `?q=&category=&sort=&page=` |
| `/posts/:id` | PostDetailPage | - | `:id` (404→NotFound) |
| `/posts/new` | PostCreatePage | RequireAuth | - |
| `/posts/:id/edit` | PostEditPage | RequireAuth + post-load canEditPost | `:id` |
| `/login` | LoginPage | - | `?redirect=`(검증됨) |
| `*` | NotFoundPage | - | - |
| (root) | errorElement: RouteError | - | - |

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| localStorage→API 교체 누수 | 높음 | repository 인터페이스 + react-query 훅; typed `RepositoryError`+정확 envelope로 임피던스 흡수; httpPostRepository 컴파일 체크 |
| 조회수 중복 증가(StrictMode/refetch) | 중 | 조회수는 별도 mutation(GET 부작용 제거), 세션 `Set<id>` 가드 1회, 무효화 안 함 |
| 목록 캐시 파편화/무효화 누락 | 중 | 안정 키 `['posts']`+`staleTime:Infinity`, 파생은 클라이언트; mutation별 무효화 명시 |
| edit 라우트 권한 우회(URL 직접 입력) | 높음 | post 로드 후 `canEditPost` 라우트 레벨 검증(AC17), 버튼 숨김에 의존 안 함 |
| 마크다운 XSS | 중 | react-markdown 기본(raw HTML off), `rehype-raw` 미사용 |
| open-redirect (redirect 파라미터) | 중 | same-origin 상대경로(`^/(?!/)`)만 허용, 그 외 `/` |
| 시드 부족으로 AC9 검증 불가 | 중 | ≥45개 시드(≥3페이지), idempotent |
| Node v23 EBADENGINE | 낮음 | 동작 무방, 권장만 표기 |

## Verification Steps
1. `npm run build` → 타입/빌드 0 에러
2. `npm run lint` → 0 에러
3. `npm run dev` 수동:
   - AC2: 글 작성 → 목록 즉시 반영 → 새로고침 후 유지
   - AC6/15/17: admin/user/비로그인 권한; user가 타인 글 `/edit` URL 직접 입력 → 상세로 리다이렉트
   - AC7~10: 검색(제목/본문/작성자)·카테고리·정렬·페이지 2/3 이동
   - AC11: 상세 진입 1회 +1, StrictMode에서도 1회; 재진입 동작 확인
   - AC13/18: 없는 id 진입 → NotFound, 각 페이지 로딩/에러 상태
4. AC12 설계 검증: `repositoryProvider`만 http로 바꿔도 `tsc` 통과

## ADR (Architecture Decision Record)
- **Decision:** `PostRepository` 인터페이스 + react-query 훅 레이어(Option A, hardened) 위에 feature 기반 프론트엔드를 구축한다. 데이터는 localStorage 영속, 조회수는 별도 write 엔드포인트, 목록 캐시는 안정 키+클라이언트 파생.
- **Drivers:** (1) Flask 교체 비용 최소화 (2) 단순성 (3) AC 검증 가능성
- **Alternatives considered:** B(axios+MSW) — repository seam 상실로 Driver 1 위반; C(컴포넌트 직접 localStorage) — 교체 시 전면 수정으로 탈락
- **Why chosen:** A는 seam을 유지하며 AC12를 직접 충족하고, 계약 하드닝(typed error/정확 envelope/컴파일되는 http 스텁)으로 B의 계약 충실성 이점 대부분을 흡수
- **Consequences:** 초기 보일러플레이트 증가; 대신 교체 위험 국소화. query 순수성 규약 준수 필요(조회수 mutation 분리)
- **Follow-ups:** Flask 연동 시 httpPostRepository 채우기 + 인터셉터 인증; 댓글/미리보기/첨부/다크모드(추가); `filterSortPaginate` 단위 테스트(Vitest) 1개 추가 권장

## Changelog (적용된 개선)
1. 조회수: GET 부작용 제거→별도 `POST /posts/:id/views`, 세션 Set 가드, 무효화 없음 (spec 라인 수정 완료)
2. 목록 캐시: 안정 키 `['posts']`+`staleTime:Infinity`+클라이언트 파생, mutation별 무효화 명시
3. `/posts/:id/edit` post-load `canEditPost` 라우트 권한(AC17)
4. 상세/작성/수정 로딩·에러·404 + 라우터 `errorElement`(AC13/18)
5. ESLint 가드: 실제 `no-restricted-syntax` 규칙 또는 컨벤션으로 다운그레이드(허위 주장 제거)
6. 시드 ≥45개 idempotent
7. repository 하드닝: typed `RepositoryError{status?}`, 정확 envelope, 제네릭 `filterSortPaginate<T>`, 404 정형화
8. redirect same-origin 검증
9. PostForm 검증 규칙 명시
10. Option B 거부 근거를 repository seam 상실(Driver 1)로 강화

## Out of Scope
댓글, 마크다운 미리보기, 첨부파일, 다크모드, 실제 Flask/REST 연동, 실제 로그인/권한 서버검증, 알림/추천.
