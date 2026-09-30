import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { RepositoryError } from '../types'
import { usePost, useIncrementViews } from '../api/postQueries'
import PostMeta from '../components/PostMeta'
import MarkdownView from '../components/MarkdownView'
import PostActions from '../components/PostActions'
import Spinner from '../../../components/Spinner'
import ErrorState from '../../../components/ErrorState'
import NotFoundPage from '../../../pages/NotFoundPage'
import styles from './PostDetailPage.module.css'

// Session-scoped guard so a detail view increments the count exactly once per
// session, even with React StrictMode's double-mount in development.
const viewedThisSession = new Set<string>()

export default function PostDetailPage() {
  const { id = '' } = useParams()
  const { data: post, isLoading, isError, error } = usePost(id)
  const incrementViews = useIncrementViews()
  const mutate = incrementViews.mutate

  useEffect(() => {
    if (!post || viewedThisSession.has(id)) return
    // Mark before mutating so the StrictMode re-run sees it and skips.
    viewedThisSession.add(id)
    mutate(id)
  }, [post, id, mutate])

  if (isLoading) return <Spinner />

  if (isError) {
    if ((error as RepositoryError | null)?.status === 404) {
      return <NotFoundPage />
    }
    return <ErrorState error={error} />
  }

  if (!post) return <NotFoundPage />

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{post.title}</h1>
          <PostActions post={post} />
        </div>
        <PostMeta post={post} />
      </header>
      <hr className={styles.divider} />
      <MarkdownView content={post.content} />
    </article>
  )
}
