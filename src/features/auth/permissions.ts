import type { User } from './types'
import type { Post } from '../posts/types'

// A user may edit a post if they are an admin or the post's author.
// Permission is checked at the route level (not just hidden buttons) so that
// directly navigating to an edit URL still enforces it (AC6/AC17).
export function canEditPost(user: User | null, post: Post): boolean {
  return !!user && (user.role === 'admin' || user.id === post.author.id)
}

// Delete uses the same rule as edit: admin or author.
export function canDeletePost(user: User | null, post: Post): boolean {
  return !!user && (user.role === 'admin' || user.id === post.author.id)
}
