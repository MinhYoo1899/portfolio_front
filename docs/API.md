# API 명세 & 데이터 모델

현재는 `localPostRepository`(localStorage)가 아래 계약을 구현한다.
향후 Flask/REST 백엔드는 **동일한 경로·응답 형태**를 제공하면 프론트 변경이 최소화된다.

Base URL: `/api`

## 데이터 모델

### Post
```ts
interface Post {
  id: string
  title: string
  content: string          // 마크다운
  categoryId: string       // 'notice' | 'general' | 'qna' | 'etc'
  author: { id: string; name: string; role: 'admin' | 'user' }
  views: number
  createdAt: string        // ISO 8601
  updatedAt: string        // ISO 8601
}

interface PostInput {      // 작성/수정 요청 본문
  title: string
  content: string
  categoryId: string
}

interface PostQuery {      // 목록 쿼리 파라미터
  q?: string
  category?: string
  sort?: 'latest' | 'views'
  page?: number
  size?: number
}

interface Page<T> {        // 목록 응답 봉투(envelope)
  items: T[]
  total: number
  page: number
  size: number
}
```

### Category
```ts
interface Category { id: string; name: string }
// 고정 목록: notice(공지), general(일반), qna(질문), etc(기타)
```

### User
```ts
type Role = 'admin' | 'user'
interface User { id: string; name: string; role: Role }
```

### RepositoryError
```ts
class RepositoryError extends Error { status?: number }
// 예: 없는 글 조회 시 status === 404 → UI가 NotFound로 분기
```

## Posts

| Method | Path | 설명 | 요청 / 쿼리 |
|--------|------|------|-------------|
| GET | `/api/posts` | 목록 (검색/필터/정렬/페이징) | `?q=&category=&sort=latest\|views&page=1&size=20` |
| GET | `/api/posts/:id` | 단건 조회 (순수 read, 부작용 없음) | — |
| POST | `/api/posts/:id/views` | 조회수 +1 (명시적 write) | — |
| POST | `/api/posts` | 생성 | `{ title, content, categoryId }` |
| PUT | `/api/posts/:id` | 수정 (`updatedAt` 갱신) | `{ title, content, categoryId }` |
| DELETE | `/api/posts/:id` | 삭제 | — |

**목록 응답 예시**
```json
{
  "items": [ /* Post[] */ ],
  "total": 48,
  "page": 1,
  "size": 20
}
```

> **조회수 분리 원칙:** 조회수 증가는 GET의 부작용이 아니라 별도 `POST /api/posts/:id/views`다.
> GET이 read-only여야 클라이언트 캐시 refetch(포커스/무효화) 시 조회수가 잘못 증가하지 않는다.

## Categories

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/categories` | 카테고리 목록 (현재 고정 상수) |

```json
[
  { "id": "notice",  "name": "공지" },
  { "id": "general", "name": "일반" },
  { "id": "qna",     "name": "질문" },
  { "id": "etc",     "name": "기타" }
]
```

## Auth (mock)

| Method | Path | 설명 | Body / 응답 |
|--------|------|------|-------------|
| POST | `/api/auth/login` | 로그인 | req `{ username }` → res `{ user: User }` |
| POST | `/api/auth/logout` | 로그아웃 | — |
| GET | `/api/auth/me` | 현재 사용자 | res `{ user: User \| null }` |

> 현재 인증은 `AuthContext`가 localStorage(`board-app:auth`)로 흉내 낸다.
> redirect 파라미터는 same-origin 상대경로(`^/(?![/\\])`)만 허용하고 그 외에는 `/`로 폴백한다.

## Repository 인터페이스

프론트엔드가 의존하는 실제 계약(`features/posts/api/postRepository.ts`):

```ts
interface PostRepository {
  list(q: PostQuery): Promise<Page<Post>>
  get(id: string): Promise<Post>            // 없으면 throw RepositoryError(404)
  create(input: PostInput, author: User): Promise<Post>
  update(id: string, input: PostInput): Promise<Post>
  remove(id: string): Promise<void>
  incrementViews(id: string): Promise<void>
}
```

백엔드 연동 시: `httpPostRepository`(이미 동일 인터페이스로 컴파일됨)를 완성하고
`repositoryProvider.getPostRepository()`가 그것을 반환하도록 바꾸면 된다.
