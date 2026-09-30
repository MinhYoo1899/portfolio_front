import axios from 'axios'
import type { PostRepository } from './postRepository'
import type { Page, Post, PostInput, PostQuery } from '../types'
import { RepositoryError } from '../types'
import type { User } from '../../auth/types'
import { httpClient } from '../../../api/httpClient'

// Future Flask/REST implementation of PostRepository. Not active yet — exists to
// prove the contract compiles against an HTTP transport (AC12). Maps a 404
// response to RepositoryError(404) so callers branch identically to the local
// implementation.

function toRepositoryError(err: unknown): RepositoryError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    return new RepositoryError(err.message, status)
  }
  return new RepositoryError(
    err instanceof Error ? err.message : 'request failed',
  )
}

export const httpPostRepository: PostRepository = {
  async list(query: PostQuery): Promise<Page<Post>> {
    try {
      const res = await httpClient.get<Page<Post>>('/posts', { params: query })
      return res.data
    } catch (err) {
      throw toRepositoryError(err)
    }
  },

  async get(id: string): Promise<Post> {
    try {
      const res = await httpClient.get<Post>(`/posts/${id}`)
      return res.data
    } catch (err) {
      throw toRepositoryError(err)
    }
  },

  async create(input: PostInput, _author: User): Promise<Post> {
    // author is derived server-side from the auth session; body carries input.
    void _author
    try {
      const res = await httpClient.post<Post>('/posts', input)
      return res.data
    } catch (err) {
      throw toRepositoryError(err)
    }
  },

  async update(id: string, input: PostInput): Promise<Post> {
    try {
      const res = await httpClient.put<Post>(`/posts/${id}`, input)
      return res.data
    } catch (err) {
      throw toRepositoryError(err)
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await httpClient.delete(`/posts/${id}`)
    } catch (err) {
      throw toRepositoryError(err)
    }
  },

  async incrementViews(id: string): Promise<void> {
    try {
      await httpClient.post(`/posts/${id}/views`)
    } catch (err) {
      throw toRepositoryError(err)
    }
  },
}
