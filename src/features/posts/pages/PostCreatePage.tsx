import { useNavigate } from 'react-router-dom'
import type { PostInput } from '../types'
import { useCreatePost } from '../api/postQueries'
import { useAuth } from '../../auth/useAuth'
import PostForm from '../components/PostForm'
import ErrorState from '../../../components/ErrorState'
import styles from './PostFormPage.module.css'

export default function PostCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createPost = useCreatePost()

  // The route is behind RequireAuth, so a missing user is unexpected; guard anyway.
  if (!user) return <ErrorState message="로그인이 필요합니다." />

  function handleSubmit(input: PostInput) {
    createPost.mutate(
      { input, author: user! },
      {
        onSuccess: (post) => navigate(`/posts/${post.id}`),
      },
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>글쓰기</h1>
      {createPost.isError && <ErrorState error={createPost.error} />}
      <PostForm onSubmit={handleSubmit} submitting={createPost.isPending} />
    </div>
  )
}
