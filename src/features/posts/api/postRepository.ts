import type { Page, Post, PostInput, PostQuery } from '../types'
import type { User } from '../../auth/types'

// Data-access contract. UI/hooks depend only on this; the active implementation
// (localStorage now, HTTP later) is chosen by repositoryProvider.
export interface PostRepository {
  list(q: PostQuery): Promise<Page<Post>>
  // Throws RepositoryError(404) when the post does not exist.
  get(id: string): Promise<Post>
  create(input: PostInput, author: User): Promise<Post>
  update(id: string, input: PostInput): Promise<Post>
  remove(id: string): Promise<void>
  // Explicit write (not a GET side effect) so read queries stay pure.
  incrementViews(id: string): Promise<void>
}
