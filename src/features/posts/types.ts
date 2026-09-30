import type { Role } from '../auth/types'

export interface Post {
  id: string
  title: string
  content: string
  categoryId: string
  author: { id: string; name: string; role: Role }
  views: number
  createdAt: string
  updatedAt: string
}

export interface PostInput {
  title: string
  content: string
  categoryId: string
}

export interface PostQuery {
  q?: string
  category?: string
  sort?: 'latest' | 'views'
  page?: number
  size?: number
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  size: number
}

// Typed error carrying an optional HTTP-style status so UI can branch on 404
// identically whether data comes from localStorage or a future REST backend.
export class RepositoryError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'RepositoryError'
    this.status = status
  }
}
