import type { Post } from '../types'
import { CATEGORY_IDS } from '../../categories/categories'
import { MOCK_USERS } from '../../auth/mockUsers'
import { readJSON, writeJSON } from '../../../lib/storage'

// Storage key (versioned). Seed is injected only when this key is absent so
// user-created posts are never overwritten on subsequent loads.
export const POSTS_KEY = 'v1'

const SEED_COUNT = 48

// A few markdown bodies cycled across seed posts so the detail view exercises
// headings, lists, code blocks, and emphasis.
const MARKDOWN_SAMPLES: string[] = [
  `## 개요

이 글은 **마크다운**으로 작성되었습니다.

- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목

자세한 내용은 아래 코드를 참고하세요.

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}!\`
}
\`\`\`
`,
  `### 공지사항

> 중요한 내용입니다. 꼭 읽어주세요.

1. 일정 확인
2. 자료 준비
3. 제출 마감

| 항목 | 값 |
| --- | --- |
| 기한 | 금요일 |
| 담당 | 운영팀 |
`,
  `## 질문있습니다

코드가 동작하지 않습니다. 무엇이 문제일까요?

\`\`\`js
const x = [1, 2, 3]
x.map((n) => n * 2)
\`\`\`

\`map\`이 새 배열을 반환하는데 결과가 반영되지 않습니다.
`,
  `일반적인 글입니다. *기울임*과 **굵게**, 그리고 [링크](https://example.com)를 포함합니다.

여러 문단으로 구성되어 있으며 본문 검색 테스트에도 사용됩니다.
`,
]

const TITLE_PREFIXES = [
  '프로젝트 진행 상황',
  '사내 시스템 점검 안내',
  '회의록 공유',
  '개발 환경 설정 가이드',
  '배포 일정 변경',
  '신규 입사자 안내',
  '코드 리뷰 규칙',
  '휴가 신청 방법',
  '보안 정책 업데이트',
  '테스트 자동화 도입',
  '디자인 시스템 논의',
  '주간 업무 보고',
]

// Deterministic pseudo-random so the seed is stable across reloads (idempotent
// when re-derived) yet varied across posts.
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateSeedPosts(): Post[] {
  const posts: Post[] = []
  const baseTime = Date.UTC(2026, 4, 24, 7, 0, 0) // 2026-05-24T07:00:00Z

  for (let i = 0; i < SEED_COUNT; i++) {
    const author = MOCK_USERS[i % MOCK_USERS.length]
    const categoryId = CATEGORY_IDS[i % CATEGORY_IDS.length]
    const content = MARKDOWN_SAMPLES[i % MARKDOWN_SAMPLES.length]
    const titlePrefix = TITLE_PREFIXES[i % TITLE_PREFIXES.length]

    // Spread createdAt back in time by a varying number of hours.
    const hoursAgo = i * 7 + Math.floor(pseudoRandom(i + 1) * 5)
    const created = new Date(baseTime - hoursAgo * 3600 * 1000).toISOString()
    const views = Math.floor(pseudoRandom(i + 100) * 500)

    posts.push({
      id: `seed-${String(i + 1).padStart(3, '0')}`,
      title: `${titlePrefix} #${i + 1}`,
      content,
      categoryId,
      author: { id: author.id, name: author.name, role: author.role },
      views,
      createdAt: created,
      updatedAt: created,
    })
  }

  return posts
}

export const SEED_POSTS: Post[] = generateSeedPosts()

// Injects the seed only if no posts collection exists yet. Idempotent: a second
// call (or a reload with existing data) is a no-op and preserves user posts.
export function ensureSeed(): void {
  const existing = readJSON<Post[] | null>(POSTS_KEY, null)
  if (existing === null) {
    writeJSON(POSTS_KEY, SEED_POSTS)
  }
}
