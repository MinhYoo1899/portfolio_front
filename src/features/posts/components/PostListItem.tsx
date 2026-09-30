import { Link } from 'react-router-dom'
import type { Post } from '../types'
import { CATEGORIES } from '../../categories/categories'
import { formatDate } from '../../../lib/date'
import styles from './PostListItem.module.css'

interface PostListItemProps {
  post: Post
}

function categoryName(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id
}

export default function PostListItem({ post }: PostListItemProps) {
  return (
    <li className={styles.item}>
      <Link to={`/posts/${post.id}`} className={styles.title}>
        {post.title}
      </Link>
      <div className={styles.meta}>
        <span className={styles.category}>{categoryName(post.categoryId)}</span>
        <span>{post.author.name}</span>
        <span>{formatDate(post.createdAt)}</span>
        <span>조회 {post.views}</span>
      </div>
    </li>
  )
}
