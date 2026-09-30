import type { PostRepository } from './postRepository'
import type { Page, Post, PostInput, PostQuery } from '../types'
import { RepositoryError } from '../types'
import type { User } from '../../auth/types'
import { readJSON, writeJSON } from '../../../lib/storage'
import { filterSortPaginate } from '../../../lib/paginate'
import { newId } from '../../../lib/id'
import { ensureSeed, POSTS_KEY } from './seed'

// localStorage-backed PostRepository. The only place (besides lib/storage and
// AuthContext) that touches persisted board data. Returns the exact REST list
// envelope and maps not-found to RepositoryError(404), so a future HTTP
// implementation is a drop-in replacement.

function readAll(): Post[] {
  ensureSeed()
  return readJSON<Post[]>(POSTS_KEY, [])
}

function writeAll(posts: Post[]): void {
  writeJSON(POSTS_KEY, posts)
}

function matchesQuery(post: Post, q?: string): boolean {
  if (!q) return true
  const needle = q.toLowerCase()
  return (
    post.title.toLowerCase().includes(needle) ||
    post.content.toLowerCase().includes(needle) ||
    post.author.name.toLowerCase().includes(needle)
  )
}

function comparatorFor(sort?: PostQuery['sort']): (a: Post, b: Post) => number {
  if (sort === 'views') {
    return (a, b) => b.views - a.views
  }
  // Default 'latest': newest createdAt first.
  return (a, b) => b.createdAt.localeCompare(a.createdAt)
}

export const localPostRepository: PostRepository = {
  async list(query: PostQuery): Promise<Page<Post>> {
    const all = readAll()
    const page = query.page ?? 1
    // No size => return the whole collection in one envelope. The list view
    // derives client-side filtering/paging; the repository just guarantees the
    // contract shape.
    const size = query.size ?? all.length

    return filterSortPaginate(all, {
      predicate: (p) =>
        matchesQuery(p, query.q) &&
        (!query.category || p.categoryId === query.category),
      comparator: comparatorFor(query.sort),
      page,
      size: size === 0 ? all.length : size,
    })
  },

  async get(id: string): Promise<Post> {
    const post = readAll().find((p) => p.id === id)
    if (!post) throw new RepositoryError('not found', 404)
    return post
  },

  async create(input: PostInput, author: User): Promise<Post> {
    const all = readAll()
    const now = new Date().toISOString()
    const post: Post = {
      id: newId(),
      title: input.title,
      content: input.content,
      categoryId: input.categoryId,
      author: { id: author.id, name: author.name, role: author.role },
      views: 0,
      createdAt: now,
      updatedAt: now,
    }
    writeAll([post, ...all])
    return post
  },

  async update(id: string, input: PostInput): Promise<Post> {
    const all = readAll()
    const idx = all.findIndex((p) => p.id === id)
    if (idx === -1) throw new RepositoryError('not found', 404)
    const updated: Post = {
      ...all[idx],
      title: input.title,
      content: input.content,
      categoryId: input.categoryId,
      updatedAt: new Date().toISOString(),
    }
    const next = all.slice()
    next[idx] = updated
    writeAll(next)
    return updated
  },

  async remove(id: string): Promise<void> {
    const all = readAll()
    const next = all.filter((p) => p.id !== id)
    if (next.length === all.length) throw new RepositoryError('not found', 404)
    writeAll(next)
  },

  async incrementViews(id: string): Promise<void> {
    const all = readAll()
    const idx = all.findIndex((p) => p.id === id)
    if (idx === -1) throw new RepositoryError('not found', 404)
    const next = all.slice()
    next[idx] = { ...next[idx], views: next[idx].views + 1 }
    writeAll(next)
  },
}
