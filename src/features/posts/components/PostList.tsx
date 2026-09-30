import type { Post } from '../types'
import PostListItem from './PostListItem'
import styles from './PostList.module.css'

interface PostListProps {
  posts: Post[]
}

export default function PostList({ posts }: PostListProps) {
  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <PostListItem key={post.id} post={post} />
      ))}
    </ul>
  )
}
