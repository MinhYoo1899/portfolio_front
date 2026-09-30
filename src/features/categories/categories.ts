import type { Category } from './types'

// Fixed category list (single-select filter). Not user-managed in MVP.
export const CATEGORIES: Category[] = [
  { id: 'notice', name: '공지' },
  { id: 'general', name: '일반' },
  { id: 'qna', name: '질문' },
  { id: 'etc', name: '기타' },
]

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id)
