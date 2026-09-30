import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { PostInput } from '../types'
import { CATEGORIES, CATEGORY_IDS } from '../../categories/categories'
import styles from './PostForm.module.css'

interface PostFormProps {
  initial?: PostInput
  onSubmit: (input: PostInput) => void
  submitting?: boolean
}

interface Errors {
  title?: string
  content?: string
  categoryId?: string
}

const DEFAULT_CATEGORY = CATEGORY_IDS[0]

function validate(input: PostInput): Errors {
  const errors: Errors = {}

  const title = input.title.trim()
  if (title.length === 0) {
    errors.title = '제목을 입력하세요.'
  } else if (title.length > 120) {
    errors.title = '제목은 120자 이하여야 합니다.'
  }

  if (input.content.trim().length === 0) {
    errors.content = '본문을 입력하세요.'
  }

  if (!CATEGORY_IDS.includes(input.categoryId)) {
    errors.categoryId = '카테고리를 선택하세요.'
  }

  return errors
}

export default function PostForm({
  initial,
  onSubmit,
  submitting,
}: PostFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? DEFAULT_CATEGORY,
  )
  const [content, setContent] = useState(initial?.content ?? '')
  const [errors, setErrors] = useState<Errors>({})

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const input: PostInput = { title: title.trim(), content, categoryId }
    const found = validate(input)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSubmit(input)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="post-title" className={styles.label}>
          제목
        </label>
        <input
          id="post-title"
          type="text"
          className={styles.input}
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className={styles.error}>{errors.title}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="post-category" className={styles.label}>
          카테고리
        </label>
        <select
          id="post-category"
          className={styles.select}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-invalid={!!errors.categoryId}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className={styles.error}>{errors.categoryId}</p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="post-content" className={styles.label}>
          본문 (마크다운)
        </label>
        <textarea
          id="post-content"
          className={styles.textarea}
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-invalid={!!errors.content}
        />
        {errors.content && <p className={styles.error}>{errors.content}</p>}
      </div>

      <div className={styles.buttons}>
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? '저장 중…' : '저장'}
        </button>
        <Link to=".." relative="path" className={styles.cancel}>
          취소
        </Link>
      </div>
    </form>
  )
}
