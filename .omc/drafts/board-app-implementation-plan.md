# [DRAFT] board-app 구현 계획 (Consensus)

> Source spec: `.omc/specs/deep-interview-board-app.md` (ambiguity 19.5%, PASSED)
> Mode: consensus + direct, RALPLAN-DR short
> Status: DRAFT (Architect/Critic 검토 전)

## RALPLAN-DR Summary

### Principles (5)
1. **API 계약 우선(Contract-first):** UI는 REST 계약(`{items,total,page,size}`, 쿼리 파라미터)만 알고, 데이터 출처는 `PostRepository` 뒤에 숨긴다. localStorage→Flask 교체 시 UI/훅 변경 0.
2. **Feature 기반 응집:** `features/{posts,categories,auth}`로 도메인을 묶고, 공용 UI만 `components/`에 둔다.
3. **react-query를 단일 서버상태 출처로:** 컴포넌트는 직접 repository를 호출하지 않고 query/mutation 훅만 사용한다.
4. **URL을 목록 상태의 출처로:** 검색/카테고리/정렬/페이지는 쿼리스트링에 동기화해 공유·뒤로가기를 보장한다.
5. **MVP 경계 엄수:** 댓글/미리보기/첨부/다크모드/실백엔드는 폴더·타입만 확장 가능하게 두고 구현하지 않는다.

### Decision Drivers (top 3)
1. 나중 Flask/REST 교체 비용 최소화 (가장 중요)
2. 사내 게시판 수준의 단순성·가독성 (과설계 회피)
3. 16개 Acceptance Criteria의 검증 가능성

### Viable Options
**Option A — Repository 인터페이스 + react-query 훅 (채택)**
- Pros: API 교체가 구현체 1개 교체로 끝남; 훅 시그니처 불변; 테스트 시 mock 주입 용이
- Cons: 초기 보일러플레이트(인터페이스+구현체) 약간 증가

**Option B — react-query에서 axios 직접 호출 + MSW로 mock**
- Pros: 실제 HTTP 경로를 처음부터 사용, 계약 검증 강함
- Cons: 지금 localStorage 영속화 요구와 어긋남(MSW는 새로고침 시 휘발 or 별도 저장 필요); 사용자가 R1에서 localStorage 선택

**Option C — 컴포넌트에서 localStorage 직접 접근**
- Invalidation: API 교체 시 전 컴포넌트 수정 필요 → Driver 1 위반. 즉시 탈락.

→ Option A 채택. B는 R1 결정(localStorage)과 충돌, C는 교체비용 원칙 위반.

---

## Requirements Summary
React 19 + Vite + TS 사내 게시판 프론트엔드를 백엔드 없이 동작하게 구축. 게시글 CRUD, 고정 카테고리 단일선택 필터, 통합 검색(제목+본문+작성자), 페이지네이션(20/page, 클라이언트 측), 정렬(최신/조회), 조회수(+1 상세 진입), 마크다운 본문, Mock 로그인+역할(admin/user). 데이터는 localStorage 영속화 + repository 추상화. 스타일은 CSS Modules.

## Acceptance Criteria (spec AC1~16 상속, 검증 가능)
- [ ] AC1 `/` 목록에 제목·작성자·작성일·조회수·카테고리 표시
- [ ] AC2 작성→목록/상세 반영, 새로고침 후 유지(localStorage)
- [ ] AC3 상세에서 마크다운 렌더링 + 메타 표시
- [ ] AC4 수정 시 `updatedAt` 갱신·유지
- [ ] AC5 삭제 확인 후 제거·유지
- [ ] AC6 권한: admin=전체, user=본인, 비로그인=버튼 숨김
- [ ] AC7 검색이 제목·본문·작성자 매칭
- [ ] AC8 카테고리 단일선택 필터
- [ ] AC9 20개/페이지 페이지 번호 이동
- [ ] AC10 최신/조회 정렬 전환
- [ ] AC11 상세 진입 시 조회수 +1
- [ ] AC12 데이터 접근이 `PostRepository` 경유 + localStorage 구현 주입
- [ ] AC13 react-query 로딩/에러/캐시 처리
- [ ] AC14 mock 로그인 후 현재 사용자 localStorage 유지
- [ ] AC15 보호 라우트 비로그인 시 `/login?redirect=` 이동
- [ ] AC16 헤더에 사용자/역할 표시 + 로그아웃
- [ ] AC-Q `npm run build`(tsc -b + vite build)와 `npm run lint` 무오류

## Implementation Steps

### Phase 0 — 정리 & 의존성
1. Vite 데모 제거: `src/App.tsx` 카운터/로고 섹션 삭제, `src/App.css` 데모 스타일 정리, 미사용 `src/assets/*`(react/vite/hero) 참조 제거
2. `npm i react-markdown remark-gfm` (마크다운 렌더)
3. Prettier: `.prettierrc`(singleQuote, semi 등), `.prettierignore`, `package.json`에 `"format": "prettier --write ."`
4. (선택) `vite.config.ts`+`tsconfig`에 `@/` → `src/` alias

### Phase 1 — 기반(부트스트랩/라우터/유틸)
5. `src/lib/storage.ts` — `readJSON/writeJSON` (try/catch, 버전 키 `board-app:v1`)
6. `src/lib/id.ts` — `crypto.randomUUID` 래퍼
7. `src/lib/paginate.ts` — `filterSortPaginate(posts, {q,category,sort,page,size})` → `{items,total,page,size}`
8. `src/api/queryClient.ts` — `QueryClient` (staleTime, retry 설정)
9. `src/api/httpClient.ts` — axios 인스턴스(baseURL `/api`, 인터셉터) ※ 나중용 스텁
10. `src/router.tsx` — `createBrowserRouter` 라우트 정의(아래 라우팅표)
11. `src/main.tsx` — `QueryClientProvider` + `AuthProvider` + `RouterProvider`

### Phase 2 — 도메인 타입 & 데이터 레이어
12. `features/posts/types.ts` — `Post`(id,title,content,categoryId,author{id,name,role},views,createdAt,updatedAt), 입력 DTO `PostInput`
13. `features/categories/types.ts` + `categories.ts` — 고정 목록(notice/general/qna/etc)
14. `features/auth/types.ts` — `User`, `Role='admin'|'user'`
15. `features/posts/api/postRepository.ts` — `interface PostRepository { list(query): Promise<Page<Post>>; get(id); create(input,author); update(id,input); remove(id); incrementViews(id) }`
16. `features/posts/api/localPostRepository.ts` — localStorage 구현 + 시드 데이터(20+개) 자동 주입
17. `features/posts/api/httpPostRepository.ts` — axios 구현 스텁(경로만, 미사용)
18. `features/posts/api/repositoryProvider.ts` — `getPostRepository()` (현재 local 반환; env 플래그 분기 자리)
19. `features/posts/api/postQueries.ts` — `usePosts(query)`, `usePost(id)`, `useCreatePost`, `useUpdatePost`, `useDeletePost`, `useIncrementViews` (queryKey 규약: `['posts', query]`, `['post', id]`, mutation invalidate)
20. `features/categories/api/categoryQueries.ts` — `useCategories()`

### Phase 3 — 인증
21. `features/auth/mockUsers.ts` — 데모 사용자(admin 1, user 2)
22. `features/auth/AuthContext.tsx` + `useAuth.ts` — `{user, login(name), logout()}`, localStorage 영속(`board-app:auth`)
23. `features/auth/permissions.ts` — `canEditPost(user, post)`, `canDeletePost(user, post)` (admin || author.id===user.id)
24. `features/auth/RequireAuth.tsx` — 비로그인 시 `<Navigate to="/login?redirect=...">`
25. `features/auth/LoginPage.tsx` — mock 사용자 선택/입력 → login → redirect

### Phase 4 — 공용 UI & 레이아웃
26. `components/Layout.tsx` — `<Header/>` + `<main><Outlet/></main>`
27. `components/Header.tsx` — 로고/홈 링크, 글쓰기 링크, 현재 사용자/역할 + 로그아웃 (비로그인 시 로그인 링크)
28. `components/SearchBar.tsx`, `CategoryFilter.tsx`, `SortSelect.tsx`, `Pagination.tsx`
29. `components/EmptyState.tsx`, `ErrorState.tsx`, `Spinner.tsx`
30. 각 컴포넌트 `*.module.css`

### Phase 5 — 게시글 기능 UI
31. `features/posts/components/`: `PostList`, `PostListItem`, `PostMeta`, `MarkdownView`(react-markdown+remark-gfm), `PostActions`(권한 가드), `PostForm`(작성/수정 공용, 제목·카테고리·마크다운, 검증)
32. `features/posts/pages/BoardListPage.tsx` — `useSearchParams`로 q/category/sort/page 동기화 → `usePosts` → 로딩/에러/빈 상태 → 목록+페이지네이션
33. `features/posts/pages/PostDetailPage.tsx` — `usePost` + 마운트 시 `useIncrementViews`(중복 방지: 세션 ref/한 번) + 권한별 수정/삭제
34. `features/posts/pages/PostCreatePage.tsx`, `PostEditPage.tsx` — `PostForm` 재사용, 성공 시 상세로 이동
35. `pages/NotFoundPage.tsx`

### Phase 6 — 마감 & 검증
36. CSS Modules 마감(목록/상세/폼/헤더 기본 스타일)
37. `npm run lint`, `npm run build` 무오류화
38. `npm run dev`로 AC1~16 수동 검증 (작성→새로고침→유지, 권한 분기, 검색/정렬/페이징, 조회수)

## URL Routing
| 경로 | 컴포넌트 | 가드 | query/params |
|------|----------|------|--------------|
| `/` | BoardListPage | - | `?q=&category=&sort=&page=` |
| `/posts/:id` | PostDetailPage | - | `:id` |
| `/posts/new` | PostCreatePage | RequireAuth | - |
| `/posts/:id/edit` | PostEditPage | RequireAuth + canEditPost | `:id` |
| `/login` | LoginPage | - | `?redirect=` |
| `*` | NotFoundPage | - | - |

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| localStorage→API 교체 시 누수(컴포넌트가 저장소 직접 접근) | 높음 | repository 인터페이스 + react-query 훅만 사용. 컴포넌트에서 localStorage import 금지(린트로 강제 가능) |
| 조회수 +1 중복 증가(StrictMode 이중 마운트/재방문) | 중 | 세션 단위 `viewedIds` Set 또는 effect ref 가드, "단순 처리"로 명세상 허용 |
| React 19 + react-router v7 + RTK Query 미사용 호환 | 중 | v7 `createBrowserRouter` 데이터 라우터 사용, 공식 API만 사용 |
| Node v23 EBADENGINE(ESLint 10) | 낮음 | 동작 무방, 빌드 영향 없음. 권장만 표기 |
| 마크다운 XSS | 중 | react-markdown 기본 비-raw HTML(안전). `rehype-raw` 미사용 유지 |
| 페이지네이션 URL/상태 불일치 | 중 | `useSearchParams` 단일 출처, 잘못된 page 클램프 |

## Verification Steps
1. `npm run build` → 타입/빌드 0 에러
2. `npm run lint` → 0 에러
3. `npm run dev` 수동: 글 작성 후 새로고침 유지(AC2), admin/user/비로그인 권한 분기(AC6/15), 검색·카테고리·정렬·페이징(AC7~10), 상세 진입 조회수 증가(AC11)
4. repository 교체 시뮬레이션: `repositoryProvider`만 바꿔도 빌드 통과(AC12 설계 검증)

## Out of Scope (이번 미구현)
댓글, 마크다운 미리보기, 첨부파일, 다크모드, 실제 Flask/REST 연동, 실제 로그인/권한 서버검증, 알림/추천.
