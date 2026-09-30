import { Link, useNavigate } from 'react-router-dom'
import type { Post } from '../types'
import { useAuth } from '../../auth/useAuth'
import { canDeletePost, canEditPost } from '../../auth/permissions'
import { useDeletePost } from '../api/postQueries'
import styles from './PostActions.module.css'

interface PostActionsProps {
  post: Post
}

export default function PostActions({ post }: PostActionsProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const deletePost = useDeletePost()

  const canEdit = canEditPost(user, post)
  const canDelete = canDeletePost(user, post)

  if (!canEdit && !canDelete) return null

  function handleDelete() {
    if (!window.confirm('이 글을 삭제하시겠습니까?')) return
    deletePost.mutate(post.id, {
      onSuccess: () => navigate('/'),
    })
  }

  return (
    <div className={styles.actions}>
      {canEdit && (
        <Link to={`/posts/${post.id}/edit`} className={styles.edit}>
          수정
        </Link>
      )}
      {canDelete && (
        <button
          type="button"
          className={styles.delete}
          onClick={handleDelete}
          disabled={deletePost.isPending}
        >
          {deletePost.isPending ? '삭제 중…' : '삭제'}
        </button>
      )}
    </div>
  )
}
