import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Post } from '../types'
import { usePosts } from '../api/postQueries'
import { filterSortPaginate } from '../../../lib/paginate'
import SearchBar from '../../../components/SearchBar'
import CategoryFilter from '../../../components/CategoryFilter'
import SortSelect from '../../../components/SortSelect'
import Pagination from '../../../components/Pagination'
import Spinner from '../../../components/Spinner'
import ErrorState from '../../../components/ErrorState'
import EmptyState from '../../../components/EmptyState'
import PostList from '../components/PostList'
import styles from './BoardListPage.module.css'

const PAGE_SIZE = 20
type Sort = 'latest' | 'views'

function matchesQuery(post: Post, q: string): boolean {
  if (!q) return true
  const needle = q.toLowerCase()
  return (
    post.title.toLowerCase().includes(needle) ||
    post.content.toLowerCase().includes(needle) ||
    post.author.name.toLowerCase().includes(needle)
  )
}

const comparators: Record<Sort, (a: Post, b: Post) => number> = {
  latest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  views: (a, b) => b.views - a.views,
}

export default function BoardListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, isLoading, isError, error, refetch } = usePosts()

  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? undefined
  const sort: Sort = searchParams.get('sort') === 'views' ? 'views' : 'latest'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  // Filter/sort/paging are derived client-side from the single cached collection.
  const result = useMemo(() => {
    const items = data?.items ?? []
    return filterSortPaginate(items, {
      predicate: (p) =>
        matchesQuery(p, q) && (category ? p.categoryId === category : true),
      comparator: comparators[sort],
      page,
      size: PAGE_SIZE,
    })
  }, [data, q, category, sort, page])

  // Filter/sort/search changes reset to page 1 and replace history; page changes
  // push so back/forward step through pages.
  function updateFilters(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    params.delete('page')
    setSearchParams(params, { replace: true })
  }

  function changePage(nextPage: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(nextPage))
    setSearchParams(params)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>게시판</h1>
        <Link to="/posts/new" className={styles.write}>
          글쓰기
        </Link>
      </div>

      <div className={styles.controls}>
        <SearchBar value={q} onChange={(v) => updateFilters({ q: v })} />
        <CategoryFilter
          value={category}
          onChange={(id) => updateFilters({ category: id })}
        />
        <SortSelect value={sort} onChange={(v) => updateFilters({ sort: v })} />
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : result.items.length === 0 ? (
        <EmptyState message="게시글이 없습니다." />
      ) : (
        <>
          <PostList posts={result.items} />
          <Pagination
            page={result.page}
            total={result.total}
            size={result.size}
            onChange={changePage}
          />
        </>
      )}
    </div>
  )
}
