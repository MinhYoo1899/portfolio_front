import { Outlet } from 'react-router-dom'
import Header from './Header'
import styles from './Layout.module.css'

// Common layout: the Header navigation above the routed page content.
export default function Layout() {
  return (
    <>
      <div className={styles.nav}>
        <Header />
      </div>
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  )
}
