import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { PostInput, RepositoryError } from '../types'
import { usePost, useUpdatePost } from '../api/postQueries'
import { useAuth } from '../../auth/useAuth'
import { canEditPost } from '../../auth/permissions'
import PostForm from '../components/PostForm'
import Spinner from '../../../components/Spinner'
import ErrorState from '../../../components/ErrorState'
import NotFoundPage from '../../../pages/NotFoundPage'
import styles from './PostFormPage.module.css'

export default function PostEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: post, isLoading, isError, error } = usePost(id)
  const updatePost = useUpdatePost()

  if (isLoading) return <Spinner />

  if (isError) {
    if ((error as RepositoryError | null)?.status === 404) {
      return <NotFoundPage />
    }
    return <ErrorState error={error} />
  }

  if (!post) return <NotFoundPage />

  // Route-level permission: enforce even on direct URL entry, not just hidden
  // buttons (AC17). Redirect to the detail page if the user may not edit.
  if (!canEditPost(user, post)) {
    return <Navigate to={`/posts/${id}`} replace />
  }

  function handleSubmit(input: PostInput) {
    updatePost.mutate(
      { id, input },
      {
        onSuccess: () => navigate(`/posts/${id}`),
      },
    )
  }

  const initial: PostInput = {
    title: post.title,
    content: post.content,
    categoryId: post.categoryId,
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>글 수정</h1>
      {updatePost.isError && <ErrorState error={updatePost.error} />}
      <PostForm
        initial={initial}
        onSubmit={handleSubmit}
        submitting={updatePost.isPending}
      />
    </div>
  )
}
