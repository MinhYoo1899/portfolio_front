# 아키텍처

## 핵심 원칙

1. **계약 우선(Contract-first)** — UI는 REST 계약과 `PostRepository` 인터페이스만 알고, 데이터 출처(localStorage)는 모른다.
2. **Feature 기반 응집** — `features/{posts,categories,auth}`로 도메인을 묶고, 도메인 불가지 유틸만 `lib/`, 공용 UI만 `components/`에 둔다.
3. **TanStack Query가 단일 서버상태 출처** — 컴포넌트는 query/mutation 훅만 사용. query는 부작용 없는 read(조회수 증가는 별도 mutation).
4. **URL이 목록 상태의 출처** — 검색/카테고리/정렬/페이지는 쿼리스트링에 동기화. 캐시는 안정 키 `['posts']` 하나로 두고 필터/정렬/페이징은 클라이언트에서 파생.

## 폴더 구조

```
src/
  main.tsx                      # QueryClientProvider > AuthProvider > RouterProvider 부트스트랩
  router.tsx                    # createBrowserRouter (loaders/actions 미사용)
  App.tsx                       # 미사용 셸 (라우팅은 RouterProvider가 담당)

  api/
    queryClient.ts              # QueryClient (staleTime: Infinity, retry: 0)
    httpClient.ts               # axios 인스턴스 (baseURL '/api') — 향후 백엔드용 스텁

  lib/
    storage.ts                  # localStorage 직접 접근 유일 지점 (readJSON/writeJSON, 'board-app:' prefix)
    id.ts                       # newId() = crypto.randomUUID()
    paginate.ts                 # 제네릭 filterSortPaginate<T>()
    date.ts                     # formatDate()

  components/                   # 공용 UI (각 *.module.css 동반)
    Layout.tsx  Header.tsx
    SearchBar.tsx  CategoryFilter.tsx  SortSelect.tsx  Pagination.tsx
    EmptyState.tsx  ErrorState.tsx  Spinner.tsx  RouteError.tsx

  pages/
    NotFoundPage.tsx

  features/
    auth/
      types.ts                  # Role, User
      mockUsers.ts              # MOCK_USERS (관리자/홍길동/김철수)
      authContextValue.ts       # Context 객체 + AuthContextValue 타입
      AuthContext.tsx           # AuthProvider
      useAuth.ts                # useAuth() → { user, login, logout }
      permissions.ts            # canEditPost / canDeletePost
      RequireAuth.tsx           # 라우트 가드 (<Outlet/> 또는 /login 리다이렉트)
      LoginPage.tsx             # mock 로그인 + redirect 검증

    categories/
      types.ts                  # Category
      categories.ts             # CATEGORIES, CATEGORY_IDS (고정 목록)
      api/categoryQueries.ts    # useCategories()

    posts/
      types.ts                  # Post, PostInput, PostQuery, Page<T>, RepositoryError
      api/
        postRepository.ts       # interface PostRepository
        localPostRepository.ts  # localStorage 구현 (현재 활성)
        httpPostRepository.ts   # axios 구현 스텁 (향후 백엔드)
        repositoryProvider.ts   # getPostRepository() — 활성 구현 선택
        seed.ts                 # 48개 시드 + ensureSeed() (idempotent)
        postQueries.ts          # usePosts/usePost/useCreatePost/useUpdatePost/useDeletePost/useIncrementViews
      components/
        PostList.tsx  PostListItem.tsx  PostMeta.tsx
        MarkdownView.tsx  PostActions.tsx  PostForm.tsx
      pages/
        BoardListPage.tsx  PostDetailPage.tsx
        PostCreatePage.tsx  PostEditPage.tsx
```

## 데이터 흐름

```
Page/Component
   │  (query/mutation 훅만 호출)
   ▼
features/posts/api/postQueries.ts   ← TanStack Query (캐시·로딩·에러)
   │
   ▼
repositoryProvider.getPostRepository()
   │
   ├─ localPostRepository  → lib/storage → localStorage   (현재)
   └─ httpPostRepository   → api/httpClient → REST/Flask   (향후)
```

UI 컴포넌트는 repository 구현이나 localStorage를 직접 모른다. 데이터 출처 교체는 `repositoryProvider` 한 곳만 바꾸면 된다.

## 라우팅 (React Router v7)

`createBrowserRouter` 데이터 라우터, **loaders/actions 미사용**(TanStack Query가 데이터 소유).

| 경로 | 컴포넌트 | 가드 |
|------|----------|------|
| `/` | BoardListPage | — |
| `/posts/:id` | PostDetailPage | — (404 → NotFound) |
| `/posts/new` | PostCreatePage | RequireAuth |
| `/posts/:id/edit` | PostEditPage | RequireAuth + 로드 후 canEditPost |
| `/login` | LoginPage | — (redirect 검증) |
| `*` | NotFoundPage | — |
| (루트) | `errorElement: <RouteError/>` | — |

- 목록 필터 상태(`?q=&category=&sort=&page=`)는 `useSearchParams`로 URL과 동기화 → 공유·뒤로가기 자연스럽게 동작.
- 필터/정렬/검색 변경은 `replace: true`, 페이지 이동은 push.

## 상태 관리

- **서버 상태**: TanStack Query
  - `usePosts()` → 키 `['posts']`로 전체 컬렉션 1회 fetch. 필터/정렬/페이징은 `BoardListPage`에서 `useMemo` + `filterSortPaginate`로 파생.
  - `staleTime: Infinity` — localStorage는 변경을 mutation 무효화로만 반영하므로 불필요한 refetch 방지.
  - 무효화 규약: create/delete → `['posts']`; update → `['posts']` + `['post', id]`; **incrementViews → 무효화 없음**(refetch 루프 방지).
- **인증 상태**: React Context (`AuthProvider`), localStorage(`board-app:auth`) 영속.

## 조회수 처리

조회수 증가는 GET의 부작용이 아니라 별도 mutation(`useIncrementViews`)이다.
`PostDetailPage`는 **모듈 스코프 `Set<string>`** 가드로 세션당 해당 글 1회만 mutate한다
(React 19 StrictMode의 이중 마운트에도 1회 보장). 무효화하지 않는다.
