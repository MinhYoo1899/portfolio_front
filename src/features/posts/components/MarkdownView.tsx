import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './MarkdownView.module.css'

interface MarkdownViewProps {
  content: string
}

// Renders markdown with GFM. Raw HTML is intentionally NOT enabled (no
// rehype-raw), so embedded HTML in post content cannot inject scripts (XSS-safe).
export default function MarkdownView({ content }: MarkdownViewProps) {
  return (
    <div className={styles.markdown}>
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  )
}
