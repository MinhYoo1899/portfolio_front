import type { User } from './types'

// Demo users for mock login: one admin, two regular users.
export const MOCK_USERS: User[] = [
  { id: 'u-admin', name: '관리자', role: 'admin' },
  { id: 'u-1', name: '홍길동', role: 'user' },
  { id: 'u-2', name: '김철수', role: 'user' },
]
